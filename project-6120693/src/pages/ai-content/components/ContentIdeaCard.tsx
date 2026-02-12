interface ContentIdeaCardProps {
  idea: any;
  onViewScript: () => void;
}

export default function ContentIdeaCard({ idea, onViewScript }: ContentIdeaCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
            idea.platform === 'instagram' 
              ? 'bg-gradient-to-br from-pink-500 to-purple-600' 
              : 'bg-gray-900'
          }`}>
            <i className={`${idea.platform === 'instagram' ? 'ri-instagram-line' : 'ri-tiktok-line'} text-lg text-white`}></i>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{idea.title}</h3>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{idea.description}</p>

      <div className="flex items-center space-x-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          idea.estimatedReach === 'Very High' 
            ? 'bg-green-50 text-green-700'
            : idea.estimatedReach === 'High'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          <i className="ri-line-chart-line mr-1"></i>
          {idea.estimatedReach} Reach
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          idea.difficulty === 'Easy'
            ? 'bg-green-50 text-green-700'
            : 'bg-orange-50 text-orange-700'
        }`}>
          <i className="ri-speed-line mr-1"></i>
          {idea.difficulty}
        </span>
      </div>

      <button
        onClick={onViewScript}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md cursor-pointer whitespace-nowrap"
      >
        <i className="ri-file-text-line mr-2"></i>
        Generate Script
      </button>
    </div>
  );
}
