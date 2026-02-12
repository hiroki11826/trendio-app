interface Post {
  id: number;
  platform: string;
  thumbnail: string;
  caption: string;
  impressions: number;
  engagement: number;
  date: string;
  isHighPerforming: boolean;
}

interface PostPerformanceTableProps {
  posts: Post[];
}

export default function PostPerformanceTable({ posts }: PostPerformanceTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">投稿パフォーマンス</h3>
          <p className="text-sm text-gray-500">最近の投稿分析</p>
        </div>
        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer whitespace-nowrap">
          すべて表示
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
          >
            <div className="relative">
              <img 
                src={post.thumbnail} 
                alt={post.caption}
                className="w-16 h-16 rounded-lg object-cover object-top"
              />
              {post.isHighPerforming && (
                <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                  <i className="ri-fire-fill text-white text-xs"></i>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <i className={`${post.platform === 'instagram' ? 'ri-instagram-line text-pink-600' : 'ri-tiktok-line text-gray-900'} text-sm`}></i>
                <p className="text-sm font-medium text-gray-900 truncate">{post.caption}</p>
              </div>
              <p className="text-xs text-gray-500">{formatDate(post.date)}</p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">インプレッション</p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(post.impressions)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">エンゲージメント</p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(post.engagement)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">率</p>
                <p className="text-sm font-bold text-emerald-600">
                  {((post.engagement / post.impressions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
