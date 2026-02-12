
interface CommentRowProps {
  comment: any;
  isSelected: boolean;
  onSelect: () => void;
  onSendDM: () => void;
}

export default function CommentRow({ comment, isSelected, onSelect, onSendDM }: CommentRowProps) {
  const isNotResponded = comment.status === 'not_responded';

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            disabled={!isNotResponded}
            className={`w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 ${
              isNotResponded ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
          />
        </div>

        {/* Post Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          <img src={comment.postThumbnail} alt="Post" className="w-full h-full object-cover" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* User Info & Platform */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-gray-900">@{comment.username}</span>
            <i className={`${comment.platform === 'instagram' ? 'ri-instagram-line text-pink-600' : 'ri-tiktok-line text-gray-900'} text-sm`}></i>
            <span className="text-xs text-gray-400">{comment.time}</span>
            {comment.hasKeyword && (
              <span className="inline-flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                <i className="ri-star-fill mr-1 text-[10px]"></i>
                キーワード
              </span>
            )}
          </div>

          {/* Comment Text */}
          <p className="text-sm text-gray-700 mt-1.5 line-clamp-2">
            {comment.comment}
          </p>
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            comment.status === 'not_responded'
              ? 'bg-orange-50 text-orange-700'
              : 'bg-green-50 text-green-700'
          }`}>
            {comment.status === 'not_responded' ? '未対応' : '対応済み'}
          </span>
          <button
            onClick={onSendDM}
            disabled={comment.status === 'responded'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
              comment.status === 'not_responded'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="DMを送信"
          >
            <i className="ri-send-plane-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
