
interface SummaryKPIProps {
  totalImpressions: number;
  engagementRate: number;
  followerGrowth: number;
  impressionChange: number;
  engagementChange: number;
}

export default function SummaryKPI({ 
  totalImpressions, 
  engagementRate, 
  followerGrowth,
  impressionChange,
  engagementChange
}: SummaryKPIProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'emerald';
    if (value >= threshold * 0.7) return 'amber';
    return 'red';
  };

  const getOverallStatus = () => {
    const score = (impressionChange > 10 ? 1 : 0) + (engagementRate > 4 ? 1 : 0) + (followerGrowth > 5 ? 1 : 0);
    if (score >= 2) return { status: 'Good', color: 'emerald', icon: 'ri-thumb-up-fill', message: 'Performance is on track' };
    if (score === 1) return { status: 'Moderate', color: 'amber', icon: 'ri-error-warning-fill', message: 'Some metrics need attention' };
    return { status: 'Needs Attention', color: 'red', icon: 'ri-alert-fill', message: 'Performance is declining' };
  };

  const overall = getOverallStatus();
  const impressionStatus = getStatusColor(impressionChange, 10);
  const engagementStatus = getStatusColor(engagementRate, 4);
  const growthStatus = getStatusColor(followerGrowth, 5);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Summary</h2>
          <p className="text-sm text-gray-500">At a glance status</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-${overall.color}-50`}>
          <i className={`${overall.icon} text-${overall.color}-600`}></i>
          <span className={`text-sm font-semibold text-${overall.color}-700`}>{overall.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Impressions */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 border-${impressionStatus}-100 p-6 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${impressionStatus}-50 rounded-full -mr-8 -mt-8 opacity-50`}></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Impressions</span>
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full bg-${impressionStatus}-50`}>
                <i className={`ri-arrow-${impressionChange >= 0 ? 'up' : 'down'}-line text-${impressionStatus}-600 text-sm`}></i>
                <span className={`text-xs font-bold text-${impressionStatus}-700`}>{Math.abs(impressionChange)}%</span>
              </div>
            </div>
            <p className="text-5xl font-black text-gray-900 mb-2">{formatNumber(totalImpressions)}</p>
            <p className="text-sm text-gray-500">vs previous period</p>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 border-${engagementStatus}-100 p-6 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${engagementStatus}-50 rounded-full -mr-8 -mt-8 opacity-50`}></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Engagement Rate</span>
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full bg-${engagementStatus}-50`}>
                <i className={`ri-arrow-${engagementChange >= 0 ? 'up' : 'down'}-line text-${engagementStatus}-600 text-sm`}></i>
                <span className={`text-xs font-bold text-${engagementStatus}-700`}>{Math.abs(engagementChange)}%</span>
              </div>
            </div>
            <p className="text-5xl font-black text-gray-900 mb-2">{engagementRate}%</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${engagementStatus}-500 rounded-full transition-all`}
                  style={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">Target: 5%</span>
            </div>
          </div>
        </div>

        {/* Follower Growth */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 border-${growthStatus}-100 p-6 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${growthStatus}-50 rounded-full -mr-8 -mt-8 opacity-50`}></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Follower Growth</span>
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full bg-${growthStatus}-50`}>
                <i className={`ri-arrow-${followerGrowth >= 0 ? 'up' : 'down'}-line text-${growthStatus}-600 text-sm`}></i>
                <span className={`text-xs font-bold text-${growthStatus}-700`}>This month</span>
              </div>
            </div>
            <p className="text-5xl font-black text-gray-900 mb-2">+{followerGrowth}%</p>
            <p className="text-sm text-gray-500">+{Math.round(124500 * followerGrowth / 100).toLocaleString()} new followers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
