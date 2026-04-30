import { useTranslation } from 'react-i18next';

interface SummaryMetricsProps {
  data: {
    followers: number;
    profileViews: number;
    totalImpressions: number;
    totalReach: number;
  };
}

export default function SummaryMetrics({ data }: SummaryMetricsProps) {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const metrics = [
    { label: t('instagram.followers'), value: formatNumber(data.followers), icon: 'ri-group-line' },
    { label: t('instagram.profileViews'), value: formatNumber(data.profileViews), icon: 'ri-eye-line' },
    { label: t('instagram.totalImpressions'), value: formatNumber(data.totalImpressions), icon: 'ri-bar-chart-box-line' },
    { label: t('instagram.totalReach'), value: formatNumber(data.totalReach), icon: 'ri-broadcast-line' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50">
              <i className={`${metric.icon} text-orange-500 text-base`}></i>
            </div>
          </div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{metric.label}</p>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
