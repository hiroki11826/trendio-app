
interface GenderPieChartProps {
  data: {
    male: number;
    female: number;
    other: number;
  };
}

export default function GenderPieChart({ data }: GenderPieChartProps) {
  const total = data.male + data.female + data.other;
  const segments = [
    { label: '女性', value: data.female, color: '#fb923c', percent: ((data.female / total) * 100).toFixed(1) },
    { label: '男性', value: data.male, color: '#ea580c', percent: ((data.male / total) * 100).toFixed(1) },
    { label: 'その他', value: data.other, color: '#fed7aa', percent: ((data.other / total) * 100).toFixed(1) },
  ];

  const radius = 80;
  const cx = 120;
  const cy = 110;
  let cumulativeAngle = -90;

  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
    const labelX = cx + (radius * 0.65) * Math.cos(midRad);
    const labelY = cy + (radius * 0.65) * Math.sin(midRad);

    return {
      ...seg,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      labelX,
      labelY,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700">フォロワー男女比</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">現在の構成比率</p>
      </div>

      <div className="flex items-center justify-center">
        <svg width="240" height="220" viewBox="0 0 240 220">
          {arcs.map((arc, i) => (
            <g key={i}>
              <path d={arc.path} fill={arc.color} stroke="white" strokeWidth="2" />
              <text
                x={arc.labelX}
                y={arc.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
                {arc.percent}%
              </text>
            </g>
          ))}
          <circle cx={cx} cy={cy} r="35" fill="white" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#111827" fontSize="14" fontWeight="700">
            {(total).toLocaleString()}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#d1d5db" fontSize="8">
            合計
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></div>
            <span className="text-[11px] text-gray-500">{seg.label}</span>
            <span className="text-[11px] font-semibold text-gray-700">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
