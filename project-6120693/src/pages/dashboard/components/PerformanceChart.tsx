interface PerformanceChartProps {
  title: string;
  type: 'line' | 'bar';
}

export default function PerformanceChart({ title, type }: PerformanceChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap">
          View Details
        </button>
      </div>
      
      <div className="relative h-64">
        {type === 'line' ? (
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 150 L 50 120 L 100 130 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 60"
              fill="url(#lineGradient)"
              stroke="none"
            />
            <path
              d="M 0 150 L 50 120 L 100 130 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 60"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
            />
            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x, i) => (
              <circle key={i} cx={x} cy={[150, 120, 130, 90, 100, 70, 80, 50, 60][i]} r="4" fill="#3B82F6" />
            ))}
          </svg>
        ) : (
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            {[
              { x: 40, h1: 120, h2: 90 },
              { x: 120, h1: 140, h2: 110 },
              { x: 200, h1: 100, h2: 130 },
              { x: 280, h1: 160, h2: 120 },
            ].map((bar, i) => (
              <g key={i}>
                <rect x={bar.x - 15} y={200 - bar.h1} width="15" height={bar.h1} fill="url(#barGradient1)" rx="4" />
                <rect x={bar.x + 5} y={200 - bar.h2} width="15" height={bar.h2} fill="url(#barGradient2)" rx="4" />
              </g>
            ))}
          </svg>
        )}
      </div>

      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-xs text-gray-600">Instagram</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-pink-600"></div>
          <span className="text-xs text-gray-600">TikTok</span>
        </div>
      </div>
    </div>
  );
}
