import { useState } from 'react';

interface DMModalProps {
  comment: any;
  onClose: () => void;
}

export default function DMModal({ comment, onClose }: DMModalProps) {
  const [message, setMessage] = useState(
    `こんにちは！コメントありがとうございます。\n\n詳細情報をお送りします：\nhttps://example.com/info\n\nご質問があればお気軽にお問い合わせください！`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">DMを送信</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Original Comment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">元のコメント</p>
            <div className="flex items-start space-x-3">
              <img 
                src={comment.avatar} 
                alt={comment.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{comment.username}</p>
                <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
              </div>
            </div>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ内容
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm resize-none"
              placeholder="メッセージを入力してください..."
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length} 文字
            </p>
          </div>

          {/* Message Preview */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">プレビュー</p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
            </div>
          </div>

          {/* Manual Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <i className="ri-information-line text-amber-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-amber-900">重要なお知らせ</p>
              <p className="text-xs text-amber-700 mt-1">
                このメッセージはオペレーターによって手動で送信されます。自動送信ではありません。
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            キャンセル
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
          >
            {isSending ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <i className="ri-send-plane-fill"></i>
                <span>メッセージを送信</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
