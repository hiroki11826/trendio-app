import "dotenv/config";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ensureMetaConnectionHasIgUser,
  getInstagramPageFromUserToken,
  graphFetch,
  GraphApiError,
} from "./services/metaGraph.js";
import {
  metaCallback,
  metaLogin,
  setMetaPrismaClient,
} from "../routes/metaAuth.js";

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

const pool = new Pool({
  connectionString: databaseUrl,
});

const prismaAdapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({
  adapter: prismaAdapter,
});

setMetaPrismaClient(prisma);

const isDevelopment = (process.env.NODE_ENV ?? "development") !== "production";
const serverLogPath = path.resolve(process.cwd(), "..", "server.log");
const logErrorToFile = (entry: Record<string, unknown>) => {
  const line = `[${new Date().toISOString()}] ${JSON.stringify(entry)}\n`;
  void appendFile(serverLogPath, line).catch((appendError) => {
    console.error("Failed to append server log entry", appendError);
  });
};

type InsightMetric = {
  name?: string;
  values?: Array<{ value?: number | Record<string, number>; end_time?: string }>;
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

  const logParams = new URLSearchParams(params);
  logParams.delete("access_token");
  const queryString = logParams.toString();
  const graphEndpointLog = `/${igUserId}/insights${queryString ? `?${queryString}` : ""}`;
  console.log("Meta Graph (fetchInsights):", graphEndpointLog);

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
    const key = entry.end_time.split("T")[0] as string;
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

    if ((existing.rowCount ?? 0) > 0) {
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
    if (!user) {
      res.status(500).json({ error: "Failed to create user." });
      return;
    }
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

app.get("/api/meta/login", metaLogin);
app.get("/auth/meta/login", metaLogin);
app.get("/auth/meta/callback", metaCallback);

app.get("/api/meta/debug", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.metaConnection.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!connection) {
      res.status(404).json({ error: "No Meta connection record found yet." });
      return;
    }

    const metaConnectionSafe = {
      id: connection.id,
      pageId: connection.pageId ?? null,
      igUserId: connection.igUserId ?? null,
      expiresAt: connection.expiresAt?.toISOString?.() ?? null,
      hasPageAccessToken: Boolean(connection.pageAccessToken),
    };

    res.json({
      metaConnection: metaConnectionSafe,
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
        pageId: connection.pageId,
        igUserId: connection.igUserId,
        expiresAt: connection.expiresAt?.toISOString?.() ?? null,
      });
    }

    if (!connection) {
      res.status(404).json({ error: "meta_connection_not_found" });
      return;
    }

    if (!connection.pageAccessToken) {
      res.status(422).json({ error: "page_token_missing" });
      return;
    }

    if (!connection.igUserId) {
      res.status(404).json({ error: "Instagram business account is not yet linked." });
      return;
    }

    const igUserId = connection.igUserId;
    const pageToken = connection.pageAccessToken;
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
      fetchInsights(pageToken, igUserId, "audience_follower_count", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(pageToken, igUserId, "impressions", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(pageToken, igUserId, "reach", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(pageToken, igUserId, "profile_views", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(pageToken, igUserId, "website_clicks", {
        since: sinceSeconds,
        until: nowSeconds,
      }),
      fetchInsights(pageToken, igUserId, "audience_gender_age", {
        period: "lifetime",
      }),
      fetchInsights(pageToken, igUserId, "audience_city", {
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
      access_token: pageToken,
      fields: "id,name,username,biography,profile_picture_url,followers_count,media_count",
    });

    const recentMedia = await fetchRecentMedia(pageToken, igUserId, 12);
    const savedCounts = await Promise.all(
      recentMedia.map((media) =>
        media.id ? fetchMediaInsightValue(pageToken, media.id, "saved") : Promise.resolve(0),
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
      const key = media.timestamp.split("T")[0] as string;
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

    const genderAgeValue = genderAge[0]?.values?.[0]?.value;
    const genderBreakdown = buildGenderBreakdown(
      typeof genderAgeValue === "object" && genderAgeValue !== null ? (genderAgeValue as Record<string, number>) : undefined,
    );
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
  if (res.headersSent) {
    console.error("Server error after headers sent", error);
    return;
  }

  const finalStatus = res.statusCode >= 400 ? res.statusCode : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const graphInfo = error instanceof GraphApiError ? error.graph : undefined;

  const responsePayload: Record<string, unknown> = {
    error: "server_error",
    status: finalStatus,
    message,
  };

  if (graphInfo) {
    responsePayload.graph = graphInfo;
    responsePayload.body = graphInfo.body;
  }
  if (error instanceof GraphApiError && error.endpoint) {
    responsePayload.endpoint = error.endpoint;
  }
  if (isDevelopment && error instanceof Error && error.stack) {
    responsePayload.stack = error.stack;
  }

  const logEntry: Record<string, unknown> = {
    error: "server_error",
    status: finalStatus,
    message,
  };
  if (graphInfo) {
    logEntry.graph = graphInfo;
    logEntry.body = graphInfo.body;
  }
  if (error instanceof GraphApiError && error.endpoint) {
    logEntry.endpoint = error.endpoint;
  }
  if (isDevelopment && error instanceof Error && error.stack) {
    logEntry.stack = error.stack;
  }

  console.error("Server error", logEntry);
  logErrorToFile(logEntry);

  res.status(finalStatus).json(responsePayload);
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
