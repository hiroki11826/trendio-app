import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";
import {
  ensureMetaConnectionHasIgUser,
  getInstagramPageFromUserToken,
  metaAuthUrl,
  metaGraphBase,
} from "../src/services/metaGraph.js";

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI?.trim();
const META_CONFIG_ID = process.env.META_CONFIG_ID?.trim() || "";

const SCOPE = [
  "instagram_business_basic",
  "instagram_manage_insights",
  "instagram_business_manage_messages",
  "instagram_manage_comments",
].join(",");

let prismaClient: PrismaClient | null = null;

export const setMetaPrismaClient = (client: PrismaClient) => {
  prismaClient = client;
};

const resolveMetaRedirectUri = (req: Request): string => {
  if (META_REDIRECT_URI) {
    return META_REDIRECT_URI;
  }

  const host = req.get("host");
  if (!host) {
    throw new Error(
      "Unable to determine META_REDIRECT_URI: set META_REDIRECT_URI or ensure the Host header is present in requests.",
    );
  }

  return `${req.protocol}://${host}/auth/meta/callback`;
};

const ensureMetaRedirectConfig = (req: Request, res: Response): boolean => {
  const missing: string[] = [];
  if (!META_APP_ID) missing.push("META_APP_ID");
  if (!META_CONFIG_ID) missing.push("META_CONFIG_ID");
  if (missing.length > 0) {
    res
      .status(500)
      .json({ error: `Missing Meta environment variables: ${missing.join(", ")}` });
    return false;
  }

  try {
    resolveMetaRedirectUri(req);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return false;
  }

  return true;
};

const ensureMetaSecret = (res: Response): boolean => {
  if (!META_APP_SECRET) {
    res.status(500).json({
      error: "META_APP_SECRET is required to exchange Meta codes for tokens.",
    });
    return false;
  }
  return true;
};

const renderCallbackPage = (options: {
  status: "success" | "error";
  message: string;
  payload?: Record<string, unknown>;
}) => {
  const safePayload = options.payload ? JSON.stringify(options.payload) : "null";
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Instagram ${options.status === "success" ? "接続完了" : "エラー"}</title>
    <style>
      body { font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#f6f8fb; color:#222; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
      .card { padding:24px; border-radius:16px; box-shadow:0 12px 48px rgba(15,23,42,.15); background:#fff; text-align:center; max-width:360px; }
      .status { font-size:32px; margin-bottom:12px; }
      .message { font-size:16px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="status">${options.status === "success" ? "✅" : "❌"}</div>
      <p class="message">${options.message}</p>
    </div>
    <script>
      const message = {
        type: "META_CONNECTION",
        status: "${options.status}",
        message: ${JSON.stringify(options.message)},
        payload: ${safePayload},
      };
      if (window.opener) {
        window.opener.postMessage(message, window.opener.origin || "*");
      }
      setTimeout(() => window.close(), 1200);
    </script>
  </body>
</html>`;
};

export function metaLogin(req: Request, res: Response) {
  if (!ensureMetaRedirectConfig(req, res)) {
    return;
  }

  const redirectUri = resolveMetaRedirectUri(req);
  const params = new URLSearchParams({
    client_id: META_APP_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  if (META_CONFIG_ID) {
    params.set("config_id", META_CONFIG_ID);
  }

  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  if (state) {
    params.set("state", state);
  }

  res.redirect(`${metaAuthUrl}?${params.toString()}`);
}

const getPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    throw new Error("Prisma client is not initialized for Meta auth routes.");
  }
  return prismaClient;
};

export async function metaCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!ensureMetaRedirectConfig(req, res) || !ensureMetaSecret(res)) {
      return;
    }

    const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
    if (!code) {
      res.status(400).json({ error: "Meta authorization `code` is required." });
      return;
    }

    const redirectUri = resolveMetaRedirectUri(req);

    const tokenParams = new URLSearchParams({
      client_id: META_APP_ID!,
      redirect_uri: redirectUri,
      client_secret: META_APP_SECRET!,
      code,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(`${metaGraphBase}/oauth/access_token?${tokenParams.toString()}`);
    const tokenPayload = (await tokenResponse.json()) as Record<string, unknown>;
    if (!tokenResponse.ok) {
      res.status(502).json({
        error: "Failed to exchange Meta code for a token.",
        details: tokenPayload,
      });
      return;
    }

    const accessToken = typeof tokenPayload.access_token === "string" ? tokenPayload.access_token : undefined;
    if (!accessToken) {
      res.status(502).json({
        error: "Meta response did not include an access_token.",
        details: tokenPayload,
      });
      return;
    }

    const expiresIn =
      typeof tokenPayload.expires_in === "number"
        ? tokenPayload.expires_in
        : typeof tokenPayload.expires_in === "string"
        ? Number(tokenPayload.expires_in)
        : undefined;

    const expiresAt = expiresIn
      ? new Date(Date.now() + Math.round(expiresIn) * 1000)
      : new Date();

    const preferredPageId = (() => {
      const direct = typeof req.query.preferredPageId === "string" ? req.query.preferredPageId.trim() : "";
      if (direct) {
        return direct;
      }
      const missingPageId = typeof req.query.pageId === "string" ? req.query.pageId.trim() : "";
      if (missingPageId) {
        return missingPageId;
      }
      const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
      if (!state) {
        return undefined;
      }
      try {
        const parsed = JSON.parse(state) as Record<string, unknown>;
        const value = typeof parsed.preferredPageId === "string" ? parsed.preferredPageId.trim() : "";
        return value || undefined;
      } catch {
        return undefined;
      }
    })();

    const pageLink = await getInstagramPageFromUserToken(accessToken, preferredPageId);

    const prisma = getPrismaClient();
    const latestConnection = await prisma.metaConnection.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const dataToSave = {
      accessToken,
      pageAccessToken: pageLink.pageAccessToken,
      expiresAt,
      pageId: pageLink.pageId ?? null,
      igUserId: pageLink.igUserId ?? null,
    };

    const connection = latestConnection
      ? await prisma.metaConnection.update({
          where: { id: latestConnection.id },
          data: dataToSave,
        })
      : await prisma.metaConnection.create({
          data: dataToSave,
        });

    await ensureMetaConnectionHasIgUser(prisma, connection, pageLink);

    res.redirect("https://localhost:3000/settings?connected=1");
  } catch (error) {
    next(error);
  }
}
