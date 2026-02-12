
import { tiktokAnalytics, performanceChartData } from '../../../mocks/analytics';

export default function TikTokDetail() {
  const data = tiktokAnalytics;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const metrics = [
    { label: '動画視聴回数', value: formatNumber(data.videoViews), icon: 'ri-play-circle-line' },
    { label: '平均視聴時間', value: `${data.averageWatchTime}秒`, icon: 'ri-time-line' },
    { label: '視聴維持率', value: `${data.audienceRetention}%`, icon: 'ri-line-chart-line' },
    { label: '完全視聴率', value: `${data.completionRate}%`, icon: 'ri-checkbox-circle-line' },
  ];

  const chartData = performanceChartData.tiktok;
  const maxViews = Math.max(...chartData.views) * 1.1;

  const points = chartData.views.map((val, i) => ({
    x: 60 + (i / (chartData.views.length - 1)) * 700,
    y: 240 - (val / maxViews) * 200,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} 240 L ${points[0].x} 240 Z`;

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500">
          <i className="ri-tiktok-line text-lg text-white"></i>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
          <p className="text-xs text-gray-400">動画パフォーマンス・オーディエンス</p>
        </div>
      </div>

      {/* サマリー指標 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50">
                <i className={`${metric.icon} text-emerald-500 text-base`}></i>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{metric.label}</p>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* 視聴回数推移 & パフォーマンス */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* 視聴回数推移 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">視聴回数推移</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">過去2週間</p>
            </div>
          </div>
          <svg className="w-full" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="tiktokAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {Array.from({ length: 5 }, (_, i) => {
              const y = 240 - (i / 4) * 200;
              const val = (maxViews / 4) * i;
              return (
                <g key={i}>
                  <line x1="60" y1={y} x2="760" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  <text x="50" y={y + 4} textAnchor="end" className="text-[10px]" fill="#d1d5db">
                    {formatNumber(Math.round(val))}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} fill="url(#tiktokAreaGrad)" />
            <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#10b981" strokeWidth="2" />
            ))}

            {chartData.labels.map((label, i) => {
              const x = 60 + (i / (chartData.labels.length - 1)) * 700;
              return (
                <text key={i} x={x} y={265} textAnchor="middle" className="text-[10px]" fill="#d1d5db">
                  {label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* パフォーマンス指標 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">パフォーマンス</h3>

          {/* Audience Retention */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">視聴維持率</span>
              <span className="text-xs font-semibold text-gray-800">{data.audienceRetention}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${data.audienceRetention}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-300">0%</span>
              <span className="text-[10px] text-gray-400">目標: 60%+</span>
              <span className="text-[10px] text-gray-300">100%</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">完全視聴率</span>
              <span className="text-xs font-semibold text-gray-800">{data.completionRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${data.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-300">0%</span>
              <span className="text-[10px] text-gray-400">目標: 40%+</span>
              <span className="text-[10px] text-gray-300">100%</span>
            </div>
          </div>

          {/* Profile Visits */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-user-search-line text-emerald-500 text-sm"></i>
                <span className="text-xs text-gray-500">プロフィール訪問</span>
              </div>
              <span className="text-base font-semibold text-gray-800">{formatNumber(data.profileVisits)}</span>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-4 bg-emerald-600 rounded-lg p-4 text-white">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex items-center justify-center rounded bg-white/10 flex-shrink-0 mt-0.5">
                <i className="ri-lightbulb-line text-amber-300 text-xs"></i>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1">インサイト</p>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  {data.completionRate > 40
                    ? '完全視聴率が高く、コンテンツが視聴者を効果的に引きつけています。'
                    : '最初の3秒のフックを強化し、動画を短くすることを検討してください。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
