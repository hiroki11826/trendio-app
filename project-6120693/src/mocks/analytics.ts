export const globalKPIs = {
  totalFollowers: 124500,
  followerGrowth: 12.5,
  totalImpressions: 2400000,
  engagementRate: 4.8
};

export const instagramAnalytics = {
  totalImpressions: 1850000,
  impressionsBySource: {
    home: 920000,
    explore: 485000,
    hashtag: 315000,
    profile: 130000
  },
  reelsPlays: 1250000,
  saves: 18500,
  profileVisits: 45200
};

export const tiktokAnalytics = {
  videoViews: 3200000,
  averageWatchTime: 18.5,
  audienceRetention: 62.3,
  completionRate: 45.8,
  profileVisits: 28900
};

// Instagram 詳細データ
export const instagramDetailData = {
  // フォロワー推移（過去12週間）
  followerTrend: {
    labels: ['10月1週', '10月2週', '10月3週', '10月4週', '11月1週', '11月2週', '11月3週', '11月4週', '12月1週', '12月2週', '12月3週', '12月4週'],
    values: [98200, 100500, 102100, 104800, 106300, 108900, 110200, 113500, 116000, 118700, 121400, 124500]
  },
  // サマリー指標
  summary: {
    followers: 124500,
    profileViews: 45200,
    totalImpressions: 1850000,
    totalReach: 1420000
  },
  // アクション推移（過去8週間）
  actionTrend: {
    labels: ['11月1週', '11月2週', '11月3週', '11月4週', '12月1週', '12月2週', '12月3週', '12月4週'],
    likes: [4200, 4800, 5100, 4900, 5600, 6200, 5800, 6500],
    comments: [320, 380, 410, 350, 420, 480, 450, 520],
    saves: [1800, 2100, 2300, 2000, 2500, 2800, 2600, 3100],
    siteClicks: [890, 950, 1020, 980, 1100, 1250, 1180, 1350]
  },
  // アクション合計
  actionSummary: {
    likes: 43100,
    comments: 3330,
    saves: 19200,
    siteClicks: 8720
  },
  // フォロワー男女比（期間別）
  genderByPeriod: [
    { label: '9月', male: 38, female: 58, other: 4 },
    { label: '10月', male: 37, female: 59, other: 4 },
    { label: '11月', male: 36, female: 60, other: 4 },
    { label: '12月', male: 35, female: 61, other: 4 }
  ],
  // フォロワー男女比（現在）
  genderRatio: {
    male: 35,
    female: 61,
    other: 4
  },
  // フォロワー地域
  regions: [
    { name: '東京都', value: 32400, percentage: 26.0 },
    { name: '大阪府', value: 15600, percentage: 12.5 },
    { name: '神奈川県', value: 12100, percentage: 9.7 },
    { name: '愛知県', value: 9200, percentage: 7.4 },
    { name: '福岡県', value: 7800, percentage: 6.3 },
    { name: '北海道', value: 6500, percentage: 5.2 },
    { name: '兵庫県', value: 5800, percentage: 4.7 },
    { name: '埼玉県', value: 5200, percentage: 4.2 },
    { name: '千葉県', value: 4800, percentage: 3.9 },
    { name: 'その他', value: 25100, percentage: 20.1 }
  ],
  // 投稿時間帯別エンゲージメント
  postingHours: [
    { hour: '6時', engagement: 120 },
    { hour: '7時', engagement: 280 },
    { hour: '8時', engagement: 450 },
    { hour: '9時', engagement: 380 },
    { hour: '10時', engagement: 320 },
    { hour: '11時', engagement: 410 },
    { hour: '12時', engagement: 680 },
    { hour: '13時', engagement: 520 },
    { hour: '14時', engagement: 390 },
    { hour: '15時', engagement: 350 },
    { hour: '16時', engagement: 410 },
    { hour: '17時', engagement: 530 },
    { hour: '18時', engagement: 720 },
    { hour: '19時', engagement: 890 },
    { hour: '20時', engagement: 950 },
    { hour: '21時', engagement: 870 },
    { hour: '22時', engagement: 640 },
    { hour: '23時', engagement: 380 }
  ]
};

