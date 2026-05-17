const XAI_API_BASE = "https://api.x.ai/v1";
const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_MODEL = process.env.XAI_MODEL || "grok-4.20-0309-non-reasoning";

export class GrokApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Grok API request failed (${status})`);
    this.name = "GrokApiError";
    Object.setPrototypeOf(this, GrokApiError.prototype);
    this.status = status;
    this.body = body;
  }
}

type GrokMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GrokChatCompletionRequest = {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

type GrokChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export const chatCompletion = async (
  messages: GrokMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> => {
  if (!XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not configured");
  }

  const requestBody: GrokChatCompletionRequest = {
    model: XAI_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 2000,
    stream: false,
  };

  const response = await fetch(`${XAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new GrokApiError(
      response.status,
      errorBody,
      `Grok API request failed: ${response.statusText}`
    );
  }

  const data = (await response.json()) as GrokChatCompletionResponse;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new GrokApiError(500, data, "No content in Grok API response");
  }

  return content;
};

export const generateContentIdeas = async (
  industry: string,
  goal: string,
  freeInput?: string
): Promise<Array<{
  title: string;
  concept: string;
  format: string;
  hook: string;
  structure: string[];
  caption: string;
  hashtags: string;
}>> => {
  const systemPrompt = `あなたはSNSマーケティングの専門家です。InstagramとTikTok向けのバズるコンテンツ企画を提案してください。`;

  const additionalContext = freeInput ? `\n\n追加の要望: ${freeInput}` : '';

  const userPrompt = `
業界: ${industry}
マーケティング目標: ${goal}${additionalContext}

上記の条件で、SNSでバズりやすいコンテンツアイデアを4つ提案してください。

【出力ルール】
・コンテンツアイデアは 4個 生成してください
・各アイデアはSNS投稿として実際に使えるレベルで具体化してください
・投稿は Instagram / TikTok向けショートコンテンツ を想定してください
・タイトルは興味を引くものにしてください
・フック（最初の3秒）を必ず入れてください

【出力のポイント】
・バズりやすい構成にする
・SNSでよくあるフォーマットを活用する
  例：
  - ○○3選
  - 知らないと損
  - プロが教える
  - ビフォーアフター
  - NG行動
・専門性、共感、実用性のいずれかを含める
・SNSユーザーが「保存したくなる」「シェアしたくなる」内容にする

以下のJSON形式で回答してください:
[
  {
    "title": "投稿タイトル（興味を引くもの）",
    "concept": "投稿コンセプト（50文字程度）",
    "format": "投稿形式（例：ショート動画 / カルーセル / 画像投稿）",
    "hook": "フック（最初の3秒で視聴者を引き込むメッセージ）",
    "structure": ["構成1", "構成2", "構成3", "構成4", "構成5"],
    "caption": "キャプション例（実際に使える文章）",
    "hashtags": "推奨ハッシュタグ（スペース区切り）"
  }
]

JSONのみを返してください。説明文は不要です。
`;

  const messages: GrokMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatCompletion(messages, {
    temperature: 0.8,
    max_tokens: 3000,
  });

  // JSONを抽出（マークダウンのコードブロックを除去）
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON from Grok response");
  }

  return JSON.parse(jsonMatch[0]);
};

