import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Pool } from "pg";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const jwtSecretRaw = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!jwtSecretRaw) {
  throw new Error("JWT_SECRET environment variable is required to sign session tokens.");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required to connect to the database.");
}

const jwtSecret: Secret = jwtSecretRaw;

type TokenExpiry = SignOptions["expiresIn"];
const accessTokenExpiry: TokenExpiry =
  (process.env.JWT_EXPIRES_IN as TokenExpiry) ?? "2h";
const rememberTokenExpiry: TokenExpiry =
  (process.env.JWT_REMEMBER_EXPIRES_IN as TokenExpiry) ?? "30d";

const metaAppId = process.env.META_APP_ID;
const metaAppSecret = process.env.META_APP_SECRET;
const metaRedirectUriEnv = process.env.META_REDIRECT_URI?.trim();
const metaConfigId = process.env.META_CONFIG_ID;
const metaGraphVersion = process.env.META_GRAPH_API_VERSION ?? "v21.0";
const metaGraphBase = `https://graph.facebook.com/${metaGraphVersion}`;
const metaAuthUrl = `https://www.facebook.com/${metaGraphVersion}/dialog/oauth`;

const pool = new Pool({
  connectionString: databaseUrl,
});

const prismaAdapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new pkg.PrismaClient({
  adapter: prismaAdapter,
});

