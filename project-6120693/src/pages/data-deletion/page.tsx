import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

interface DataSummary {
  user: {
    email: string;
    name: string | null;
    createdAt: string;
  };
  dataCounts: {
    tiktokConnections: number;
    contentIdeas: number;
    contentScripts: number;
  };
}

export default function DataDeletionPage() {
  const navigate = useNavigate();
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchDataSummary();
  }, []);

  const fetchDataSummary = async () => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/data-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('セッションが切れました。再度ログインしてください。');
        } else {
          setError('データの取得に失敗しました');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setDataSummary(data);
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== '削除する') {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        setError('ログインが必要です');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アカウントの削除に失敗しました');
      }

      // Clear local storage and redirect
      localStorage.removeItem('nekocafe_token');
      localStorage.removeItem('nekocafe_user');
      
      // Show success and redirect
      alert('アカウントとすべてのデータが削除されました。');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウントの削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-gray-400"></i>
          <p className="mt-4 text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !dataSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="ri-error-warning-line text-3xl text-red-500"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラー</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            設定に戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">ユーザーデータの削除</h1>
          <p className="text-gray-500 mt-2">
            アカウントと関連するすべてのデータを完全に削除できます。
          </p>
        </div>

        {/* Data Summary */}
        {dataSummary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">保存されているデータ</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i className="ri-user-line text-gray-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">アカウント情報</p>
                    <p className="text-sm text-gray-500">{dataSummary.user.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  登録日: {formatDate(dataSummary.user.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i className="ri-tiktok-line text-gray-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">TikTok連携</p>
                    <p className="text-sm text-gray-500">アクセストークン、接続情報</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {dataSummary.dataCounts.tiktokConnections}件
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i className="ri-lightbulb-line text-gray-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">コンテンツアイデア</p>
                    <p className="text-sm text-gray-500">AI生成されたアイデア</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {dataSummary.dataCounts.contentIdeas}件
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i className="ri-file-text-line text-gray-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">コンテンツスクリプト</p>
                    <p className="text-sm text-gray-500">AI生成された台本</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {dataSummary.dataCounts.contentScripts}件
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <i className="ri-alert-line text-2xl text-red-500 mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-red-900 mb-2">注意事項</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• この操作は取り消すことができません</li>
                <li>• すべてのデータが完全に削除されます</li>
                <li>• SNS連携情報も削除されます</li>
                <li>• 削除後は同じメールアドレスで再登録できます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">アカウントを削除</h3>
          <p className="text-sm text-gray-500 mb-4">
            アカウントを削除すると、上記のすべてのデータが完全に削除されます。
          </p>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            アカウントを削除する
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            データ削除に関するお問い合わせは{' '}
            <a href="mailto:support@trendio.jp" className="text-blue-600 hover:underline">
              support@trendio.jp
            </a>{' '}
            までご連絡ください。
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <i className="ri-delete-bin-line text-3xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">本当に削除しますか？</h3>
              <p className="text-sm text-gray-500">
                この操作は取り消せません。確認のため「削除する」と入力してください。
              </p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="削除する"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== '削除する' || isDeleting}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  confirmText === '削除する' && !isDeleting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    削除中...
                  </span>
                ) : (
                  '削除を実行'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
