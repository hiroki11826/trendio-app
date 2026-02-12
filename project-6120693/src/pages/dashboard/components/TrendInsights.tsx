interface TrendInsightsProps {
  hashtags: Array<{ tag: string; posts: number; growth: number }>;
  audios: Array<{ name: string; uses: number; trend: string }>;
}

export default function TrendInsights({ hashtags, audios }: TrendInsightsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
            <i className="ri-hashtag text-xl text-emerald-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">トレンドハッシュタグ</h3>
            <p className="text-sm text-gray-500">人気上昇中</p>
          </div>
        </div>

        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{hashtag.tag}</p>
                  <p className="text-xs text-gray-500">{formatNumber(hashtag.posts)} 投稿</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                  +{hashtag.growth}%
                </span>
                <i className="ri-arrow-right-line text-gray-400"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50">
            <i className="ri-music-2-line text-xl text-teal-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">トレンドオーディオ</h3>
            <p className="text-sm text-gray-500">人気の音源</p>
          </div>
        </div>

        <div className="space-y-3">
          {audios.map((audio, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                  <i className="ri-music-2-fill text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{audio.name}</p>
                  <p className="text-xs text-gray-500">{formatNumber(audio.uses)} 使用</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {audio.trend === 'up' ? (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50">
                    <i className="ri-arrow-up-line text-emerald-600"></i>
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                    <i className="ri-subtract-line text-gray-600"></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all cursor-pointer whitespace-nowrap">
          トレンドをもっと見る
        </button>
      </div>
    </div>
  );
}
