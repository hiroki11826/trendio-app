const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

export type InstagramInsightsResponse = {
  account: {
    id?: string;
    name?: string;
    username?: string;
    biography?: string;
    profilePictureUrl?: string;
    followersCount: number;
    mediaCount: number;
  };
  summary: {
    followers: number;
    profileViews: number;
    totalImpressions: number;
    totalReach: number;
  };
  followerTrend: {
    labels: string[];
    values: number[];
  };
  actionTrend: {
    labels: string[];
    likes: number[];
    comments: number[];
    saves: number[];
    siteClicks: number[];
  };
  actionSummary: {
    likes: number;
    comments: number;
    saves: number;
    siteClicks: number;
  };
  genderByPeriod: Array<{
    label: string;
    male: number;
    female: number;
    other: number;
  }>;
  genderRatio: {
    male: number;
    female: number;
    other: number;
  };
  regions: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  postingHours: Array<{
    hour: string;
    engagement: number;
  }>;
};

export type MetaConnectionResponse = {
  metaConnection: {
    id: number;
    pageId: string | null;
    igUserId: string | null;
    expiresAt: string | null;
    hasPageAccessToken: boolean;
  };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message?: string
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('nekocafe_token');
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data, data.error || data.message);
  }

  return response.json();
};

export const api = {
  // Instagram Insights
  getInstagramInsights: async (): Promise<InstagramInsightsResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/api/dashboard/instagram`);
  },

  // Meta Connection
  getMetaConnection: async (): Promise<MetaConnectionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/api/meta/debug`);
  },

  deleteMetaConnection: async (): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/api/meta/connection`, {
      method: 'DELETE',
    });
  },

  // Meta Login URL
  getMetaLoginUrl: (): string => {
    return `${API_BASE_URL}/api/auth/meta/login`;
  },
};
