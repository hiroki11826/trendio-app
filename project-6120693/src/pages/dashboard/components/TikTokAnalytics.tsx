interface TikTokAnalyticsProps {
  data: {
    videoViews: number;
    averageWatchTime: number;
    audienceRetention: number;
    completionRate: number;
    profileVisits: number;
  };
}

export default function TikTokAnalytics({ data }: TikTokAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metrics = [
    { 
      label: '動画視聴回数', 
      value: formatNumber(data.videoViews), 
      icon: 'ri-play-circle-line',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      label: '平均視聴時間', 
      value: `${data.averageWatchTime}秒`, 
      icon: 'ri-time-line',
      color: 'from-teal-500 to-cyan-500'
    },
    { 
      label: '視聴維持率', 
      value: `${data.audienceRetention}%`, 
      icon: 'ri-line-chart-line',
      color: 'from-cyan-500 to-sky-500'
    },
    { 
      label: '完全視聴率', 
      value: `${data.completionRate}%`, 
      icon: 'ri-checkbox-circle-line',
      color: 'from-sky-500 to-indigo-500'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-700">
            <i className="ri-tiktok-line text-xl text-white"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">TikTok アナリティクス</h3>
            <p className="text-sm text-gray-500">パフォーマンス分析</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${metric.color} mb-3`}>
              <i className={`${metric.icon} text-lg text-white`}></i>
            </div>
            <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
            <p className="text-xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="ri-user-search-line text-emerald-600 text-lg"></i>
            <p className="text-sm font-medium text-gray-700">プロフィール訪問数</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data.profileVisits)}</p>
        </div>
      </div>
    </div>
  );
}
