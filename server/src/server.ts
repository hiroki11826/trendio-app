import "dotenv/config";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Pool } from "pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ensureMetaConnectionHasIgUser,
  getInstagramPageFromUserToken,
  graphFetch,
  graphPost,
  GraphApiError,
} from "./services/metaGraph.js";
import {
  metaCallback,
  metaLogin,
  setMetaPrismaClient,
} from "../routes/metaAuth.js";
import {
  tiktokCallback,
  tiktokLogin,
  setTikTokPrismaClient,
} from "../routes/tiktokAuth.js";
import {
  getUserInfo,
  getVideoList,
  TikTokApiError,
} from "./services/tiktokApi.js";
import {
  generateContentIdeas,
  generateScript,
  analyzeTrends,
  generateInsightReport,
  generateCommentReply,
  GrokApiError,
} from "./services/grokApi.js";
import {
  analyzeInstagramTrends,
} from "./services/instagramTrends.js";

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
setTikTokPrismaClient(prisma);

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
  total_value?: {
    breakdowns?: Array<{
      dimension_keys?: string[];
      results?: Array<{
        dimension_values?: string[];
        value?: number;
      }>;
    }>;
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

const fetchInsights = async (
  accessToken: string,
  igUserId: string,
  metric: string,
  options?: { period?: string; since?: number; until?: number; metric_type?: string; breakdown?: string; timeframe?: string },
) => {
  const params: Record<string, string> = {
    access_token: accessToken,
    metric,
    period: options?.period ?? "day",
  };
  if (options?.since) params.since = String(options.since);
  if (options?.until) params.until = String(options.until);
  if (options?.metric_type) params.metric_type = options.metric_type;
  if (options?.breakdown) params.breakdown = options.breakdown;
  if (options?.timeframe) params.timeframe = options.timeframe;

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

const buildGenderBreakdownFromResults = (metricData: InsightMetric[] | undefined) => {
  const results = metricData?.[0]?.total_value?.breakdowns?.[0]?.results;
  if (!results || results.length === 0) {
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
        const parts = range.split("-");
        const min = parseInt(parts[0] ?? "", 10);
        return !Number.isNaN(min) && min >= 35;
      },
    },
  ].map((bucket) => ({ ...bucket, male: 0, female: 0, other: 0 }));

  results.forEach((result) => {
    const [ageRange, gender] = result.dimension_values ?? [];
    const value = result.value ?? 0;
    
    if (!ageRange || !gender) {
      return;
    }

    const genderLower = gender.toLowerCase();
    const targetBucket = bucketEntries.find((bucket) => bucket.matches(ageRange));

    if (genderLower === "m") {
      maleTotal += value;
      if (targetBucket) {
        targetBucket.male += value;
      }
    } else if (genderLower === "f") {
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

const buildRegionsFromResults = (cityData: InsightMetric[] | undefined, countryData: InsightMetric[] | undefined) => {
  const cityResults = cityData?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
  const countryResults = countryData?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];

  const combined: Array<{ name: string; value: number }> = [];

  cityResults.forEach((result) => {
    const name = result.dimension_values?.[0];
    const value = result.value ?? 0;
    if (name) {
      combined.push({ name, value });
    }
  });

  countryResults.forEach((result) => {
    const code = result.dimension_values?.[0];
    const value = result.value ?? 0;
    if (code) {
      combined.push({ name: code, value });
    }
  });

  const total = combined.reduce((sum, item) => sum + item.value, 0) || 1;

  return combined
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((item) => ({
      name: item.name,
      value: item.value,
      percentage: Number(((item.value / total) * 100).toFixed(1)),
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
    (req as any).user = { userId: payload.userId, email: payload.email }; // For compatibility
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired session token." });
  }
};

// Alias for consistency
const authenticateToken = authMiddleware;

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://app.snsinsight.jp', 'https://trendio.jp', 'https://app.trendio.jp'],
  credentials: true,
}));
app.use(cookieParser());
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

app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
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

app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
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

app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

app.get("/api/auth/meta/login", metaLogin);

app.get("/api/auth/meta/callback", metaCallback);

app.get("/api/auth/tiktok/login", tiktokLogin);

app.get("/api/auth/tiktok/callback", tiktokCallback);

// Get TikTok connection status
app.get("/api/tiktok/connection", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const connection = await prisma.tikTokConnection.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!connection) {
      res.status(404).json({ error: "tiktok_connection_not_found" });
      return;
    }

    // Get user info from TikTok
    try {
      const userInfo = await getUserInfo(connection.accessToken);
      
      res.json({
        connection: {
          id: connection.id,
          openId: connection.openId,
          expiresAt: connection.expiresAt?.toISOString() ?? null,
          createdAt: connection.createdAt.toISOString(),
          updatedAt: connection.updatedAt.toISOString(),
        },
        user: {
          displayName: userInfo.display_name,
          username: userInfo.union_id ?? userInfo.open_id,
          avatarUrl: userInfo.avatar_url_100 ?? userInfo.avatar_url,
          followerCount: userInfo.follower_count ?? 0,
        },
      });
    } catch (error) {
      // If TikTok API fails, return connection info only
      res.json({
        connection: {
          id: connection.id,
          openId: connection.openId,
          expiresAt: connection.expiresAt?.toISOString() ?? null,
          createdAt: connection.createdAt.toISOString(),
          updatedAt: connection.updatedAt.toISOString(),
        },
        user: null,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Delete TikTok connection
app.delete("/api/tiktok/connection", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const deleted = await prisma.tikTokConnection.deleteMany({
      where: { userId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "No TikTok connection exists to delete." });
      return;
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/meta/debug", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    const connection = userId
      ? await prisma.metaConnection.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.metaConnection.findFirst({
          orderBy: { createdAt: "desc" },
        });

    if (!connection) {
      res.status(404).json({ error: "No Meta connection record found yet." });
      return;
    }

    const metaConnectionSafe = {
      id: connection.id,
      userId: connection.userId,
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

app.get("/api/meta/test-demographics", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    const connection = userId
      ? await prisma.metaConnection.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.metaConnection.findFirst({
          orderBy: { createdAt: "desc" },
        });

    if (!connection || !connection.pageAccessToken || !connection.igUserId) {
      res.status(404).json({ error: "No valid Meta connection found." });
      return;
    }

    const pageToken = connection.pageAccessToken;
    const igUserId = connection.igUserId;

    console.log("Testing demographics API with:", { igUserId });

    // Test 1: Gender/Age
    const genderAgeResult = await fetchInsights(pageToken, igUserId, "follower_demographics", {
      period: "lifetime",
      timeframe: "this_month",
      metric_type: "total_value",
      breakdown: "age,gender",
    }).catch((error) => ({ error: error.message, graph: error.graph }));

    // Test 2: City
    const cityResult = await fetchInsights(pageToken, igUserId, "follower_demographics", {
      period: "lifetime",
      timeframe: "this_month",
      metric_type: "total_value",
      breakdown: "city",
    }).catch((error) => ({ error: error.message, graph: error.graph }));

    // Test 3: Country
    const countryResult = await fetchInsights(pageToken, igUserId, "follower_demographics", {
      period: "lifetime",
      timeframe: "this_month",
      metric_type: "total_value",
      breakdown: "country",
    }).catch((error) => ({ error: error.message, graph: error.graph }));

    res.json({
      genderAge: genderAgeResult,
      city: cityResult,
      country: countryResult,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/meta/connection", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    const deleted = userId
      ? await prisma.metaConnection.deleteMany({ where: { userId } })
      : await prisma.metaConnection.deleteMany({});
      
    if (deleted.count === 0) {
      res.status(404).json({ error: "No Meta connection exists to delete." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/instagram", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    const connection = userId
      ? await prisma.metaConnection.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.metaConnection.findFirst({
          orderBy: { createdAt: "desc" },
        });

    if (connection) {
      console.log("dashboard/instagram: MetaConnection", {
        userId: connection.userId,
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
      reach,
      profileViews,
      websiteClicks,
      genderAge,
      city,
      country,
    ] = await Promise.all([
      fetchInsights(pageToken, igUserId, "follower_count", {
        since: sinceSeconds,
        until: nowSeconds,
        // follower_countはmetric_type不要
      }).catch((error) => {
        console.warn('follower_count failed, returning empty:', error.message);
        return [];
      }),
      fetchInsights(pageToken, igUserId, "reach", {
        since: sinceSeconds,
        until: nowSeconds,
        metric_type: "total_value",
      }).catch((error) => {
        console.warn('reach failed, returning empty:', error.message);
        return [];
      }),
      fetchInsights(pageToken, igUserId, "profile_views", {
        since: sinceSeconds,
        until: nowSeconds,
        metric_type: "total_value",
      }).catch((error) => {
        console.warn('profile_views failed, returning empty:', error.message);
        return [];
      }),
      fetchInsights(pageToken, igUserId, "website_clicks", {
        since: sinceSeconds,
        until: nowSeconds,
        metric_type: "total_value",
      }).catch((error) => {
        console.warn('website_clicks failed, returning empty:', error.message);
        return [];
      }),
      // 性別・年齢データ
      fetchInsights(pageToken, igUserId, "follower_demographics", {
        period: "lifetime",
        timeframe: "this_month",
        metric_type: "total_value",
        breakdown: "age,gender",
      }).catch((error) => {
        console.warn('follower_demographics (age,gender) failed, returning empty:', error.message);
        return [];
      }),
      // 都市データ
      fetchInsights(pageToken, igUserId, "follower_demographics", {
        period: "lifetime",
        timeframe: "this_month",
        metric_type: "total_value",
        breakdown: "city",
      }).catch((error) => {
        console.warn('follower_demographics (city) failed, returning empty:', error.message);
        return [];
      }),
      // 国データ
      fetchInsights(pageToken, igUserId, "follower_demographics", {
        period: "lifetime",
        timeframe: "this_month",
        metric_type: "total_value",
        breakdown: "country",
      }).catch((error) => {
        console.warn('follower_demographics (country) failed, returning empty:', error.message);
        return [];
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

    // 性別・年齢データの処理
    const genderBreakdown = buildGenderBreakdownFromResults(genderAge);
    const genderTotals = genderBreakdown.male + genderBreakdown.female + genderBreakdown.other || 1;
    const genderRatio = {
      male: Math.round((genderBreakdown.male / genderTotals) * 100),
      female: Math.round((genderBreakdown.female / genderTotals) * 100),
      other: Math.round((genderBreakdown.other / genderTotals) * 100),
    };

    // 都市と国データを結合して地域データを作成
    const regions = buildRegionsFromResults(city, country);

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
        totalImpressions: sumInsightValues(reach), // impressionsは廃止されたのでreachを使用
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
      regions,
      postingHours: buildPostingHours(recentMedia),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/tiktok", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const connection = await prisma.tikTokConnection.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!connection) {
      res.status(404).json({ error: "tiktok_connection_not_found" });
      return;
    }

    if (!connection.accessToken) {
      res.status(422).json({ error: "access_token_missing" });
      return;
    }

    const accessToken = connection.accessToken;

    // Get user info
    const userInfo = await getUserInfo(accessToken);

    if (!userInfo) {
      res.status(404).json({ error: "Failed to fetch TikTok user info." });
      return;
    }

    // Get video list
    const videoData = await getVideoList(accessToken, { max_count: 20 });
    const videos = videoData?.videos ?? [];

    // Calculate summary metrics
    const totalLikes = videos.reduce((sum, video) => sum + (video.like_count ?? 0), 0);
    const totalComments = videos.reduce((sum, video) => sum + (video.comment_count ?? 0), 0);
    const totalShares = videos.reduce((sum, video) => sum + (video.share_count ?? 0), 0);
    const totalViews = videos.reduce((sum, video) => sum + (video.view_count ?? 0), 0);
    const avgEngagementRate = videos.length > 0
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
      : 0;

    // Format video list for response
    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title ?? video.video_description ?? "Untitled",
      coverUrl: video.cover_image_url,
      shareUrl: video.share_url,
      createTime: video.create_time,
      duration: video.duration,
      likes: video.like_count ?? 0,
      comments: video.comment_count ?? 0,
      shares: video.share_count ?? 0,
      views: video.view_count ?? 0,
      engagementRate: video.view_count
        ? (((video.like_count ?? 0) + (video.comment_count ?? 0) + (video.share_count ?? 0)) / video.view_count) * 100
        : 0,
    }));

    res.json({
      account: {
        openId: userInfo.open_id,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.avatar_url_100 ?? userInfo.avatar_url,
        bioDescription: userInfo.bio_description,
        isVerified: userInfo.is_verified ?? false,
        followerCount: userInfo.follower_count ?? 0,
        followingCount: userInfo.following_count ?? 0,
        likesCount: userInfo.likes_count ?? 0,
        videoCount: userInfo.video_count ?? 0,
      },
      summary: {
        followers: userInfo.follower_count ?? 0,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalShares: totalShares,
        totalViews: totalViews,
        avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
      },
      videos: formattedVideos,
    });
  } catch (error) {
    if (error instanceof TikTokApiError) {
      console.error("TikTok API Error:", {
        status: error.status,
        body: error.body,
        endpoint: error.endpoint,
      });
    }
    next(error);
  }
});

// ===== Instagram Comments API =====

// GET /api/instagram/comments - Get comments from recent media
app.get("/api/instagram/comments", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    const connection = await prisma.metaConnection.findFirst({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
    });

    if (!connection?.pageAccessToken) {
      res.status(404).json({ error: "Instagram not connected" });
      return;
    }

    const igUserId = connection.igUserId;
    if (!igUserId) {
      res.status(422).json({ error: "Instagram user ID not found" });
      return;
    }

    const accessToken = connection.pageAccessToken;

    // Get recent media
    const mediaData = await graphFetch<{ data?: Array<{ id: string; caption?: string; media_type?: string; thumbnail_url?: string; media_url?: string; permalink?: string; timestamp?: string }> }>(
      `${igUserId}/media`,
      { access_token: accessToken, fields: "id,caption,media_type,thumbnail_url,media_url,permalink,timestamp", limit: "10" }
    );

    const mediaList = mediaData.data ?? [];

    // Get comments for each media
    const allComments: Array<{
      id: string;
      mediaId: string;
      mediaUrl: string;
      mediaPermalink: string;
      username: string;
      text: string;
      timestamp: string;
      replies?: Array<{ id: string; username: string; text: string; timestamp: string }>;
    }> = [];

    await Promise.all(
      mediaList.map(async (media) => {
        try {
          const commentsData = await graphFetch<{ data?: Array<{ id: string; username?: string; text?: string; timestamp?: string }> }>(
            `${media.id}/comments`,
            { access_token: accessToken, fields: "id,username,text,timestamp", limit: "50" }
          );
          const comments = commentsData.data ?? [];
          for (const c of comments) {
            allComments.push({
              id: c.id,
              mediaId: media.id,
              mediaUrl: media.thumbnail_url ?? media.media_url ?? "",
              mediaPermalink: media.permalink ?? "",
              username: c.username ?? "unknown",
              text: c.text ?? "",
              timestamp: c.timestamp ?? "",
            });
          }
        } catch {
          // skip media with no comments access
        }
      })
    );

    // Sort by timestamp desc
    allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ comments: allComments });
  } catch (error) {
    next(error);
  }
});

// POST /api/instagram/comments/:commentId/reply - Reply to a comment
app.post("/api/instagram/comments/:commentId/reply", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const connection = await prisma.metaConnection.findFirst({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
    });

    if (!connection?.pageAccessToken) {
      res.status(404).json({ error: "Instagram not connected" });
      return;
    }

    const accessToken = connection.pageAccessToken;

    const result = await graphPost<{ id: string }>(
      `${commentId}/replies`,
      accessToken,
      { message: message.trim() }
    );

    res.json({ success: true, replyId: result.id });
  } catch (error) {
    next(error);
  }
});

// POST /api/instagram/comments/suggest-reply - AI reply suggestions
app.post("/api/instagram/comments/suggest-reply", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentText, username, postCaption, language } = req.body;
    if (!commentText || !username) {
      res.status(400).json({ error: "commentText and username are required" });
      return;
    }
    const suggestions = await generateCommentReply(commentText, username, postCaption, language);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

app.post("/api/ai/generate-ideas", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("=== Generate Ideas Request ===");
    console.log("Body:", req.body);
    
    const { industry, goal, freeInput } = req.body;

    if (!industry || !goal) {
      console.log("Missing industry or goal");
      res.status(400).json({ error: "Industry and goal are required" });
      return;
    }

    console.log("Calling Grok API with:", { industry, goal, freeInput });
    const ideas = await generateContentIdeas(industry, goal, freeInput);
    console.log("Generated ideas:", ideas);
    
    res.json({ ideas });
  } catch (error) {
    console.error("=== Generate Ideas Error ===");
    console.error("Error:", error);
    if (error instanceof GrokApiError) {
      console.error("Grok API Error:", {
        status: error.status,
        body: error.body,
      });
    }
    next(error);
  }
});

app.post("/api/ai/generate-script", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("=== Generate Script Request ===");
    console.log("Body:", req.body);
    
    const { contentIdea, context } = req.body;

    if (!contentIdea || !context) {
      res.status(400).json({ error: "Content idea and context are required" });
      return;
    }

    console.log("Calling Grok API for script generation");
    const script = await generateScript(contentIdea, context);
    console.log("Generated script");
    
    res.json({ script });
  } catch (error) {
    console.error("=== Generate Script Error ===");
    console.error("Error:", error);
    if (error instanceof GrokApiError) {
      console.error("Grok API Error:", {
        status: error.status,
        body: error.body,
      });
    }
    next(error);
  }
});

// Save content idea
app.post("/api/content-ideas", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== Save Content Idea ===');
    console.log('Prisma client:', typeof prisma);
    console.log('Prisma.contentIdea:', typeof prisma?.contentIdea);
    
    const userId = (req as any).user.userId;
    const { title, concept, format, hook, structure, caption, hashtags, industry, goal, freeInput } = req.body;

    const contentIdea = await prisma.contentIdea.create({
      data: {
        userId,
        title,
        concept,
        format,
        hook,
        structure,
        caption,
        hashtags,
        industry,
        goal,
        freeInput,
      },
    });

    res.json({ contentIdea });
  } catch (error) {
    console.error('Error saving content idea:', error);
    next(error);
  }
});

// Get all content ideas for user
app.get("/api/content-ideas", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const contentIdeas = await prisma.contentIdea.findMany({
      where: { userId },
      include: {
        scripts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ contentIdeas });
  } catch (error) {
    next(error);
  }
});

