interface InstagramAnalyticsProps {
  data: {
    totalImpressions: number;
    impressionsBySource: {
      home: number;
      explore: number;
      hashtag: number;
      profile: number;
    };
    reelsPlays: number;
    saves: number;
    profileVisits: number;
  };
}

export default function InstagramAnalytics({ data }: InstagramAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sources = [
    { name: 'ホーム', value: data.impressionsBySource.home, color: 'from-emerald-500 to-teal-500', icon: 'ri-home-4-line' },
    { name: '発見', value: data.impressionsBySource.explore, color: 'from-teal-500 to-cyan-500', icon: 'ri-compass-3-line' },
    { name: 'ハッシュタグ', value: data.impressionsBySource.hashtag, color: 'from-cyan-500 to-sky-500', icon: 'ri-hashtag' },
    { name: 'プロフィール', value: data.impressionsBySource.profile, color: 'from-sky-500 to-indigo-500', icon: 'ri-user-line' }
  ];

  const total = Object.values(data.impressionsBySource).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-50 to-orange-50">
            <i className="ri-instagram-line text-xl text-pink-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Instagram アナリティクス</h3>
            <p className="text-sm text-gray-500">インプレッション分析</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">合計インプレッション</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data.totalImpressions)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {sources.map((source, index) => {
          const percentage = ((source.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${source.color} mb-3`}>
                <i className={`${source.icon} text-lg text-white`}></i>
              </div>
              <p className="text-xs text-gray-600 mb-1">{source.name}</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(source.value)}</p>
              <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-movie-line text-emerald-600"></i>
            <p className="text-sm font-medium text-gray-700">リール再生数</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data.reelsPlays)}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-bookmark-line text-teal-600"></i>
            <p className="text-sm font-medium text-gray-700">保存数</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data.saves)}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-user-search-line text-cyan-600"></i>
            <p className="text-sm font-medium text-gray-700">プロフィール訪問</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data.profileVisits)}</p>
        </div>
      </div>
    </div>
  );
}
