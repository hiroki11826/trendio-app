
interface FollowerTrendChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export default function FollowerTrendChart({ data }: FollowerTrendChartProps) {
  const min = Math.min(...data.values) * 0.95;
  const max = Math.max(...data.values) * 1.02;
  const range = max - min;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const growth = data.values[data.values.length - 1] - data.values[0];
  const growthRate = ((growth / data.values[0]) * 100).toFixed(1);

  const points = data.values.map((val, i) => ({
    x: 60 + (i / (data.values.length - 1)) * 700,
    y: 260 - ((val - min) / range) * 220
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} 260 L ${points[0].x} 260 Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => min + (range / 4) * i);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">フォロワー推移</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">過去12週間</p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-500">
          <i className="ri-arrow-up-line text-orange-500 text-xs"></i>
          <span className="font-medium">+{formatNumber(growth)} ({growthRate}%)</span>
        </div>
      </div>

      <div className="relative">
        <svg className="w-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="followerAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = 260 - ((tick - min) / range) * 220;
            return (
              <g key={i}>
                <line x1="60" y1={y} x2="760" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="50" y={y + 4} textAnchor="end" className="text-[10px]" fill="#d1d5db">
                  {formatNumber(Math.round(tick))}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="url(#followerAreaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#f97316" strokeWidth="2" />
            </g>
          ))}

          {/* X labels */}
          {data.labels.map((label, i) => {
            const x = 60 + (i / (data.labels.length - 1)) * 700;
            return (
              <text key={i} x={x} y={285} textAnchor="middle" className="text-[9px]" fill="#d1d5db">
                {i % 2 === 0 ? label : ''}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