export const generateScript = async (
  contentIdea: {
    title: string;
    concept: string;
    format: string;
    hook: string;
    structure: string[];
    caption: string;
    hashtags: string;
  },
  context: {
    industry: string;
    goal: string;
    freeInput?: string;
  }
): Promise<{
  videoTitle: string;
  objective: string;
  timeline: Array<{ time: string; content: string }>;
  fullScript: string;
  shootingInstructions: Array<{ scene: string; instruction: string }>;
  telops: string[];
  captionText: string;
  hashtags: string;
  thumbnailIdea: string;
  estimatedDuration: string;
  whyItWorks: string;
}> => {
  const systemPrompt = `あなたはSNSショート動画（Instagram リール / TikTok）の台本作成の専門家です。実際に撮影できる、バズりやすい詳細台本を作成してください。`;

  const additionalContext = context.freeInput ? `\n追加の要望: ${context.freeInput}` : '';

  const userPrompt = `
【コンテンツアイデア情報】
タイトル: ${contentIdea.title}
コンセプト: ${contentIdea.concept}
投稿形式: ${contentIdea.format}
フック: ${contentIdea.hook}
投稿構成: ${contentIdea.structure.join(', ')}

【ビジネス情報】
業界: ${context.industry}
マーケティング目標: ${context.goal}${additionalContext}

上記のコンテンツアイデアを元に、Instagram リール / TikTok 向けの詳細な動画台本を作成してください。

【出力条件】
・SNSユーザーが「保存したくなる」内容
・TikTok / Instagramリール向け
・動画尺は30〜60秒を想定
・実際に撮影できる内容にする
・投稿者がそのまま話せるレベルの具体的なセリフ

以下のJSON形式で回答してください:
{
  "videoTitle": "クリックしたくなる動画タイトル",
  "objective": "この投稿の狙い（例：保存率を高める、専門性をアピールする、フォロワー獲得）",
  "timeline": [
    { "time": "0-3秒", "content": "フック（視聴者の興味を引く）" },
    { "time": "3-8秒", "content": "問題提起" },
    { "time": "8-18秒", "content": "ポイント1" },
    { "time": "18-28秒", "content": "ポイント2" },
    { "time": "28-35秒", "content": "まとめ" },
    { "time": "35-40秒", "content": "CTA（保存・フォロー促進）" }
  ],
  "fullScript": "投稿者がそのまま話せる完全なセリフ台本（改行を\\nで表現）",
  "shootingInstructions": [
    { "scene": "シーン1", "instruction": "顔アップで話す" },
    { "scene": "シーン2", "instruction": "商品を見せる" },
    { "scene": "シーン3", "instruction": "テロップ表示" }
  ],
  "telops": ["動画内で表示するテキスト1", "テキスト2", "テキスト3"],
  "captionText": "Instagram / TikTok投稿文（実際に使える文章）",
  "hashtags": "関連性の高いハッシュタグ（スペース区切り）",
  "thumbnailIdea": "サムネイル文字例（例：肌荒れ治らない人これやめて）",
  "estimatedDuration": "40秒",
  "whyItWorks": "この投稿が伸びやすい理由（例：NG系コンテンツは保存率が高い、専門家視点で信頼性が高い）"
}

JSONのみを返してください。説明文は不要です。
`;

  const messages: GrokMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 3500,
  });

  // JSONを抽出
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON from Grok response");
  }

  return JSON.parse(jsonMatch[0]);
};


export const analyzeTrends = async (
  industry: string,
  platform: 'instagram' | 'tiktok' | 'both' = 'both'
): Promise<{
  trendingTopics: Array<{
    topic: string;
    description: string;
    whyTrending: string;
    exampleTitles: string[];
  }>;
  popularHashtags: Array<{
    hashtag: string;
    category: string;
    usage: string;
  }>;
  contentFormats: Array<{
    format: string;
    description: string;
    effectiveness: string;
  }>;
  insights: {
    summary: string;
    recommendations: string[];
  };
}> => {
  const platformText = platform === 'both' ? 'InstagramとTikTok' : platform === 'instagram' ? 'Instagram' : 'TikTok';
  
  const systemPrompt = `あなたはSNSトレンド分析の専門家です。最新のSNSトレンド情報を提供してください。`;

  const userPrompt = `
業界: ${industry}
プラットフォーム: ${platformText}

上記の業界で、現在${platformText}でバズっているコンテンツのトレンドを分析してください。

【分析内容】
1. トレンドトピック（今バズっているテーマ）
2. 人気のハッシュタグ
3. 効果的なコンテンツ形式
4. 総合的なインサイトと推奨事項

以下のJSON形式で回答してください:
{
  "trendingTopics": [
    {
      "topic": "トピック名",
      "description": "このトピックの説明（50文字程度）",
      "whyTrending": "なぜ今バズっているか",
      "exampleTitles": ["具体的な投稿タイトル例1", "例2", "例3"]
    }
  ],
  "popularHashtags": [
    {
      "hashtag": "#ハッシュタグ",
      "category": "カテゴリー（例：業界用語、トレンド、一般）",
      "usage": "使い方のヒント"
    }
  ],
  "contentFormats": [
    {
      "format": "コンテンツ形式名（例：ビフォーアフター動画）",
      "description": "形式の説明",
      "effectiveness": "なぜ効果的か"
    }
  ],
  "insights": {
    "summary": "トレンドの総合的なまとめ（100文字程度）",
    "recommendations": ["推奨事項1", "推奨事項2", "推奨事項3"]
  }
}

【出力ルール】
・トレンドトピックは5個程度
・人気ハッシュタグは10個程度
・コンテンツ形式は5個程度
・実際に使える具体的な情報を提供
・最新のトレンドを反映

JSONのみを返してください。説明文は不要です。
`;

  const messages: GrokMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 3000,
  });

  // JSONを抽出
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON from Grok response");
  }

  return JSON.parse(jsonMatch[0]);
};


