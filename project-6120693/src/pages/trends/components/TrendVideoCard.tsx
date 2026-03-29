interface TrendVideoCardProps {
  video: {
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
  };
}

export default function TrendVideoCard({ video }: TrendVideoCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const getTitle = () => {
    if (!video.caption) return 'Untitled';
    const lines = video.caption.split('\n');
    return lines[0].substring(0, 50) + (lines[0].length > 50 ? '...' : '');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={video.thumbnail || 'https://via.placeholder.com/400x400?text=No+Image'} 
          alt={getTitle()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 whitespace-nowrap">
            <i className="ri-fire-fill text-orange-500 mr-1"></i>
            {video.engagementRate.toFixed(1)}%
          </span>
        </div>

        <div className="absolute top-3 left-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
            <i className="ri-instagram-line text-white"></i>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{getTitle()}</h3>
          <div className="flex items-center space-x-3 text-white/90 text-xs mb-2">
            <span className="flex items-center whitespace-nowrap">
              <i className="ri-heart-line mr-1"></i>
              {formatNumber(video.likes)}
            </span>
            <span className="flex items-center whitespace-nowrap">
              <i className="ri-chat-3-line mr-1"></i>
              {formatNumber(video.comments)}
            </span>
            {video.views && (
              <span className="flex items-center whitespace-nowrap">
                <i className="ri-eye-line mr-1"></i>
                {formatNumber(video.views)}
              </span>
            )}
          </div>
          <div className="text-white/70 text-xs">
            {formatDate(video.timestamp)}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={video.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="ri-external-link-line text-2xl text-gray-900"></i>
          </a>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {video.hashtags.slice(0, 5).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {video.hashtags.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
              +{video.hashtags.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