// Delete content idea
app.delete("/api/content-ideas/:id", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const ideaId = parseInt(req.params.id);

    // Verify ownership
    const idea = await prisma.contentIdea.findFirst({
      where: { id: ideaId, userId },
    });

    if (!idea) {
      res.status(404).json({ error: "Content idea not found" });
      return;
    }

    await prisma.contentIdea.delete({
      where: { id: ideaId },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Save content script
app.post("/api/content-scripts", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== Save Content Script ===');
    const userId = (req as any).user.userId;
    console.log('User ID:', userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      contentIdeaId, 
      videoTitle, 
      objective, 
      timeline, 
      fullScript, 
      shootingInstructions, 
      telops, 
      captionText, 
      hashtags, 
      thumbnailIdea, 
      estimatedDuration, 
      whyItWorks 
    } = req.body;

    console.log('Content Idea ID:', contentIdeaId);

    // Verify ownership of content idea
    const idea = await prisma.contentIdea.findFirst({
      where: { id: contentIdeaId, userId },
    });

    console.log('Found idea:', idea ? 'Yes' : 'No');

    if (!idea) {
      res.status(404).json({ error: "Content idea not found" });
      return;
    }

    console.log('Creating script...');
    const script = await prisma.contentScript.create({
      data: {
        contentIdeaId,
        videoTitle,
        objective,
        timeline,
        fullScript,
        shootingInstructions,
        telops,
        captionText,
        hashtags,
        thumbnailIdea,
        estimatedDuration,
        whyItWorks,
      },
    });

    console.log('Script created successfully:', script.id);
    console.log('Script created successfully:', script.id);
    res.json({ script });
  } catch (error) {
    console.error('=== Save Script Error ===');
    console.error('Error:', error);
    next(error);
  }
});

// Get Instagram trends
app.get("/api/instagram/trends", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    // Get Instagram connection
    const connection = await prisma.metaConnection.findFirst({
      where: { userId },
    });

    if (!connection || !connection.igUserId || !connection.pageAccessToken) {
      res.status(404).json({ error: "Instagram not connected" });
      return;
    }

    // Analyze trends
    const trends = await analyzeInstagramTrends(
      connection.igUserId,
      connection.pageAccessToken
    );

    res.json(trends);
  } catch (error) {
    console.error('=== Instagram Trends Error ===');
    console.error('Error:', error);
    next(error);
  }
});

