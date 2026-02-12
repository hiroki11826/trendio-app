
import { useState } from 'react';

interface ActionTrendChartProps {
  data: {
    labels: string[];
    likes: number[];
    comments: number[];
    saves: number[];
    siteClicks: number[];
  };
  summary: {
    likes: number;
    comments: number;
    saves: number;
    siteClicks: number;
  };
}

type MetricKey = 'likes' | 'comments' | 'saves' | 'siteClicks';

const metricConfig: Record<MetricKey, { label: string; color: string; icon: string }> = {
  likes: { label: 'いいね', color: '#ea580c', icon: 'ri-heart-line' },
  comments: { label: 'コメント', color: '#f97316', icon: 'ri-chat-3-line' },
  saves: { label: '保存', color: '#fb923c', icon: 'ri-bookmark-line' },
  siteClicks: { label: 'サイトクリック', color: '#fdba74', icon: 'ri-link' },
};

export default function ActionTrendChart({ data, summary }: ActionTrendChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['likes', 'comments', 'saves', 'siteClicks']);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const allValues = activeMetrics.flatMap(key => data[key]);
  const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.15 : 100;

  const getPoints = (values: number[]) =>
    values.map((val, i) => ({
      x: 60 + (i / (values.length - 1)) * 700,
      y: 250 - (val / maxVal) * 210,
    }));

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">アクション推移</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">過去8週間のエンゲージメント</p>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {(Object.keys(metricConfig) as MetricKey[]).map(key => {
          const cfg = metricConfig[key];
          const isActive = activeMetrics.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                isActive ? 'bg-orange-50' : 'bg-white opacity-40'
              }`}
            >
              <div
                className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 bg-orange-100"
              >
                <i className={`${cfg.icon} text-xs text-orange-600`}></i>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400">{cfg.label}</p>
                <p className="text-sm font-semibold text-gray-800">{formatNumber(summary[key])}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* チャート */}
      <div className="relative">
        <svg className="w-full" viewBox="0 0 800 290" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = 250 - (i / 4) * 210;
            const val = (maxVal / 4) * i;
            return (
              <g key={i}>
                <line x1="60" y1={y} x2="760" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="50" y={y + 4} textAnchor="end" className="text-[10px]" fill="#d1d5db">
                  {formatNumber(Math.round(val))}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          {activeMetrics.map(key => {
            const cfg = metricConfig[key];
            const points = getPoints(data[key]);
            return (
              <g key={key}>
                <path d={toPath(points)} fill="none" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" stroke={cfg.color} strokeWidth="1.5" />
                ))}
              </g>
            );
          })}

          {/* X labels */}
          {data.labels.map((label, i) => {
            const x = 60 + (i / (data.labels.length - 1)) * 700;
            return (
              <text key={i} x={x} y={275} textAnchor="middle" className="text-[10px]" fill="#d1d5db">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