const resolveMetaRedirectUri = (req: Request): string => {
  if (metaRedirectUriEnv) {
    return metaRedirectUriEnv;
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
  if (!metaAppId) missing.push("META_APP_ID");
  if (!metaConfigId) missing.push("META_CONFIG_ID");
  if (missing.length > 0) {
    res.status(500).json({
      error: `Missing Meta environment variables: ${missing.join(", ")}`,
    });
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
  if (!metaAppSecret) {
    res.status(500).json({
      error: "META_APP_SECRET is required to exchange Meta codes for tokens.",
    });
    return false;
  }
  return true;
};

type InsightMetric = {
  name?: string;
  values?: Array<{ value?: number | Record<string, number>; end_time?: string }>;
};

type MetaAccountPage = {
  id?: string;
  name?: string;
  instagram_business_account?: {
    id?: string;
    username?: string;
    profile_picture_url?: string;
    followers_count?: number;
  };
};

type MetaMedia = {
  id?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  caption?: string;
  media_type?: string;
  permalink?: string;
};

const graphFetch = async <T extends Record<string, unknown>>(path: string, params: Record<string, string>) => {
  const url = new URL(`${metaGraphBase}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok || payload.error) {
    const message = payload.error?.message ?? `Meta Graph request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
};

const fetchMetaAccounts = async (
  accessToken: string,
  fields = "id,name,access_token,instagram_business_account",
) =>
  graphFetch<{ data?: MetaAccountPage[] }>(`me/accounts`, {
    access_token: accessToken,
    fields,
  });

const getInstagramPageFromUserToken = async (userToken: string) => {
  const payload = await fetchMetaAccounts(userToken);
  const accounts = payload.data ?? [];
  const page = accounts.find(
    (p) =>
      typeof p.instagram_business_account === "object" &&
      p.instagram_business_account !== null,
  );
  if (!page) {
    throw new Error("no_ig_linked_to_pages");
  }
  const insta = page.instagram_business_account as Record<string, string>;
  const pageAccessToken = typeof page.access_token === "string" ? page.access_token : undefined;
  if (!pageAccessToken) {
    throw new Error("missing_page_access_token");
  }
  return {
    pageId: page.id,
    igUserId: insta.id,
    pageAccessToken,
  };
};

const ensureMetaConnectionHasIgUser = async (connection: pkg.MetaConnection, page?: MetaAccountPage) => {
  if (connection.pageId && connection.igUserId) {
    return connection;
  }

  const resolvedPage = page ?? (await fetchMetaAccounts(connection.accessToken)).data?.[0];
  const pageId = typeof resolvedPage?.id === "string" ? resolvedPage.id : connection.pageId;
  const igUserId = resolvedPage?.instagram_business_account?.id ?? connection.igUserId;

  if ((pageId && pageId !== connection.pageId) || (igUserId && igUserId !== connection.igUserId)) {
    return await prisma.metaConnection.update({
      where: { id: connection.id },
      data: { pageId: pageId ?? connection.pageId, igUserId: igUserId ?? connection.igUserId },
    });
  }

  return connection;
};

const fetchInsights = async (
  accessToken: string,
  igUserId: string,
  metric: string,
  options?: { period?: string; since?: number; until?: number },
) => {
  const params: Record<string, string> = {
    access_token: accessToken,
    metric,
    period: options?.period ?? "day",
  };
  if (options?.since) params.since = String(options.since);
  if (options?.until) params.until = String(options.until);

  const result = await graphFetch<{ data?: InsightMetric[] }>(`${igUserId}/insights`, params);
  return result.data ?? [];
};

const fetchRecentMedia = async (accessToken: string, igUserId: string, limit = 12) => {
  const params: Record<string, string> = {
    access_token: accessToken,
    limit: String(limit),
    fields: "id,timestamp,like_count,comments_count,caption,media_type,permalink",
  };
  const result = await graphFetch<{ data?: MetaMedia[] }>(`${igUserId}/media`, params);
  return result.data ?? [];
};

const fetchMediaInsightValue = async (accessToken: string, mediaId: string, metric: string) => {
  try {
    const data = await graphFetch<{ data?: InsightMetric[] }>(
      `${mediaId}/insights`,
      {
        access_token: accessToken,
        metric,
        period: "lifetime",
      },
    );
    const value = data.data?.[0]?.values?.[0]?.value;
    return typeof value === "number" ? value : 0;
  } catch (error) {
    console.warn(`Failed to fetch media insight ${metric} for ${mediaId}`, error);
    return 0;
  }
};

const formatLabelFromDate = (timestamp?: string) => {
  if (!timestamp) {
    return "-";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const buildTrendSeries = (metricData: InsightMetric[] | undefined, maxPoints = 12) => {
  const entries = metricData?.[0]?.values?.filter((value) => typeof value.value === "number") ?? [];
  const sliced = entries.slice(-maxPoints);
  return {
    labels: sliced.map((value) => formatLabelFromDate(value.end_time)),
    values: sliced.map((value) => (typeof value.value === "number" ? value.value : 0)),
  };
};

const sumInsightValues = (metricData: InsightMetric[] | undefined) =>
  metricData?.[0]?.values?.reduce((total, entry) => {
    if (typeof entry.value === "number") {
      return total + entry.value;
    }
    return total;
  }, 0) ?? 0;

const buildWebsiteClicksMap = (metricData: InsightMetric[] | undefined) => {
  const map: Record<string, number> = {};
  const entries = metricData?.[0]?.values ?? [];
  entries.forEach((entry) => {
    if (!entry.end_time) {
      return;
    }
    const key = entry.end_time.split("T")[0];
    const value = typeof entry.value === "number" ? entry.value : 0;
    map[key] = value;
  });
  return map;
};

const buildGenderBreakdown = (valueObject?: Record<string, number>) => {
  if (!valueObject) {
    return { male: 0, female: 0, other: 0, buckets: [] as { label: string; male: number; female: number; other: number }[] };
  }

  let maleTotal = 0;
  let femaleTotal = 0;
  let otherTotal = 0;

  const bucketEntries = [
    { label: "13-17", matches: (range?: string) => range === "13-17" },
    { label: "18-24", matches: (range?: string) => range === "18-24" },
    { label: "25-34", matches: (range?: string) => range === "25-34" },
    {
      label: "35+",
      matches: (range?: string) => {
        if (!range) {
          return false;
        }
        const min = parseInt(range, 10);
        return !Number.isNaN(min) && min >= 35;
      },
    },
  ].map((bucket) => ({ ...bucket, male: 0, female: 0, other: 0 }));

  Object.entries(valueObject).forEach(([key, value]) => {
    if (typeof value !== "number") {
      return;
    }
    const [prefix, range] = key.split(".");
    if (!range) {
      return;
    }
    const gender = prefix?.toLowerCase();
    const targetBucket = bucketEntries.find((bucket) => bucket.matches(range));
    if (gender === "m") {
      maleTotal += value;
      if (targetBucket) {
        targetBucket.male += value;
      }
    } else if (gender === "f") {
      femaleTotal += value;
      if (targetBucket) {
        targetBucket.female += value;
      }
    } else {
      otherTotal += value;
      if (targetBucket) {
        targetBucket.other += value;
      }
    }
  });

  const buckets = bucketEntries.map((bucket) => {
    const total = bucket.male + bucket.female + bucket.other;
    const maxValue = total || 1;
    return {
      label: bucket.label,
      male: Math.round((bucket.male / maxValue) * 100),
      female: Math.round((bucket.female / maxValue) * 100),
      other: Math.round((bucket.other / maxValue) * 100),
    };
  });

  return {
    male: maleTotal,
    female: femaleTotal,
    other: otherTotal,
    buckets,
  };
};

const buildRegions = (metricData: InsightMetric[] | undefined) => {
  const valueObject = metricData?.[0]?.values?.[0]?.value;
  if (!valueObject || typeof valueObject !== "object") {
    return [] as { name: string; value: number; percentage: number }[];
  }

  const entries = Object.entries(valueObject).filter(([, value]) => typeof value === "number") as [string, number][];
  const total = entries.reduce((sum, [, num]) => sum + num, 0) || 1;

  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
    }));
};

const buildPostingHours = (media: MetaMedia[]) => {
  const hourMap: Record<number, number> = {};
  media.forEach((item) => {
    if (!item.timestamp) {
      return;
    }
    const date = new Date(item.timestamp);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const hour = date.getHours();
    const engagement = (item.like_count ?? 0) + (item.comments_count ?? 0);
    hourMap[hour] = (hourMap[hour] ?? 0) + engagement;
  });
  const hours = Array.from({ length: 24 }, (_, index) => index);
  return hours.map((hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    engagement: hourMap[hour] ?? 0,
  }));
};

type DbUserRow = {
  id: number;
  email: string;
  password?: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
};

type TokenPayload = {
  userId: number;
  email: string;
};

type AuthenticatedRequest = Request & {
  auth?: TokenPayload;
};

const createToken = (payload: TokenPayload, remember = false): string => {
  const expiresIn: TokenExpiry = remember ? rememberTokenExpiry : accessTokenExpiry;
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, jwtSecret, options);
};