// Get TikTok user data
app.get("/api/tiktok/user", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  console.log("=== TikTok User Endpoint Called ===");
  try {
    const userId = (req as any).user.userId;
    console.log("TikTok user endpoint - userId:", userId);

    // Get TikTok connection
    const connection = await prisma.tikTokConnection.findFirst({
      where: { userId },
    });
    console.log("TikTok connection found:", !!connection);

    if (!connection || !connection.accessToken) {
      console.log("TikTok not connected - returning 404");
      res.status(404).json({ error: "TikTok not connected" });
      return;
    }

    console.log("Calling TikTok getUserInfo...");
    // Get user info
    const userInfo = await getUserInfo(connection.accessToken);
    console.log("TikTok userInfo result:", userInfo);

    res.json(userInfo);
  } catch (error) {
    console.error('=== TikTok User Error ===');
    console.error('Error:', error);
    if (error instanceof TikTokApiError) {
      console.error('TikTok API Error:', {
        status: error.status,
        body: error.body,
      });
    }
    next(error);
  }
});

// Get TikTok videos
app.get("/api/tiktok/videos", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    // Get TikTok connection
    const connection = await prisma.tikTokConnection.findFirst({
      where: { userId },
    });

    if (!connection || !connection.accessToken) {
      res.status(404).json({ error: "TikTok not connected" });
      return;
    }

    // Get video list
    const videos = await getVideoList(connection.accessToken, {
      max_count: 20,
    });

    res.json(videos);
  } catch (error) {
    console.error('=== TikTok Videos Error ===');
    console.error('Error:', error);
    if (error instanceof TikTokApiError) {
      console.error('TikTok API Error:', {
        status: error.status,
        body: error.body,
      });
    }
    next(error);
  }
});