export const generateInsightReport = async (
  platform: 'instagram' | 'tiktok',
  data: {
    // Instagram data
    followers?: number;
    followersGrowth?: number;
    reach?: number;
    impressions?: number;
    profileViews?: number;
    websiteClicks?: number;
    engagementRate?: number;
    topPosts?: Array<{
      caption?: string;
      likeCount?: number;
      commentCount?: number;
      mediaType?: string;
    }>;
    demographics?: {
      gender?: Record<string, number>;
      ageGroups?: Record<string, number>;
      topCities?: Record<string, number>;
      topCountries?: Record<string, number>;
    };
    // TikTok data
    likesCount?: number;
    videoCount?: number;
    followingCount?: number;
    videos?: Array<{
      title?: string;
      viewCount?: number;
      likeCount?: number;
      commentCount?: number;
      shareCount?: number;
    }>;
  }
): Promise<{
  title: string;
  generatedAt: string;
  executiveSummary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    analysis: string;
  }>;
  sections: Array<{
    title: string;
    icon: string;
    content: string;
  }>;
  recommendations: string[];
  conclusion: string;
}> => {
  const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok';
  
  const systemPrompt = `あなたはSNSマーケティングアナリストです。${platformName}のパフォーマンスデータを分析し、詳細なインサイトレポートを作成してください。`;

  let dataDescription = '';
  
  if (platform === 'instagram') {
    dataDescription = `
【Instagramアカウントデータ】
- フォロワー数: ${data.followers?.toLocaleString() || '不明'}
- フォロワー増減: ${data.followersGrowth !== undefined ? (data.followersGrowth >= 0 ? '+' : '') + data.followersGrowth : '不明'}
- リーチ: ${data.reach?.toLocaleString() || '不明'}
- インプレッション: ${data.impressions?.toLocaleString() || '不明'}
- プロフィール閲覧数: ${data.profileViews?.toLocaleString() || '不明'}
- ウェブサイトクリック: ${data.websiteClicks?.toLocaleString() || '不明'}
- エンゲージメント率: ${data.engagementRate !== undefined ? data.engagementRate.toFixed(2) + '%' : '不明'}

【人気投稿】
${data.topPosts?.slice(0, 5).map((post, i) => 
  `${i + 1}. いいね: ${post.likeCount || 0}, コメント: ${post.commentCount || 0}, タイプ: ${post.mediaType || '不明'}`
).join('\n') || 'データなし'}

【フォロワー属性】
- 性別分布: ${data.demographics?.gender ? JSON.stringify(data.demographics.gender) : '不明'}
- 年齢層: ${data.demographics?.ageGroups ? JSON.stringify(data.demographics.ageGroups) : '不明'}
- 上位都市: ${data.demographics?.topCities ? JSON.stringify(data.demographics.topCities) : '不明'}
`;
  } else {
    const totalViews = data.videos?.reduce((sum, v) => sum + (v.viewCount || 0), 0) || 0;
    const totalLikes = data.videos?.reduce((sum, v) => sum + (v.likeCount || 0), 0) || 0;
    const avgViews = data.videos?.length ? Math.round(totalViews / data.videos.length) : 0;
    const avgEngagement = data.followers && data.videos?.length 
      ? ((totalLikes / data.videos.length) / data.followers * 100).toFixed(2)
      : '不明';

    dataDescription = `
【TikTokアカウントデータ】
- フォロワー数: ${data.followers?.toLocaleString() || '不明'}
- フォロー中: ${data.followingCount?.toLocaleString() || '不明'}
- 総いいね数: ${data.likesCount?.toLocaleString() || '不明'}
- 動画数: ${data.videoCount || '不明'}
- 平均視聴回数: ${avgViews.toLocaleString()}
- 平均エンゲージメント率: ${avgEngagement}%

【最近の動画パフォーマンス】
${data.videos?.slice(0, 5).map((video, i) => 
  `${i + 1}. "${video.title || '無題'}" - 視聴: ${video.viewCount?.toLocaleString() || 0}, いいね: ${video.likeCount?.toLocaleString() || 0}, コメント: ${video.commentCount || 0}, シェア: ${video.shareCount || 0}`
).join('\n') || 'データなし'}
`;
  }

  const userPrompt = `
${dataDescription}

上記の${platformName}アカウントデータを分析し、詳細なインサイトレポートを作成してください。

【レポート要件】
1. エグゼクティブサマリー（全体の概要と評価）
2. 主要指標の分析（各指標の意味と評価）
3. オーディエンス分析
4. コンテンツパフォーマンス分析
5. 改善のための具体的な推奨事項
6. 結論

以下のJSON形式で回答してください:
{
  "title": "${platformName}パフォーマンス分析レポート",
  "generatedAt": "${new Date().toISOString()}",
  "executiveSummary": "全体の概要と評価（200文字程度）",
  "keyMetrics": [
    {
      "label": "指標名",
      "value": "値",
      "trend": "up または down または stable",
      "analysis": "この指標の分析（50文字程度）"
    }
  ],
  "sections": [
    {
      "title": "セクションタイトル",
      "icon": "ri-アイコン名-line",
      "content": "セクションの内容（150文字程度）"
    }
  ],
  "recommendations": [
    "具体的な推奨事項1",
    "具体的な推奨事項2",
    "具体的な推奨事項3",
    "具体的な推奨事項4",
    "具体的な推奨事項5"
  ],
  "conclusion": "結論と今後の展望（100文字程度）"
}

【出力ルール】
・keyMetricsは4〜6個
・sectionsは4〜5個（オーディエンス分析、コンテンツ分析、エンゲージメント分析、リーチ分析など）
・recommendationsは5個
・具体的な数値を引用して分析
・実行可能な具体的なアドバイスを提供
・アイコンはRemixiconを使用（ri-user-line, ri-heart-line, ri-eye-line, ri-bar-chart-line, ri-lightbulb-line など）

JSONのみを返してください。説明文は不要です。
`;

  const messages: GrokMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 3500,
  });

  // JSONを抽出
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON from Grok response");
  }

  return JSON.parse(jsonMatch[0]);
};

