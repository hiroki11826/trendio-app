interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
}

export default function KPICard({ title, value, change, icon }: KPICardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <i className={`${icon} text-xl text-emerald-600`}></i>
        </div>
        <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {Math.abs(change)}%
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