// Get industry trends (Grok API)
app.get("/api/trends/analyze", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { industry, platform } = req.query;

    if (!industry) {
      res.status(400).json({ error: "Industry parameter is required" });
      return;
    }

    const platformValue = platform === 'instagram' || platform === 'tiktok' ? platform : 'both';

    console.log('=== Analyze Trends Request ===');
    console.log('Industry:', industry);
    console.log('Platform:', platformValue);

    const trends = await analyzeTrends(industry as string, platformValue);

    res.json(trends);
  } catch (error) {
    console.error('=== Analyze Trends Error ===');
    console.error('Error:', error);
    if (error instanceof GrokApiError) {
      console.error('Grok API Error:', {
        status: error.status,
        body: error.body,
      });
    }
    next(error);
  }
});

// Generate insight report
app.post("/api/report/generate", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { platform } = req.body as { platform: 'instagram' | 'tiktok' };

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      res.status(400).json({ error: "Invalid platform. Must be 'instagram' or 'tiktok'" });
      return;
    }

    console.log(`=== Generating ${platform} report for user ${userId} ===`);

    let reportData: Parameters<typeof generateInsightReport>[1] = {};

    if (platform === 'instagram') {
      // Get Instagram connection (MetaConnection doesn't have userId, get the latest one)
      const metaConnection = await prisma.metaConnection.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!metaConnection || !metaConnection.accessToken || !metaConnection.igUserId) {
        res.status(404).json({ error: "Instagram not connected" });
        return;
      }

      // Fetch Instagram data using pageAccessToken (required for insights)
      const accessToken = metaConnection.pageAccessToken || metaConnection.accessToken;
      const now = Math.floor(Date.now() / 1000);
      const since = now - 28 * 24 * 60 * 60; // 28 days ago (for better follower trend)

      let latestFollowers = 0;
      let followersGrowth = 0;
      let reach = 0;
      let profileViews = 0;
      let websiteClicks = 0;
      let topPosts: Array<{ caption?: string; likeCount: number; commentCount: number; mediaType?: string }> = [];

      // Get basic account info (followers_count is here, not in insights)
      try {
        const accountInfo = await graphFetch<{ followers_count?: number; media_count?: number }>(
          `${metaConnection.igUserId}`,
          {
            access_token: accessToken,
            fields: 'followers_count,media_count',
          }
        );
        latestFollowers = accountInfo.followers_count || 0;
        console.log(`Account info - Followers: ${latestFollowers}`);
      } catch (error) {
        console.error("Error fetching account info:", error);
      }

      // Get follower count trend from insights (for growth calculation)
      try {
        const followerData = await graphFetch<{ data?: Array<{ name: string; values?: Array<{ value: number; end_time: string }> }> }>(
          `${metaConnection.igUserId}/insights`,
          {
            access_token: accessToken,
            metric: 'follower_count',
            period: 'day',
            since: String(since),
            until: String(now),
          }
        );
        const followerValues = followerData.data?.[0]?.values || [];
        if (followerValues.length > 0) {
          const earliestFollowers = followerValues[0]?.value || 0;
          const latestFromInsights = followerValues[followerValues.length - 1]?.value || 0;
          // Use insights value if account info failed
          if (latestFollowers === 0) latestFollowers = latestFromInsights;
          followersGrowth = latestFromInsights - earliestFollowers;
        }
        console.log(`Follower trend - Growth: ${followersGrowth}`);
      } catch (error) {
        console.error("Error fetching follower count insights:", error);
      }

      // Get reach (sum of daily values)
      try {
        const reachData = await graphFetch<{ data?: Array<{ name: string; values?: Array<{ value: number }> }> }>(
          `${metaConnection.igUserId}/insights`,
          {
            access_token: accessToken,
            metric: 'reach',
            period: 'day',
            since: String(since),
            until: String(now),
          }
        );
        const reachValues = reachData.data?.[0]?.values || [];
        reach = reachValues.reduce((sum, v) => sum + (v.value || 0), 0);
        console.log(`Reach: ${reach}`);
      } catch (error) {
        console.error("Error fetching reach:", error);
      }

      // Get profile views (sum of daily values)
      try {
        const profileViewsData = await graphFetch<{ data?: Array<{ name: string; total_value?: { value: number }; values?: Array<{ value: number }> }> }>(
          `${metaConnection.igUserId}/insights`,
          {
            access_token: accessToken,
            metric: 'profile_views',
            period: 'day',
            since: String(since),
            until: String(now),
            metric_type: 'total_value',
          }
        );
        // Try total_value first, then sum of values
        profileViews = profileViewsData.data?.[0]?.total_value?.value || 
          profileViewsData.data?.[0]?.values?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
        console.log(`Profile views: ${profileViews}`);
      } catch (error) {
        console.error("Error fetching profile views:", error);
      }

      // Get website clicks (sum of daily values)
      try {
        const websiteClicksData = await graphFetch<{ data?: Array<{ name: string; total_value?: { value: number }; values?: Array<{ value: number }> }> }>(
          `${metaConnection.igUserId}/insights`,
          {
            access_token: accessToken,
            metric: 'website_clicks',
            period: 'day',
            since: String(since),
            until: String(now),
            metric_type: 'total_value',
          }
        );
        // Try total_value first, then sum of values
        websiteClicks = websiteClicksData.data?.[0]?.total_value?.value ||
          websiteClicksData.data?.[0]?.values?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
        console.log(`Website clicks: ${websiteClicks}`);
      } catch (error) {
        console.error("Error fetching website clicks:", error);
      }

      try {
        // Get recent media
        const mediaData = await graphFetch<{ data?: Array<{ id: string; caption?: string; like_count?: number; comments_count?: number; media_type?: string }> }>(
          `${metaConnection.igUserId}/media`,
          {
            access_token: accessToken,
            fields: 'id,caption,like_count,comments_count,media_type',
            limit: '10',
          }
        );

        topPosts = mediaData.data?.map(post => ({
          caption: post.caption,
          likeCount: post.like_count || 0,
          commentCount: post.comments_count || 0,
          mediaType: post.media_type,
        })) || [];
        console.log(`Top posts fetched: ${topPosts.length}`);
      } catch (error) {
        console.error("Error fetching media:", error);
      }

      // Calculate engagement rate
      const totalEngagement = topPosts.reduce((sum, post) => sum + post.likeCount + post.commentCount, 0);
      const engagementRate = topPosts.length > 0 && latestFollowers > 0
        ? (totalEngagement / topPosts.length / latestFollowers) * 100
        : 0;

      console.log(`Report data summary - Followers: ${latestFollowers}, Growth: ${followersGrowth}, Reach: ${reach}, ProfileViews: ${profileViews}, EngagementRate: ${engagementRate.toFixed(2)}%`);

      reportData = {
        followers: latestFollowers,
        followersGrowth,
        reach,
        profileViews,
        websiteClicks,
        engagementRate,
        topPosts,
      };
    } else {
      // Get TikTok connection
      const tikTokConnection = await prisma.tikTokConnection.findFirst({
        where: { userId },
      });

      if (!tikTokConnection || !tikTokConnection.accessToken) {
        res.status(404).json({ error: "TikTok not connected" });
        return;
      }

      try {
        // Get user info
        const userInfo = await getUserInfo(tikTokConnection.accessToken);
        
        // Get videos
        const videosData = await getVideoList(tikTokConnection.accessToken, { max_count: 20 });

        reportData = {
          followers: userInfo?.follower_count,
          followingCount: userInfo?.following_count,
          likesCount: userInfo?.likes_count,
          videoCount: userInfo?.video_count,
          videos: videosData?.videos?.map(v => ({
            title: v.title || v.video_description,
            viewCount: v.view_count,
            likeCount: v.like_count,
            commentCount: v.comment_count,
            shareCount: v.share_count,
          })),
        };
      } catch (error) {
        console.error("Error fetching TikTok data for report:", error);
        // Continue with partial data
      }
    }

    // Generate report using Grok API
    const report = await generateInsightReport(platform, reportData);

    console.log(`=== Report generated successfully ===`);
    res.json(report);
  } catch (error) {
    console.error("=== Report Generation Error ===");
    console.error(error);
    if (error instanceof GrokApiError) {
      res.status(error.status).json({ error: error.message, details: error.body });
      return;
    }
    next(error);
  }
});