export const generateCommentReply = async (
  commentText: string,
  username: string,
  postCaption?: string,
  language?: string
): Promise<string[]> => {
  const isJapanese = !language || language.startsWith('ja');
  const systemPrompt = isJapanese
    ? `あなたはInstagramのコメント返信の専門家です。ブランドの信頼性を高め、エンゲージメントを促進する自然で親しみやすい返信案を生成してください。`
    : `You are an expert in Instagram comment replies. Generate natural, friendly reply suggestions that build brand trust and promote engagement.`;

  const userPrompt = isJapanese
    ? `
以下のInstagramコメントに対する返信案を3つ生成してください。

コメント投稿者: @${username}
コメント内容: ${commentText}
${postCaption ? `投稿のキャプション: ${postCaption}` : ''}

【返信案の条件】
・自然で親しみやすいトーン
・50文字以内で簡潔に
・絵文字を1〜2個使用
・コメントの内容に具体的に反応する
・フォロワーとの関係を深める内容

以下のJSON形式で回答してください:
["返信案1", "返信案2", "返信案3"]

JSONのみを返してください。
`
    : `
Generate 3 reply suggestions for the following Instagram comment.

Commenter: @${username}
Comment: ${commentText}
${postCaption ? `Post caption: ${postCaption}` : ''}

Requirements:
- Natural and friendly tone
- Concise, under 50 words
- Use 1-2 emojis
- Respond specifically to the comment content
- Deepen the relationship with followers

Reply in the following JSON format:
["Reply 1", "Reply 2", "Reply 3"]

Return JSON only.
`;

  const messages: GrokMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatCompletion(messages, { temperature: 0.8, max_tokens: 500 });

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse reply suggestions");

  return JSON.parse(jsonMatch[0]);
};
