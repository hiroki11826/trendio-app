import type { MetaConnection, PrismaClient } from "@prisma/client";

const metaGraphVersion = process.env.META_GRAPH_API_VERSION ?? "v21.0";
export const metaGraphBase = `https://graph.facebook.com/${metaGraphVersion}`;
export const metaAuthUrl = `https://www.facebook.com/${metaGraphVersion}/dialog/oauth`;

export type MetaAccountPage = {
  id?: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: {
    id?: string;
    username?: string;
    profile_picture_url?: string;
    followers_count?: number;
  } | null;
};

type MetaPageLink = {
  pageId?: string | undefined;
  igUserId?: string | undefined;
  pageAccessToken?: string | undefined;
};

const normalizeKey = (key: string) => key.replace(/_/g, "").toLowerCase();
const sensitiveKeys = new Set(["accesstoken", "pageaccesstoken"]);
const maskGraphValue = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(maskGraphValue);
  }
  if (data && typeof data === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (sensitiveKeys.has(normalizeKey(key))) {
        next[key] = "***masked***";
        continue;
      }
      next[key] = maskGraphValue(value);
    }
    return next;
  }
  return data;
};

export class GraphApiError extends Error {
  public readonly graph: {
    status: number;
    body: unknown;
  };
  public readonly body: unknown;
  public readonly endpoint?: string;

  constructor(status: number, body: unknown, endpoint?: string, message?: string) {
    super(message ?? `Meta Graph request failed (${status})`);
    this.name = "GraphApiError";
    Object.setPrototypeOf(this, GraphApiError.prototype);
    const maskedBody = maskGraphValue(body);
    this.graph = {
      status,
      body: maskedBody,
    };
    this.body = maskedBody;
    this.endpoint = endpoint;
  }
}

export const graphFetch = async <T extends Record<string, unknown>>(path: string, params: Record<string, string>) => {
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
    const logSearch = new URLSearchParams(url.searchParams);
    logSearch.delete("access_token");
    const endpointForError = `${url.pathname}${logSearch.toString() ? `?${logSearch.toString()}` : ""}`;
    throw new GraphApiError(response.status, payload, endpointForError, message);
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

export const getInstagramPageFromUserToken = async (userToken: string, preferredPageId?: string) => {
  const { data: accounts = [] } = await fetchMetaAccounts(userToken);
  let page: MetaAccountPage | undefined;
  if (preferredPageId) {
    page = accounts.find(
      (current) =>
        typeof current.id === "string" &&
        current.id === preferredPageId &&
        typeof current.instagram_business_account === "object" &&
        current.instagram_business_account !== null,
    );
  }
  if (!page) {
    page = accounts.find(
      (current) =>
        typeof current.instagram_business_account === "object" &&
        current.instagram_business_account !== null,
    );
  }
  if (!page) {
    throw new Error("no_ig_linked_to_pages");
  }
  if (typeof page.access_token !== "string") {
    throw new Error("missing_page_access_token");
  }
  const instagramBusinessAccount = page.instagram_business_account as Record<string, unknown>;
  return {
    pageId: typeof page.id === "string" ? page.id : undefined,
    igUserId: typeof instagramBusinessAccount.id === "string" ? instagramBusinessAccount.id : undefined,
    pageAccessToken: page.access_token,
  };
};

const normalizePageFields = (
  page?: MetaAccountPage | MetaPageLink,
): { pageId?: string; igUserId?: string; pageAccessToken?: string } => {
  if (!page) {
    return {};
  }

  let pageId: string | undefined;
  if ("pageId" in page && typeof page.pageId === "string") {
    pageId = page.pageId;
  } else if ("id" in page && typeof page.id === "string") {
    pageId = page.id;
  }

  let igUserId: string | undefined;
  if ("igUserId" in page && typeof page.igUserId === "string") {
    igUserId = page.igUserId;
  } else if ("instagram_business_account" in page) {
    const account = page.instagram_business_account;
    if (account && typeof account.id === "string") {
      igUserId = account.id;
    }
  }

  let pageAccessToken: string | undefined;
  if ("pageAccessToken" in page && typeof page.pageAccessToken === "string") {
    pageAccessToken = page.pageAccessToken;
  } else if ("access_token" in page && typeof page.access_token === "string") {
    pageAccessToken = page.access_token;
  }

  return { pageId, igUserId, pageAccessToken };
};

export const ensureMetaConnectionHasIgUser = async (
  prisma: PrismaClient,
  connection: MetaConnection,
  page?: MetaAccountPage | MetaPageLink,
) => {
  if (!page) {
    return connection;
  }

  const { pageId, igUserId, pageAccessToken } = normalizePageFields(page);
  const dataToUpdate: Partial<MetaConnection> = {};
  if (pageId && pageId !== connection.pageId) dataToUpdate.pageId = pageId;
  if (igUserId && igUserId !== connection.igUserId) dataToUpdate.igUserId = igUserId;
  if (pageAccessToken && pageAccessToken !== connection.pageAccessToken) {
    dataToUpdate.pageAccessToken = pageAccessToken;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return connection;
  }

  return prisma.metaConnection.update({
    where: { id: connection.id },
    data: dataToUpdate,
  });
};
