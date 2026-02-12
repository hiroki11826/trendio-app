
interface PostingHoursChartProps {
  data: Array<{
    hour: string;
    engagement: number;
  }>;
}

export default function PostingHoursChart({ data }: PostingHoursChartProps) {
  const maxEngagement = Math.max(...data.map(d => d.engagement));

  const getBarColor = (value: number) => {
    const ratio = value / maxEngagement;
    if (ratio >= 0.85) return 'bg-orange-500';
    if (ratio >= 0.6) return 'bg-orange-400';
    return 'bg-orange-200';
  };

  const topHours = [...data].sort((a, b) => b.engagement - a.engagement).slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">投稿時間帯</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">時間帯別エンゲージメント</p>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-gray-500">
          <i className="ri-time-line text-gray-400 text-xs"></i>
          <span className="font-medium">ベスト: {topHours[0]?.hour}</span>
        </div>
      </div>

      <div className="flex items-end space-x-1" style={{ height: '160px' }}>
        {data.map((item, index) => {
          const heightPercent = (item.engagement / maxEngagement) * 100;
          const isTop = topHours.some(t => t.hour === item.hour);
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="relative w-full flex justify-center">
                {isTop && (
                  <span className="absolute -top-4 text-[8px] font-medium text-gray-500">
                    {item.engagement}
                  </span>
                )}
                <div
                  className={`w-full max-w-[20px] rounded-t ${getBarColor(item.engagement)} transition-all`}
                  style={{ height: `${Math.max(heightPercent, 3)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center space-x-1 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <span className="text-[7px] text-gray-300">{item.hour.replace('時', '')}</span>
          </div>
        ))}
      </div>

      {/* ベスト投稿時間 */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          <i className="ri-lightbulb-line text-orange-500 text-xs"></i>
          <span className="text-[11px] font-medium text-gray-600">おすすめ投稿時間</span>
        </div>
        <p className="text-[11px] text-gray-400">
          {topHours.map(h => h.hour).join('・')} がエンゲージメントが最も高い時間帯です
        </p>
      </div>
    </div>
  );
}
