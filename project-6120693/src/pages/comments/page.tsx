import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import CommentRow from './components/CommentRow';
import DMModal from './components/DMModal';
import BulkDMModal from './components/BulkDMModal';
import { commentsData } from '../../mocks/comments';

export default function Comments() {
  const [selectedComment, setSelectedComment] = useState<typeof commentsData[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_responded' | 'responded'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const filteredComments = commentsData.filter(comment => {
    if (statusFilter !== 'all' && comment.status !== statusFilter) return false;
    if (platformFilter !== 'all' && comment.platform !== platformFilter) return false;
    return true;
  });

  const unrespondedComments = filteredComments.filter(c => c.status === 'not_responded');
  const selectedUnrespondedComments = filteredComments.filter(
    c => selectedIds.includes(c.id) && c.status === 'not_responded'
  );

  const handleSelectAll = () => {
    if (selectedIds.length === unrespondedComments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unrespondedComments.map(c => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkSendComplete = () => {
    setShowBulkModal(false);
    setSelectedIds([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">コメント管理</h1>
              <p className="text-gray-500 mt-2">InstagramとTikTokのコメントを監視・管理</p>
            </div>
            
            {/* Bulk Action Button */}
            {selectedUnrespondedComments.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-send-plane-fill"></i>
                <span>一括送信 ({selectedUnrespondedComments.length}件)</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => setStatusFilter('not_responded')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === 'not_responded'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    未対応
                  </button>
                  <button
                    onClick={() => setStatusFilter('responded')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === 'responded'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    対応済み
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">プラットフォーム</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      platformFilter === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => setPlatformFilter('instagram')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      platformFilter === 'instagram'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlatformFilter('tiktok')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      platformFilter === 'tiktok'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    TikTok
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={unrespondedComments.length > 0 && selectedIds.length === unrespondedComments.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="ml-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  すべて選択
                </span>
              </label>
              <span className="ml-auto text-sm text-gray-500">
                {filteredComments.length}件のコメント
              </span>
            </div>

            {/* Comment List */}
            <div className="divide-y divide-gray-100">
              {filteredComments.map((comment) => (
                <CommentRow 
                  key={comment.id} 
                  comment={comment}
                  isSelected={selectedIds.includes(comment.id)}
                  onSelect={() => handleSelectOne(comment.id)}
                  onSendDM={() => setSelectedComment(comment)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedComment && (
        <DMModal 
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}

      {showBulkModal && (
        <BulkDMModal
          comments={selectedUnrespondedComments}
          onClose={() => setShowBulkModal(false)}
          onComplete={handleBulkSendComplete}
        />
      )}
    </div>
  );
}
