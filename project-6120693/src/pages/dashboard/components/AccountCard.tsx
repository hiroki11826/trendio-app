interface AccountCardProps {
  platform: 'instagram' | 'tiktok';
  username: string;
  followers: string;
  status: 'active' | 'inactive';
}

export default function AccountCard({ platform, username, followers, status }: AccountCardProps) {
  const platformConfig = {
    instagram: {
      icon: 'ri-instagram-line',
      color: 'from-pink-500 to-purple-600',
      bgColor: 'from-pink-50 to-purple-50',
    },
    tiktok: {
      icon: 'ri-tiktok-line',
      color: 'from-gray-800 to-gray-900',
      bgColor: 'from-gray-50 to-gray-100',
    },
  };

  const config = platformConfig[platform];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${config.bgColor}`}>
          <i className={`${config.icon} text-2xl bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}></i>
        </div>
        <span className={`flex items-center text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
          status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 capitalize">{platform}</h3>
      <p className="text-sm text-gray-600 mb-3">{username}</p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Followers</p>
          <p className="text-lg font-bold text-gray-900">{followers}</p>
        </div>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          Manage
        </button>
      </div>
    </div>
  );
}
