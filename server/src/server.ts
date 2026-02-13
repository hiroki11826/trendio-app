import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Pool } from "pg";

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
  server.close(() => void pool.end());
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
