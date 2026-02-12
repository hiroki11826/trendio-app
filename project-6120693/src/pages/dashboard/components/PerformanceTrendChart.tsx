interface PerformanceTrendChartProps {
  data: {
    instagram: {
      labels: string[];
      impressions: number[];
      engagement: number[];
    };
    tiktok: {
      labels: string[];
      views: number[];
      engagement: number[];
    };
  };
}

export default function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const maxInstagram = Math.max(...data.instagram.impressions);
  const maxTikTok = Math.max(...data.tiktok.views);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">パフォーマンストレンド</h3>
          <p className="text-sm text-gray-500">過去2週間の推移</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"></div>
            <span className="text-xs text-gray-600">Instagram</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-900"></div>
            <span className="text-xs text-gray-600">TikTok</span>
          </div>
        </div>
      </div>

      <div className="relative h-80">
        <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#111827" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Instagram Line */}
          <path
            d={`M ${data.instagram.impressions.map((val, i) => 
              `${(i / (data.instagram.impressions.length - 1)) * 800} ${280 - (val / maxInstagram) * 240}`
            ).join(' L ')}`}
            fill="url(#instagramGradient)"
            stroke="none"
          />
          <path
            d={`M ${data.instagram.impressions.map((val, i) => 
              `${(i / (data.instagram.impressions.length - 1)) * 800} ${280 - (val / maxInstagram) * 240}`
            ).join(' L ')}`}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
          />
          {data.instagram.impressions.map((val, i) => (
            <circle 
              key={`ig-${i}`}
              cx={(i / (data.instagram.impressions.length - 1)) * 800}
              cy={280 - (val / maxInstagram) * 240}
              r="5"
              fill="#ec4899"
            />
          ))}

          {/* TikTok Line */}
          <path
            d={`M ${data.tiktok.views.map((val, i) => 
              `${(i / (data.tiktok.views.length - 1)) * 800} ${280 - (val / maxTikTok) * 240}`
            ).join(' L ')}`}
            fill="url(#tiktokGradient)"
            stroke="none"
          />
          <path
            d={`M ${data.tiktok.views.map((val, i) => 
              `${(i / (data.tiktok.views.length - 1)) * 800} ${280 - (val / maxTikTok) * 240}`
            ).join(' L ')}`}
            fill="none"
            stroke="#111827"
            strokeWidth="3"
          />
          {data.tiktok.views.map((val, i) => (
            <circle 
              key={`tt-${i}`}
              cx={(i / (data.tiktok.views.length - 1)) * 800}
              cy={280 - (val / maxTikTok) * 240}
              r="5"
              fill="#111827"
            />
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
          {data.instagram.labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Instagram 平均インプレッション</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNumber(data.instagram.impressions.reduce((a, b) => a + b, 0) / data.instagram.impressions.length)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">TikTok 平均視聴回数</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNumber(data.tiktok.views.reduce((a, b) => a + b, 0) / data.tiktok.views.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
