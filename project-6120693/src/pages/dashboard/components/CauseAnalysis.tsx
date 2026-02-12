
interface CauseAnalysisProps {
  instagram: {
    totalImpressions: number;
    impressionsBySource: {
      home: number;
      explore: number;
      hashtag: number;
      profile: number;
    };
    reelsPlays: number;
    saves: number;
  };
  tiktok: {
    videoViews: number;
    audienceRetention: number;
    completionRate: number;
  };
}

export default function CauseAnalysis({ instagram, tiktok }: CauseAnalysisProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const total = Object.values(instagram.impressionsBySource).reduce((a, b) => a + b, 0);
  
  const sources = [
    { name: 'Home', value: instagram.impressionsBySource.home, icon: 'ri-home-4-line' },
    { name: 'Explore', value: instagram.impressionsBySource.explore, icon: 'ri-compass-3-line' },
    { name: 'Hashtag', value: instagram.impressionsBySource.hashtag, icon: 'ri-hashtag' },
  ];

  const getBarWidth = (value: number) => `${(value / total) * 100}%`;

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Why is this happening?</h2>
        <p className="text-sm text-gray-500">Breakdown by platform and source</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instagram Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-400">
              <i className="ri-instagram-line text-xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Instagram</h3>
              <p className="text-xs text-gray-500">{formatNumber(instagram.totalImpressions)} impressions</p>
            </div>
          </div>

          {/* Impression Sources */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Impression Sources</p>
            <div className="space-y-3">
              {sources.map((source, index) => {
                const percentage = ((source.value / total) * 100).toFixed(0);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <i className={`${source.icon} text-gray-500 text-sm`}></i>
                        <span className="text-sm text-gray-700">{source.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{formatNumber(source.value)}</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-400 to-orange-400 rounded-full transition-all"
                        style={{ width: getBarWidth(source.value) }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-movie-line text-pink-500"></i>
                <span className="text-xs text-gray-500">Reels Plays</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(instagram.reelsPlays)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-bookmark-line text-pink-500"></i>
                <span className="text-xs text-gray-500">Saves</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(instagram.saves)}</p>
            </div>
          </div>
        </div>

        {/* TikTok Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900">
              <i className="ri-tiktok-line text-xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">TikTok</h3>
              <p className="text-xs text-gray-500">{formatNumber(tiktok.videoViews)} video views</p>
            </div>
          </div>

          {/* Video Performance */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Video Performance</p>
            
            {/* Audience Retention */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Audience Retention</span>
                <span className="text-sm font-bold text-gray-900">{tiktok.audienceRetention}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full transition-all relative"
                  style={{ width: `${tiktok.audienceRetention}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-900"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">0%</span>
                <span className="text-xs text-emerald-500 font-medium">Good: 60%+</span>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">{tiktok.completionRate}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all relative"
                  style={{ width: `${tiktok.completionRate}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-emerald-500"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">0%</span>
                <span className="text-xs text-emerald-500 font-medium">Good: 40%+</span>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 flex-shrink-0">
                <i className="ri-lightbulb-line text-amber-400"></i>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Key Insight</p>
                <p className="text-xs text-gray-300">
                  {tiktok.completionRate > 40 
                    ? "Strong completion rate! Your content hooks viewers effectively."
                    : "Consider shorter videos or stronger hooks in the first 3 seconds."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
