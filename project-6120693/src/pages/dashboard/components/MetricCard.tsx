interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

export default function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${
          trend === 'up' ? 'from-blue-50 to-purple-50' : 'from-gray-50 to-gray-100'
        }`}>
          <i className={`${icon} text-xl ${trend === 'up' ? 'text-blue-600' : 'text-gray-600'}`}></i>
        </div>
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <i className={`${trend === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {change}
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
