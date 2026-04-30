import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
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
const JWT_SECRET = process.env.JWT_SECRET;

const SCOPE = [
  "email",
  "public_profile",
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
  // META_CONFIG_IDはオプション
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
  locale?: string;
}) => {
  const safePayload = options.payload ? JSON.stringify(options.payload) : "null";
  const isJapanese = options.locale?.startsWith("ja");
  const lang = isJapanese ? "ja" : "en";
  const title = options.status === "success"
    ? (isJapanese ? "Instagram 接続完了" : "Instagram Connection Complete")
    : (isJapanese ? "Instagram エラー" : "Instagram Error");
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
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

  // Get JWT token from query parameter
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
  
  // Get locale from query parameter (default to English)
  const locale = typeof req.query.locale === "string" ? req.query.locale.trim() : "en_US";

  const redirectUri = resolveMetaRedirectUri(req);
  const params = new URLSearchParams({
    client_id: META_APP_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    locale: locale,
  });

  // スコープを常に明示的に指定（Config IDの有無に関わらず）
  const requiredScopes = [
    "email",
    "public_profile", 
    "pages_show_list",
    "pages_read_engagement",
    "pages_read_user_content",
    "instagram_basic",
    "instagram_manage_insights",
    "instagram_manage_comments",
    "business_management"
  ].join(",");
  
  params.set("scope", requiredScopes);

  if (META_CONFIG_ID) {
    params.set("config_id", META_CONFIG_ID);
  }

  // Pass token and locale in state for callback to retrieve userId and language
  const stateObj: Record<string, string> = {};
  const originalState = typeof req.query.state === "string" ? req.query.state.trim() : "";
  if (originalState) {
    stateObj.originalState = originalState;
  }
  if (token) {
    stateObj.token = token;
  }
  if (locale) {
    stateObj.locale = locale;
  }
  
  if (Object.keys(stateObj).length > 0) {
    params.set("state", JSON.stringify(stateObj));
  }

  const authUrl = `${metaAuthUrl}?${params.toString()}`;
  
  // デバッグログ
  console.log(`[metaLogin] Auth URL: ${authUrl}`);
  console.log(`[metaLogin] Scopes requested: ${requiredScopes}`);
  console.log(`[metaLogin] META_CONFIG_ID: ${META_CONFIG_ID || 'not set'}`);

  res.redirect(authUrl);
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
  // デバッグログ用
  const logDebug = (msg: string) => {
    console.log(`[metaCallback] ${msg}`);
  };

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
    logDebug(`Redirect URI: ${redirectUri}`);
    logDebug(`Code received: ${code.substring(0, 20)}...`);

    const tokenParams = new URLSearchParams({
      client_id: META_APP_ID!,
      redirect_uri: redirectUri,
      client_secret: META_APP_SECRET!,
      code,
      grant_type: "authorization_code",
    });

    logDebug(`Token exchange URL: ${metaGraphBase}/oauth/access_token`);
    const tokenResponse = await fetch(`${metaGraphBase}/oauth/access_token?${tokenParams.toString()}`);
    const tokenPayload = (await tokenResponse.json()) as Record<string, unknown>;
    
    logDebug(`Token response status: ${tokenResponse.status}`);
    logDebug(`Token payload keys: ${Object.keys(tokenPayload).join(', ')}`);
    
    if (!tokenResponse.ok) {
      logDebug(`Token exchange failed: ${JSON.stringify(tokenPayload)}`);
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

    logDebug(`Access token received: ${accessToken.substring(0, 30)}...`);
    logDebug(`Token length: ${accessToken.length}`);

    // トークンのデバッグ情報を取得
    try {
      const debugUrl = `${metaGraphBase}/debug_token?input_token=${accessToken}&access_token=${META_APP_ID}|${META_APP_SECRET}`;
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      logDebug(`Token debug info: ${JSON.stringify(debugData, null, 2)}`);
    } catch (debugError) {
      logDebug(`Failed to get token debug info: ${String(debugError)}`);
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

    // Extract userId from JWT token in state
    const userId = (() => {
      const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
      if (!state) return null;
      try {
        const parsed = JSON.parse(state) as Record<string, unknown>;
        const token = typeof parsed.token === "string" ? parsed.token : "";
        if (!token || !JWT_SECRET) return null;
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId?: number };
        return payload.userId ?? null;
      } catch {
        return null;
      }
    })();

    // Extract locale from state
    const locale = (() => {
      const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
      if (!state) return "en_US";
      try {
        const parsed = JSON.parse(state) as Record<string, unknown>;
        return typeof parsed.locale === "string" ? parsed.locale : "en_US";
      } catch {
        return "en_US";
      }
    })();

    // 既知のページIDをフォールバックとして使用
    const fallbackPageId = preferredPageId || "1029155523613404";
    logDebug(`Using fallback page ID: ${fallbackPageId}`);
    const pageLink = await getInstagramPageFromUserToken(accessToken, fallbackPageId);

    const prisma = getPrismaClient();
    
    // Find existing connection for this user (if userId is available)
    const existingConnection = userId
      ? await prisma.metaConnection.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.metaConnection.findFirst({
          orderBy: { createdAt: "desc" },
        });

    const dataToSave = {
      accessToken,
      pageAccessToken: pageLink.pageAccessToken,
      expiresAt,
      pageId: pageLink.pageId ?? null,
      igUserId: pageLink.igUserId ?? null,
      userId: userId,
    };

    const connection = existingConnection
      ? await prisma.metaConnection.update({
          where: { id: existingConnection.id },
          data: dataToSave,
        })
      : await prisma.metaConnection.create({
          data: dataToSave,
        });

    await ensureMetaConnectionHasIgUser(prisma, connection, pageLink);

    // ポップアップを閉じて親ウィンドウに通知するHTMLを返す
    const isJapanese = locale.startsWith("ja");
    const successMessage = isJapanese ? "Instagram連携が完了しました" : "Instagram connection completed successfully";
    res.send(renderCallbackPage({
      status: "success",
      message: successMessage,
      payload: {
        pageId: pageLink.pageId,
        igUserId: pageLink.igUserId,
      },
      locale,
    }));
  } catch (error) {
    next(error);
  }
}
