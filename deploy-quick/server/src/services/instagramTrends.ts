import { graphFetch } from './metaGraph.js';

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  insights?: {
    impressions?: number;
    reach?: number;
    saved?: number;
    video_views?: number;
    plays?: number;
  };
}

export interface TrendAnalysis {
  topPosts: Array<{
    id: string;
    caption: string;
    engagementRate: number;
    likes: number;
    comments: number;
    views?: number;
    hashtags: string[];
    permalink: string;
    thumbnail: string;
    timestamp: string;
  }>;
  topHashtags: Array<{
    tag: string;
    count: number;
    avgEngagement: number;
  }>;
  insights: {
    avgEngagementRate: number;
    totalPosts: number;
    bestPostingTime: string;
  };
}

/**
 * Instagram Reels/投稿を取得
 */
export async function getInstagramMedia(
  igUserId: string,
  pageAccessToken: string,
  limit = 25
): Promise<InstagramMedia[]> {
  const response = await graphFetch<{ data?: InstagramMedia[] }>(
    `${igUserId}/media`,
    {
      access_token: pageAccessToken,
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: limit.toString(),
    }
  );

  return response.data || [];
}

/**
 * メディアのインサイトを取得
 */
export async function getMediaInsights(
  mediaId: string,
  pageAccessToken: string,
  mediaType: string
): Promise<InstagramMedia['insights']> {
  try {
    // Reelsの場合
    if (mediaType === 'REELS' || mediaType === 'VIDEO') {
      const response = await graphFetch<{ data?: Array<{ name: string; values: Array<{ value: number }> }> }>(
        `${mediaId}/insights`,
        {
          access_token: pageAccessToken,
          metric: 'impressions,reach,saved,plays',
        }
      );

      const insights: InstagramMedia['insights'] = {};
      response.data?.forEach((metric) => {
        const value = metric.values?.[0]?.value;
        if (value !== undefined) {
          if (metric.name === 'impressions') insights.impressions = value;
          if (metric.name === 'reach') insights.reach = value;
          if (metric.name === 'saved') insights.saved = value;
          if (metric.name === 'plays') insights.plays = value;
        }
      });

      return insights;
    }

    // 画像/カルーセルの場合
    const response = await graphFetch<{ data?: Array<{ name: string; values: Array<{ value: number }> }> }>(
      `${mediaId}/insights`,
      {
        access_token: pageAccessToken,
        metric: 'impressions,reach,saved',
      }
    );

    const insights: InstagramMedia['insights'] = {};
    response.data?.forEach((metric) => {
      const value = metric.values?.[0]?.value;
      if (value !== undefined) {
        if (metric.name === 'impressions') insights.impressions = value;
        if (metric.name === 'reach') insights.reach = value;
        if (metric.name === 'saved') insights.saved = value;
      }
    });

    return insights;
  } catch (error: any) {
    // ビジネスアカウント変更前のメディアなど、インサイトが取得できない場合はスキップ
    console.warn(`Failed to fetch insights for media ${mediaId}:`, error?.message || error);
    return {};
  }
}

/**
 * キャプションからハッシュタグを抽出
 */
function extractHashtags(caption?: string): string[] {
  if (!caption) return [];
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  return caption.match(hashtagRegex) || [];
}

/**
 * エンゲージメント率を計算
 */
function calculateEngagementRate(
  likes: number,
  comments: number,
  reach?: number,
  impressions?: number
): number {
  const engagement = likes + comments;
  const base = reach || impressions || 1;
  return (engagement / base) * 100;
}

/**
 * トレンド分析を実行
 */
export async function analyzeInstagramTrends(
  igUserId: string,
  pageAccessToken: string
): Promise<TrendAnalysis> {
  // メディアを取得
  const media = await getInstagramMedia(igUserId, pageAccessToken, 25);

  // インサイトを取得（並列処理、エラーは個別にハンドリング）
  const mediaWithInsights = await Promise.all(
    media.map(async (item) => {
      try {
        const insights = await getMediaInsights(item.id, pageAccessToken, item.media_type);
        return { ...item, insights };
      } catch (error: any) {
        // 個別のメディアでエラーが発生してもスキップして続行
        console.warn(`Skipping media ${item.id} due to error:`, error?.message || error);
        return { ...item, insights: {} };
      }
    })
  );

  // エンゲージメント率を計算してソート
  const postsWithEngagement = mediaWithInsights
    .map((item) => ({
      id: item.id,
      caption: item.caption || '',
      likes: item.like_count || 0,
      comments: item.comments_count || 0,
      views: item.insights?.plays || item.insights?.video_views,
      reach: item.insights?.reach,
      impressions: item.insights?.impressions,
      hashtags: extractHashtags(item.caption),
      permalink: item.permalink,
      thumbnail: item.thumbnail_url || item.media_url || '',
      timestamp: item.timestamp,
      engagementRate: calculateEngagementRate(
        item.like_count || 0,
        item.comments_count || 0,
        item.insights?.reach,
        item.insights?.impressions
      ),
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // トップ投稿（上位10件）
  const topPosts = postsWithEngagement.slice(0, 10);

  // ハッシュタグ分析
  const hashtagMap = new Map<string, { count: number; totalEngagement: number }>();
  postsWithEngagement.forEach((post) => {
    post.hashtags.forEach((tag) => {
      const current = hashtagMap.get(tag) || { count: 0, totalEngagement: 0 };
      hashtagMap.set(tag, {
        count: current.count + 1,
        totalEngagement: current.totalEngagement + post.engagementRate,
      });
    });
  });

  const topHashtags = Array.from(hashtagMap.entries())
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      avgEngagement: data.totalEngagement / data.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 10);

  // 平均エンゲージメント率
  const avgEngagementRate =
    postsWithEngagement.length > 0
      ? postsWithEngagement.reduce((sum, post) => sum + post.engagementRate, 0) / postsWithEngagement.length
      : 0;

  // 投稿時間分析（簡易版）
  const hourCounts = new Array(24).fill(0);
  postsWithEngagement.forEach((post) => {
    const hour = new Date(post.timestamp).getHours();
    hourCounts[hour]++;
  });
  const maxCount = Math.max(...hourCounts);
  const bestHour = maxCount > 0 ? hourCounts.indexOf(maxCount) : 12;
  const bestPostingTime = `${bestHour}:00-${bestHour + 1}:00`;

  return {
    topPosts,
    topHashtags,
    insights: {
      avgEngagementRate,
      totalPosts: media.length,
      bestPostingTime,
    },
  };
}