// Delete user account and all associated data
app.delete("/api/user/delete", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete ContentScripts (via cascade from ContentIdea)
    // 2. Delete ContentIdeas
    await prisma.contentIdea.deleteMany({
      where: { userId },
    });

    // 3. Delete TikTok connections
    await prisma.tikTokConnection.deleteMany({
      where: { userId },
    });

    // 4. Delete Meta (Instagram) connections
    await prisma.metaConnection.deleteMany({
      where: { userId },
    });

    // 5. Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User ${userId} and all associated data deleted successfully`);

    res.status(200).json({ 
      success: true, 
      message: "Your account and all associated data have been deleted." 
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    next(error);
  }
});

// Get user data summary (for data deletion page)
app.get("/api/user/data-summary", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Count associated data
    const [metaConnections, tiktokConnections, contentIdeas, contentScripts] = await Promise.all([
      prisma.metaConnection.count({ where: { userId } }),
      prisma.tikTokConnection.count({ where: { userId } }),
      prisma.contentIdea.count({ where: { userId } }),
      prisma.contentScript.count({
        where: { contentIdea: { userId } },
      }),
    ]);

    res.json({
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      dataCounts: {
        metaConnections,
        tiktokConnections,
        contentIdeas,
        contentScripts,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile (company name)
app.put("/api/user/profile", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { companyName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { companyName: companyName || null },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});

// Get user profile
app.get("/api/user/profile", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// 404 handler - must be after all routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found." });
});

// Error handler - must be last
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