const hashPassword = (password: string) => bcrypt.hash(password, 12);
const comparePasswords = (password: string, hash: string) => bcrypt.compare(password, hash);

const safeUser = (user: DbUserRow) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
});

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization ?? (req.headers.Authorization as string | undefined);
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing or malformed." });
    return;
  }

  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload & TokenPayload;
    if (!payload.userId || !payload.email) {
      res.status(401).json({ error: "Invalid session token." });
      return;
    }
    (req as AuthenticatedRequest).auth = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired session token." });
  }
};

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/users", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query<DbUserRow>(`
      SELECT id, email, name, "isActive", "createdAt", "updatedAt", "lastLogin"
      FROM "User"
      ORDER BY id;
    `);
    res.json(result.rows.map(safeUser));
  } catch (error) {
    next(error);
  }
});

app.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    const existing = await pool.query<{ id: number }>(`
      SELECT id
      FROM "User"
      WHERE email = $1;
    `, [email]);

    if (existing.rowCount > 0) {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const trimmedName = typeof name === "string" ? name.trim() : "";

    const result = await pool.query<DbUserRow>(`
      INSERT INTO "User" ("email", password, name, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, email, name, "isActive", "createdAt", "updatedAt", "lastLogin";
    `, [email, hashedPassword, trimmedName || null]);

    const user = result.rows[0];
    const token = createToken({ userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const result = await pool.query<DbUserRow>(`
      SELECT id, email, name, password, "isActive", "createdAt", "updatedAt", "lastLogin"
      FROM "User"
      WHERE email = $1;
    `, [email]);
    const user = result.rows[0];

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const passwordMatches = await comparePasswords(password, user.password);
    if (!passwordMatches) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const rememberFlag = remember === true || remember === "true";
    const token = createToken({ userId: user.id, email: user.email }, rememberFlag);

    await pool.query(`
      UPDATE "User"
      SET "lastLogin" = $1
      WHERE id = $2;
    `, [new Date(), user.id]);

    res.json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  try {
    const result = await pool.query<DbUserRow>(`
      SELECT id, email, name, "isActive", "createdAt", "updatedAt", "lastLogin"
      FROM "User"
      WHERE id = $1;
    `, [userId]);
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/meta/login", (req: Request, res: Response) => {
  if (!ensureMetaRedirectConfig(req, res)) {
    return;
  }

  const redirectUri = resolveMetaRedirectUri(req);
  const params = new URLSearchParams({
    client_id: metaAppId!,
    config_id: metaConfigId!,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  if (state) {
    params.set("state", state);
  }

  res.redirect(`${metaAuthUrl}?${params.toString()}`);
});

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
    <title>Instagram接続 ${options.status === "success" ? "完了" : "エラー"}</title>
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

app.get("/auth/meta/callback", async (req: Request, res: Response, next: NextFunction) => {
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
      client_id: metaAppId!,
      redirect_uri: redirectUri,
      client_secret: metaAppSecret!,
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

    const pageLink = await getInstagramPageFromUserToken(accessToken);

    const latestConnection = await prisma.metaConnection.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const dataToSave = {
      accessToken: pageLink.pageAccessToken,
      expiresAt,
      pageId: pageLink.pageId ?? undefined,
      igUserId: pageLink.igUserId ?? undefined,
    };

    const connection = latestConnection
      ? await prisma.metaConnection.update({
          where: { id: latestConnection.id },
          data: dataToSave,
        })
      : await prisma.metaConnection.create({
          data: dataToSave,
        });

    res.redirect("https://localhost:3000/settings?connected=1");
  } catch (error) {
    next(error);
  }
});

app.get("/api/meta/debug", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.metaConnection.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!connection) {
      res.status(404).json({ error: "No Meta connection record found yet." });
      return;
    }

    const { data: accounts = [] } = await fetchMetaAccounts(
      connection.accessToken,
      "id,name,instagram_business_account",
    );
    if (accounts.length === 0) {
      res.status(404).json({
        error: "Meta returned zero Pages -- make sure the config_id grants access.",
      });
      return;
    }

    const page = accounts[0];
    const pageId = typeof page.id === "string" ? page.id : null;
    const instagramAccount =
      typeof page.instagram_business_account === "object" && page.instagram_business_account !== null
        ? page.instagram_business_account as Record<string, unknown>
        : undefined;

    if (!instagramAccount || typeof instagramAccount.id !== "string") {
      res.status(422).json({
        error: "no_ig_linked_to_pages",
        details: accounts,
      });
      return;
    }

    const updatedConnection = await ensureMetaConnectionHasIgUser(connection, page);

    const metaConnectionSafe = {
      id: updatedConnection.id,
      pageId: updatedConnection.pageId,
      igUserId: updatedConnection.igUserId,
      expiresAt: updatedConnection.expiresAt?.toISOString?.() ?? null,
    };

    res.json({
      metaConnection: metaConnectionSafe,
      page: {
        id: pageId,
        instagram_business_account: instagramAccount,
        name: typeof page.name === "string" ? page.name : undefined,
      },
      accounts,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/meta/connection", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.metaConnection.deleteMany({});
    if (deleted.count === 0) {
      res.status(404).json({ error: "No Meta connection exists to delete." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/instagram", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.metaConnection.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (connection) {
      console.log("dashboard/instagram: MetaConnection", {
        userId: connection.userId ?? null,
        pageId: connection.pageId,
        igUserId: connection.igUserId,
        expiresAt: connection.expiresAt?.toISOString?.() ?? null,
      });
    }

    if (!connection) {
      res.status(404).json({ error: "meta_connection_not_found" });
      return;
    }

    if (!connection.igUserId) {
      res.status(422).json({ error: "ig_user_not_linked" });
      return;
    }

    if (!connection) {
      res.status(404).json({ error: "No Meta connection record found yet." });
      return;
    }

    const { data: accounts = [] } = await fetchMetaAccounts(connection.accessToken);
    if (accounts.length === 0) {
      res.status(404).json({
        error: "Meta returned zero Pages -- make sure the config_id grants access.",
      });
      return;
    }

    const page = accounts[0];
    const updatedConnection = await ensureMetaConnectionHasIgUser(connection, page);

    if (!updatedConnection.igUserId) {
      res.status(404).json({ error: "Instagram business account is not yet linked." });
      return;
    }

    const igUserId = updatedConnection.igUserId;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const sinceSeconds = nowSeconds - 14 * 86400;

    const [
      followerCounts,
      impressions,
      reach,
      profileViews,
      websiteClicks,
      genderAge,
      cities,
    ] = await Promise.all([
      fetchInsights(updatedConnection.accessToken, igUserId, "audience_follower_count", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "impressions", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "reach", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "profile_views", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "website_clicks", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "audience_gender_age", {
        period: "lifetime",
      }),
      fetchInsights(updatedConnection.accessToken, igUserId, "audience_city", {
        period: "lifetime",
      }),
    ]);

    const accountFields = await graphFetch<{
      id?: string;
      name?: string;
      username?: string;
      biography?: string;
      profile_picture_url?: string;
      followers_count?: number;
      media_count?: number;
    }>(`${igUserId}`, {
      access_token: updatedConnection.accessToken,
      fields: "id,name,username,biography,profile_picture_url,followers_count,media_count",
    });

    const recentMedia = await fetchRecentMedia(updatedConnection.accessToken, igUserId, 12);
    const savedCounts = await Promise.all(
      recentMedia.map((media) =>
        media.id ? fetchMediaInsightValue(updatedConnection.accessToken, media.id, "saved") : Promise.resolve(0),
      ),
    );

    const followerTrend = buildTrendSeries(followerCounts, 12);
    const websiteClicksByDate = buildWebsiteClicksMap(websiteClicks);

    const mediaLabels = recentMedia.map((media) => formatLabelFromDate(media.timestamp));
    const likes = recentMedia.map((media) => media.like_count ?? 0);
    const comments = recentMedia.map((media) => media.comments_count ?? 0);
    const saves = savedCounts;
    const siteClicks = recentMedia.map((media) => {
      if (!media.timestamp) {
        return 0;
      }
      const key = media.timestamp.split("T")[0];
      return websiteClicksByDate[key] ?? 0;
    });

    const normalizedLabels = mediaLabels.length ? mediaLabels : ["-"];
    const normalizedLikes = likes.length ? likes : [0];
    const normalizedComments = comments.length ? comments : [0];
    const normalizedSaves = saves.length ? saves : [0];
    const normalizedSiteClicks = siteClicks.length ? siteClicks : [0];

    const actionSummary = {
      likes: normalizedLikes.reduce((total, value) => total + value, 0),
      comments: normalizedComments.reduce((total, value) => total + value, 0),
      saves: normalizedSaves.reduce((total, value) => total + value, 0),
      siteClicks: normalizedSiteClicks.reduce((total, value) => total + value, 0),
    };

    const genderBreakdown = buildGenderBreakdown(genderAge[0]?.values?.[0]?.value);
    const genderTotals = genderBreakdown.male + genderBreakdown.female + genderBreakdown.other || 1;
    const genderRatio = {
      male: Math.round((genderBreakdown.male / genderTotals) * 100),
      female: Math.round((genderBreakdown.female / genderTotals) * 100),
      other: Math.round((genderBreakdown.other / genderTotals) * 100),
    };

    res.json({
      account: {
        id: accountFields.id,
        name: accountFields.name,
        username: accountFields.username,
        biography: accountFields.biography,
        profilePictureUrl: accountFields.profile_picture_url,
        followersCount: accountFields.followers_count ?? 0,
        mediaCount: accountFields.media_count ?? 0,
      },
      summary: {
        followers: accountFields.followers_count ?? 0,
        profileViews: sumInsightValues(profileViews),
        totalImpressions: sumInsightValues(impressions),
        totalReach: sumInsightValues(reach),
      },
      followerTrend,
      actionTrend: {
        labels: normalizedLabels,
        likes: normalizedLikes,
        comments: normalizedComments,
        saves: normalizedSaves,
        siteClicks: normalizedSiteClicks,
      },
      actionSummary,
      genderByPeriod: genderBreakdown.buckets,
      genderRatio,
      regions: buildRegions(cities),
      postingHours: buildPostingHours(recentMedia),
    });
  } catch (error) {
    next(error);
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found." });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error", error);
  res.status(500).json({ error: "Unexpected server error." });
});

const PORT = Number(process.env.PORT) || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    void pool.end();
    void prisma.$disconnect();
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
