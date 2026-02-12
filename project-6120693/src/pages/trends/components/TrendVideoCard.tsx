interface TrendVideoCardProps {
  video: any;
}

export default function TrendVideoCard({ video }: TrendVideoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative aspect-[9/16] overflow-hidden bg-gray-100">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 whitespace-nowrap">
            <i className="ri-fire-fill text-orange-500 mr-1"></i>
            {video.trendScore}
          </span>
        </div>

        <div className="absolute top-3 left-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
            video.platform === 'instagram' 
              ? 'bg-gradient-to-br from-pink-500 to-purple-600' 
              : 'bg-gray-900'
          }`}>
            <i className={`${video.platform === 'instagram' ? 'ri-instagram-line' : 'ri-tiktok-line'} text-white`}></i>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm mb-2">{video.title}</h3>
          <div className="flex items-center space-x-3 text-white/90 text-xs mb-2">
            <span className="flex items-center whitespace-nowrap">
              <i className="ri-eye-line mr-1"></i>
              {video.views}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg cursor-pointer">
            <i className="ri-play-fill text-2xl text-gray-900"></i>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {video.hashtags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
