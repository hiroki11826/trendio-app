
interface GenderBarChartProps {
  data: {
    labels: string[];
    male: number[];
    female: number[];
    other: number[];
  };
}

export default function GenderBarChart({ data }: GenderBarChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">フォロワー男女比（期間別）</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">月別の男女比率の推移</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <span className="text-[10px] text-gray-400">男性</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-[10px] text-gray-400">女性</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-200"></div>
            <span className="text-[10px] text-gray-400">その他</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg className="w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          {[0, 20, 40, 60, 80].map((tick) => {
            const y = 200 - (tick / 80) * 170;
            return (
              <g key={tick}>
                <line x1="40" y1={y} x2="380" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="32" y={y + 3} textAnchor="end" className="text-[9px]" fill="#d1d5db">{tick}%</text>
              </g>
            );
          })}

          {/* Bars */}
          {data.labels.map((label, i) => {
            const groupX = 60 + i * 82;
            const maleH = (data.male[i] / 80) * 170;
            const femaleH = (data.female[i] / 80) * 170;
            const otherH = (data.other[i] / 80) * 170;

            return (
              <g key={i}>
                <rect x={groupX} y={200 - maleH} width="18" height={maleH} rx="2" fill="#ea580c" />
                <text x={groupX + 9} y={200 - maleH - 4} textAnchor="middle" className="text-[8px]" fill="#ea580c" fontWeight="500">{data.male[i]}%</text>

                <rect x={groupX + 22} y={200 - femaleH} width="18" height={femaleH} rx="2" fill="#fb923c" />
                <text x={groupX + 31} y={200 - femaleH - 4} textAnchor="middle" className="text-[8px]" fill="#fb923c" fontWeight="500">{data.female[i]}%</text>

                <rect x={groupX + 44} y={200 - otherH} width="18" height={otherH} rx="2" fill="#fed7aa" />

                <text x={groupX + 31} y={218} textAnchor="middle" className="text-[9px]" fill="#9ca3af">{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