export const recentPosts = [
  {
    id: 1,
    platform: 'instagram',
    thumbnail: 'https://readdy.ai/api/search-image?query=modern%20minimalist%20product%20photography%20with%20clean%20white%20background%20showcasing%20elegant%20lifestyle%20items%20in%20soft%20natural%20lighting%20with%20professional%20composition%20and%20subtle%20shadows&width=400&height=400&seq=post1&orientation=squarish',
    caption: '新商品のご紹介！限定カラーが登場しました',
    impressions: 125000,
    engagement: 8500,
    date: '2024-01-15',
    isHighPerforming: true
  },
  {
    id: 2,
    platform: 'tiktok',
    thumbnail: 'https://readdy.ai/api/search-image?query=dynamic%20action%20shot%20of%20trendy%20lifestyle%20content%20with%20vibrant%20colors%20and%20energetic%20composition%20perfect%20for%20social%20media%20featuring%20modern%20aesthetic%20and%20eye%20catching%20visual%20elements&width=400&height=400&seq=post2&orientation=squarish',
    caption: 'トレンドの使い方を解説！',
    impressions: 285000,
    engagement: 15200,
    date: '2024-01-14',
    isHighPerforming: true
  },
  {
    id: 3,
    platform: 'instagram',
    thumbnail: 'https://readdy.ai/api/search-image?query=elegant%20flat%20lay%20photography%20with%20carefully%20arranged%20items%20on%20pristine%20white%20surface%20featuring%20soft%20shadows%20and%20minimalist%20aesthetic%20perfect%20for%20lifestyle%20brand%20content&width=400&height=400&seq=post3&orientation=squarish',
    caption: 'お客様の声をご紹介',
    impressions: 98000,
    engagement: 6200,
    date: '2024-01-13',
    isHighPerforming: false
  },
  {
    id: 4,
    platform: 'tiktok',
    thumbnail: 'https://readdy.ai/api/search-image?query=creative%20behind%20the%20scenes%20content%20showing%20authentic%20moments%20with%20warm%20lighting%20and%20engaging%20composition%20ideal%20for%20social%20media%20storytelling%20with%20natural%20and%20relatable%20atmosphere&width=400&height=400&seq=post4&orientation=squarish',
    caption: 'ビハインドシーン公開',
    impressions: 156000,
    engagement: 9800,
    date: '2024-01-12',
    isHighPerforming: false
  },
  {
    id: 5,
    platform: 'instagram',
    thumbnail: 'https://readdy.ai/api/search-image?query=professional%20product%20showcase%20with%20sophisticated%20lighting%20and%20clean%20composition%20on%20neutral%20background%20highlighting%20premium%20quality%20and%20attention%20to%20detail%20perfect%20for%20brand%20marketing&width=400&height=400&seq=post5&orientation=squarish',
    caption: 'キャンペーン開始のお知らせ',
    impressions: 142000,
    engagement: 11500,
    date: '2024-01-11',
    isHighPerforming: true
  },
  {
    id: 6,
    platform: 'tiktok',
    thumbnail: 'https://readdy.ai/api/search-image?query=engaging%20tutorial%20style%20content%20with%20clear%20visual%20elements%20and%20bright%20lighting%20showing%20step%20by%20step%20process%20in%20modern%20setting%20perfect%20for%20educational%20social%20media%20content&width=400&height=400&seq=post6&orientation=squarish',
    caption: 'チュートリアル動画',
    impressions: 198000,
    engagement: 13400,
    date: '2024-01-10',
    isHighPerforming: false
  }
];

export const trendingHashtags = [
  { tag: '#新商品', posts: 1250000, growth: 45.2 },
  { tag: '#ライフスタイル', posts: 980000, growth: 32.8 },
  { tag: '#おすすめ', posts: 2100000, growth: 28.5 },
  { tag: '#トレンド', posts: 1580000, growth: 52.3 },
  { tag: '#バイラル', posts: 890000, growth: 67.9 }
];

export const trendingAudios = [
  { name: 'Summer Vibes Mix', uses: 2500000, trend: 'up' },
  { name: 'Chill Beats 2024', uses: 1800000, trend: 'up' },
  { name: 'Energetic Pop', uses: 1200000, trend: 'stable' }
];

export const performanceChartData = {
  instagram: {
    labels: ['1/1', '1/3', '1/5', '1/7', '1/9', '1/11', '1/13', '1/15'],
    impressions: [145000, 152000, 148000, 168000, 175000, 182000, 178000, 185000],
    engagement: [6800, 7200, 7000, 8100, 8500, 8900, 8600, 8900]
  },
  tiktok: {
    labels: ['1/1', '1/3', '1/5', '1/7', '1/9', '1/11', '1/13', '1/15'],
    views: [185000, 198000, 215000, 245000, 268000, 285000, 295000, 320000],
    engagement: [8200, 9100, 10200, 11800, 13200, 14500, 15100, 16200]
  }
};
