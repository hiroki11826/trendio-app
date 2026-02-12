
import { useState } from 'react';

interface BulkDMModalProps {
  comments: any[];
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkDMModal({ comments, onClose, onComplete }: BulkDMModalProps) {
  const [message, setMessage] = useState(
    `こんにちは！コメントありがとうございます。\n\n詳細情報をお送りします：\nhttps://example.com/info\n\nご質問があればお気軽にお問い合わせください！`
  );
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleBulkSend = () => {
    setIsSending(true);
    setProgress(0);
    setCurrentIndex(0);

    // Simulate sending DMs one by one
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        setProgress(Math.round((next / comments.length) * 100));
        
        if (next >= comments.length) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
        return next;
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">一括DM送信</h2>
            <p className="text-sm text-gray-500 mt-1">{comments.length}件のコメントに対してDMを送信</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selected Users Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              送信先ユーザー ({comments.length}名)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700">@{comment.username}</span>
                    <i className={`${comment.platform === 'instagram' ? 'ri-instagram-line text-pink-600' : 'ri-tiktok-line text-gray-900'} text-sm`}></i>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ内容（全員に同じ内容を送信）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={isSending}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="メッセージを入力してください..."
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length} 文字
            </p>
          </div>

          {/* Progress Section */}
          {isSending && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-700">送信中...</span>
                <span className="text-sm font-medium text-emerald-700">{currentIndex} / {comments.length}</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {currentIndex < comments.length && (
                <p className="text-xs text-emerald-600 mt-2">
                  現在送信中: @{comments[currentIndex]?.username}
                </p>
              )}
            </div>
          )}

          {/* Manual Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <i className="ri-information-line text-amber-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-amber-900">重要なお知らせ</p>
              <p className="text-xs text-amber-700 mt-1">
                これらのメッセージはオペレーターによって手動で送信されます。自動送信ではありません。
                各プラットフォームの利用規約に準拠した運用を行ってください。
              </p>
            </div>
          </div>

          {/* Rate Limit Warning */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start space-x-3">
            <i className="ri-time-line text-gray-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-gray-900">送信間隔について</p>
              <p className="text-xs text-gray-600 mt-1">
                プラットフォームの制限を考慮し、各メッセージは約1秒間隔で順次送信されます。
                大量送信時は時間がかかる場合があります。
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleBulkSend}
            disabled={isSending || !message.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap cursor-pointer"
          >
            {isSending ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>送信中... ({progress}%)</span>
              </>
            ) : (
              <>
                <i className="ri-send-plane-fill"></i>
                <span>{comments.length}件を一括送信</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
