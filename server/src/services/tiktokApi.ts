const TIKTOK_API_BASE = "https://open.tiktokapis.com";
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

export type TikTokUserInfo = {
  open_id?: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name?: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
};

export type TikTokVideo = {
  id?: string;
  create_time?: number;
  cover_image_url?: string;
  share_url?: string;
  video_description?: string;
  duration?: number;
  height?: number;
  width?: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
};

export class TikTokApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;
  public readonly endpoint?: string;

  constructor(status: number, body: unknown, endpoint?: string, message?: string) {
    super(message ?? `TikTok API request failed (${status})`);
    this.name = "TikTokApiError";
    Object.setPrototypeOf(this, TikTokApiError.prototype);
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
  }
}

export const tiktokFetch = async <T extends Record<string, unknown>>(
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
) => {
  const url = endpoint.startsWith("http") ? endpoint : `${TIKTOK_API_BASE}${endpoint}`;
  console.log("TikTok API fetch:", url);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  console.log("TikTok API response status:", response.status);
  const payload = (await response.json()) as T & { error?: { code?: string; message?: string } };
  console.log("TikTok API payload:", JSON.stringify(payload).substring(0, 200));

  // TikTok API returns error.code = "ok" for successful responses
  if (!response.ok || (payload.error && payload.error.code !== "ok")) {
    const message = payload.error?.message ?? `TikTok API request failed (${response.status})`;
    throw new TikTokApiError(response.status, payload, endpoint, message);
  }

  return payload;
};

export const exchangeCodeForToken = async (
  code: string,
  clientKey: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string
) => {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const url = TIKTOK_TOKEN_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    open_id?: string;
    refresh_token?: string;
    refresh_expires_in?: number;
    scope?: string;
    token_type?: string;
    error?: { code?: string; message?: string };
  };

  if (!response.ok || payload.error) {
    const message = payload.error?.message ?? `TikTok token exchange failed (${response.status})`;
    throw new TikTokApiError(response.status, payload, TIKTOK_TOKEN_URL, message);
  }

  return payload;
};

export const refreshAccessToken = async (
  refreshToken: string,
  clientKey: string
) => {
  const body = new URLSearchParams({
    client_key: clientKey,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const url = TIKTOK_TOKEN_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    open_id?: string;
    refresh_token?: string;
    refresh_expires_in?: number;
    scope?: string;
    token_type?: string;
    error?: { code?: string; message?: string };
  };

  if (!response.ok || payload.error) {
    const message = payload.error?.message ?? `TikTok token refresh failed (${response.status})`;
    throw new TikTokApiError(response.status, payload, TIKTOK_TOKEN_URL, message);
  }

  return payload;
};

export const getUserInfo = async (accessToken: string, fields?: string[]) => {
  // With user.info.stats scope, we can get follower_count, following_count, likes_count, video_count
  const defaultFields = [
    "open_id",
    "union_id", 
    "avatar_url",
    "display_name",
    "follower_count",
    "following_count",
    "likes_count",
    "video_count",
  ];

  const fieldsParam = fields ?? defaultFields;
  const fieldsQuery = fieldsParam.join(",");

  const response = await tiktokFetch<{
    data?: {
      user?: TikTokUserInfo;
    };
  }>(`/v2/user/info/?fields=${encodeURIComponent(fieldsQuery)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data?.user;
};

export const getVideoList = async (
  accessToken: string,
  options?: {
    max_count?: number;
    cursor?: number;
    fields?: string[];
  }
) => {
  // Include engagement metrics
  const defaultFields = [
    "id",
    "create_time",
    "cover_image_url",
    "share_url",
    "video_description",
    "duration",
    "title",
    "like_count",
    "comment_count",
    "share_count",
    "view_count",
  ];

  const fieldsParam = options?.fields ?? defaultFields;
  const fieldsQuery = fieldsParam.join(",");

  const body: Record<string, unknown> = {
    max_count: options?.max_count ?? 20,
  };

  if (options?.cursor) {
    body.cursor = options.cursor;
  }

  const response = await tiktokFetch<{
    data?: {
      videos?: TikTokVideo[];
      cursor?: number;
      has_more?: boolean;
    };
  }>(`/v2/video/list/?fields=${encodeURIComponent(fieldsQuery)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  return response.data;
};

export const buildTikTokAuthUrl = (
  clientKey: string,
  redirectUri: string,
  state: string,
  codeChallenge: string,
  scope: string[] = ["user.info.basic"]
) => {
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: scope.join(","),
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
};
