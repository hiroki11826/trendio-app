import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { PrismaClient } from "@prisma/client";
import {
  buildTikTokAuthUrl,
  exchangeCodeForToken,
} from "../src/services/tiktokApi.js";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI?.trim();

let prismaClient: PrismaClient | null = null;

// PKCE helper functions
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Store code verifiers and user IDs temporarily
const codeVerifierStore = new Map<string, string>();

export const setTikTokPrismaClient = (client: PrismaClient) => {
  prismaClient = client;
};

const getPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    throw new Error("Prisma client is not initialized for TikTok auth routes.");
  }
  return prismaClient;
};

const ensureTikTokConfig = (res: Response): boolean => {
  const missing: string[] = [];
  if (!TIKTOK_CLIENT_KEY) missing.push("TIKTOK_CLIENT_KEY");
  if (!TIKTOK_CLIENT_SECRET) missing.push("TIKTOK_CLIENT_SECRET");
  if (!TIKTOK_REDIRECT_URI) missing.push("TIKTOK_REDIRECT_URI");

  if (missing.length > 0) {
    res
      .status(500)
      .json({ error: `Missing TikTok environment variables: ${missing.join(", ")}` });
    return false;
  }

  return true;
};

export function tiktokLogin(req: Request, res: Response) {
  if (!ensureTikTokConfig(res)) {
    return;
  }

  // Get userId from token query parameter
  let userId: number | null = null;

  console.log("=== TikTok Login Start ===");
  console.log("Query params:", req.query);
  console.log("Token present:", !!req.query.token);

  if (req.query.token) {
    try {
      const token = String(req.query.token);
      console.log("Token length:", token.length);
      console.log("Token first 20 chars:", token.substring(0, 20));
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET not configured");
        res.status(500).json({ error: "Server configuration error" });
        return;
      }
      console.log("JWT_SECRET length:", jwtSecret.length);
      
      // Verify and decode the token
      const payload = jwt.verify(token, jwtSecret) as { userId?: number };
      userId = payload.userId || null;
      console.log("Extracted userId from token:", userId);
      console.log("Full payload:", payload);
    } catch (error) {
      console.error("Failed to extract userId from token:", error);
      console.error("Error name:", (error as Error).name);
      console.error("Error message:", (error as Error).message);
      res.status(401).json({ error: "Invalid authentication token" });
      return;
    }
  }

  if (!userId) {
    console.error("No userId found in token");
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Generate CSRF state token
  const state = crypto.randomBytes(16).toString("hex");

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store code verifier and userId with state as key (in-memory for now)
  const stateData = {
    codeVerifier,
    userId,
  };
  codeVerifierStore.set(state, JSON.stringify(stateData));

  // Clean up old verifiers (older than 10 minutes)
  setTimeout(() => {
    codeVerifierStore.delete(state);
  }, 10 * 60 * 1000);

  const authUrl = buildTikTokAuthUrl(
    TIKTOK_CLIENT_KEY!,
    TIKTOK_REDIRECT_URI!,
    state,
    codeChallenge,
    ["user.info.basic", "user.info.profile", "user.info.stats", "video.list"]
  );

  console.log("=== TikTok Login ===");
  console.log("TikTok Auth URL:", authUrl);
  console.log("Client Key:", TIKTOK_CLIENT_KEY);
  console.log("Redirect URI:", TIKTOK_REDIRECT_URI);
  console.log("State stored:", state);
  console.log("User ID:", userId);

  res.redirect(authUrl);
}

export async function tiktokCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("=== TikTok Callback Start ===");
    
    if (!ensureTikTokConfig(res)) {
      return;
    }

    const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
    const state = typeof req.query.state === "string" ? req.query.state.trim() : "";

    console.log("Query code:", code ? "present" : "missing");
    console.log("Query state:", state);
    console.log("Code verifier exists:", codeVerifierStore.has(state));

    if (!code) {
      console.error("TikTok authorization code is missing");
      res.status(400).json({ error: "TikTok authorization code is required." });
      return;
    }

    // Verify state exists (CSRF protection)
    if (!state) {
      console.error("State parameter is missing");
      res.status(400).json({ error: "State parameter is required." });
      return;
    }

    // Retrieve state data (code verifier and userId)
    const stateDataStr = codeVerifierStore.get(state);
    if (!stateDataStr) {
      console.error("State data not found for state:", state);
      console.error("Available states:", Array.from(codeVerifierStore.keys()));
      res.status(400).json({ error: "State data not found. Please try again." });
      return;
    }

    let stateData: { codeVerifier: string; userId: number | null };
    try {
      stateData = JSON.parse(stateDataStr);
      console.log("Parsed state data:", { hasVerifier: !!stateData.codeVerifier, userId: stateData.userId });
    } catch (error) {
      console.error("Failed to parse state data:", error);
      res.status(400).json({ error: "Invalid state data. Please try again." });
      return;
    }

    const codeVerifier = stateData.codeVerifier;
    const userId = stateData.userId;

    console.log("Retrieved userId from state:", userId);

    if (!userId) {
      console.error("UserId is null in state data");
      res.status(400).json({ error: "User authentication failed. Please try again." });
      return;
    }

    // Clear the verifier
    codeVerifierStore.delete(state);

    // Exchange code for access token with code verifier
    console.log("Exchanging code for token...");
    const tokenResponse = await exchangeCodeForToken(
      code,
      TIKTOK_CLIENT_KEY!,
      TIKTOK_CLIENT_SECRET!,
      TIKTOK_REDIRECT_URI!,
      codeVerifier
    );

    const accessToken = tokenResponse.access_token;
    const refreshToken = tokenResponse.refresh_token;
    const openId = tokenResponse.open_id;
    const expiresIn = tokenResponse.expires_in;
    const scope = tokenResponse.scope;

    console.log("Token response:", { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      openId, 
      expiresIn 
    });

    if (!accessToken || !openId) {
      console.error("TikTok response missing required fields");
      res.status(502).json({
        error: "TikTok response did not include required fields.",
        details: tokenResponse,
      });
      return;
    }

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    const prisma = getPrismaClient();

    // Check if connection already exists
    const existingConnection = await prisma.tikTokConnection.findUnique({
      where: { openId },
    });

    console.log("Existing connection:", existingConnection ? "found" : "not found");

    if (existingConnection) {
      // Update existing connection
      console.log("Updating existing connection with userId:", userId);
      await prisma.tikTokConnection.update({
        where: { openId },
        data: {
          userId: userId,
          accessToken,
          refreshToken: refreshToken ?? null,
          expiresAt,
          scope: scope ?? null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new connection
      console.log("Creating new connection with userId:", userId);
      await prisma.tikTokConnection.create({
        data: {
          userId,
          accessToken,
          refreshToken: refreshToken ?? null,
          openId,
          expiresAt,
          scope: scope ?? null,
        },
      });
    }

    console.log("TikTok connection saved successfully");
    console.log("=== TikTok Callback End ===");

    // Redirect to settings page with success message
    res.redirect("https://app.trendio.jp/settings?tiktok_connected=1");
  } catch (error) {
    console.error("=== TikTok Callback Error ===");
    console.error(error);
    next(error);
  }
}
