
interface RegionBarChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export default function RegionBarChart({ data }: RegionBarChartProps) {
  const maxPercentage = Math.max(...data.map(d => d.percentage));

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700">フォロワー地域</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">上位10地域の分布</p>
      </div>

      <div className="space-y-2">
        {data.map((region, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-[11px] text-gray-500 w-16 text-right flex-shrink-0 truncate">{region.name}</span>
            <div className="flex-1 h-5 bg-orange-50 rounded overflow-hidden relative">
              <div
                className="h-full rounded bg-orange-400 transition-all"
                style={{ width: `${(region.percentage / maxPercentage) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[11px] font-semibold text-gray-700 w-10 text-right">{region.percentage}%</span>
              <span className="text-[10px] text-gray-400 w-12 text-right">{formatNumber(region.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
