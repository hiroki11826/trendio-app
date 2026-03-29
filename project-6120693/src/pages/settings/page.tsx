
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../dashboard/components/Sidebar';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  connected: boolean;
  lastSync?: string;
  profileImage?: string;
  followers?: number;
  pageId?: string;
  igUserId?: string;
}

interface DataSummary {
  user: {
    email: string;
    name: string | null;
    createdAt: string;
  };
  dataCounts: {
    metaConnections: number;
    tiktokConnections: number;
    contentIdeas: number;
    contentScripts: number;
  };
}

type MetaDebugResponse = {
  metaConnection?: {
    id: number;
    accessToken: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    pageId?: string | null;
    igUserId?: string | null;
  };
  page?: {
    id?: string;
    name?: string;
    instagram_business_account?: {
      id?: string;
      username?: string;
      profile_picture_url?: string;
      followers_count?: number;
    };
  };
};

const META_LOGIN_URL = `${API_BASE_URL}/api/auth/meta/login`;
const META_DEBUG_URL = `${API_BASE_URL}/api/meta/debug`;
const META_DISCONNECT_URL = `${API_BASE_URL}/api/meta/connection`;
const TIKTOK_LOGIN_URL = `${API_BASE_URL}/api/auth/tiktok/login`;
const TIKTOK_CONNECTION_URL = `${API_BASE_URL}/api/tiktok/connection`;
const TIKTOK_DISCONNECT_URL = `${API_BASE_URL}/api/tiktok/connection`;
const POLL_INTERVAL_MS = 2000;

export default function Settings() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'instagram',
      username: '',
      connected: false,
    },
    {
      id: '2',
      platform: 'tiktok',
      username: '',
      connected: false,
    },
  ]);

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPlatform, setSuccessPlatform] = useState<string>('');

  const popupRef = useRef<Window | null>(null);
  const pollingRef = useRef<number | null>(null);
  const awaitingConnectionRef = useRef(false);
  const isMountedRef = useRef(true);
  const connectingPlatformRef = useRef<string | null>(connectingPlatform);
  const connectionWaitStartRef = useRef<number | null>(null);

  useEffect(() => {
    connectingPlatformRef.current = connectingPlatform;
  }, [connectingPlatform]);

  // Fetch data summary for deletion section - defined early to avoid reference error
  const fetchDataSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user/data-summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDataSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch data summary', err);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current !== null) {
      if (typeof window !== 'undefined') {
        window.clearInterval(pollingRef.current);
      }
      pollingRef.current = null;
    }
  }, []);

  const closePopup = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  const updateInstagramFromPayload = useCallback((payload: MetaDebugResponse | null) => {
    if (!isMountedRef.current) {
      return;
    }
    setAccounts(prev =>
      prev.map(account => {
        if (account.platform !== 'instagram') {
          return account;
        }
        if (!payload?.metaConnection) {
          return {
            ...account,
            connected: false,
            username: '',
            lastSync: undefined,
            profileImage: undefined,
            followers: undefined,
            pageId: undefined,
            igUserId: undefined,
          };
        }
        const { metaConnection, page } = payload;
        const instagramBusinessAccount = page?.instagram_business_account;
        return {
          ...account,
          connected: true,
          username:
            instagramBusinessAccount?.username ??
            page?.name ??
            account.username ??
            'Instagram',
          lastSync: metaConnection.updatedAt ?? metaConnection.createdAt,
          profileImage: instagramBusinessAccount?.profile_picture_url ?? account.profileImage,
          followers: instagramBusinessAccount?.followers_count ?? account.followers,
          pageId: metaConnection.pageId ?? page?.id ?? account.pageId,
          igUserId:
            metaConnection.igUserId ?? instagramBusinessAccount?.id ?? account.igUserId,
        };
      }),
    );
  }, []);

  const refreshConnection = useCallback(async () => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        return;
      }

      // Refresh Instagram connection
      const response = await fetch(META_DEBUG_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        if (response.status === 404) {
          updateInstagramFromPayload(null);
        } else {
          throw new Error(`Meta debug failed (${response.status})`);
        }
      } else {
        const payload = (await response.json()) as MetaDebugResponse;
        updateInstagramFromPayload(payload);
      }

      // Refresh TikTok connection
      const tiktokResponse = await fetch(TIKTOK_CONNECTION_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (tiktokResponse.ok) {
        const tiktokData = await tiktokResponse.json();
        setAccounts(prev =>
          prev.map(account => {
            if (account.platform === 'tiktok') {
              return {
                ...account,
                connected: true,
                username: tiktokData.user?.displayName ?? tiktokData.user?.username ?? 'TikTok',
                lastSync: tiktokData.connection?.updatedAt ?? tiktokData.connection?.createdAt,
                profileImage: tiktokData.user?.avatarUrl ?? account.profileImage,
                followers: tiktokData.user?.followerCount ?? account.followers,
              };
            }
            return account;
          }),
        );
      } else if (tiktokResponse.status === 404) {
        setAccounts(prev =>
          prev.map(account => {
            if (account.platform === 'tiktok') {
              return {
                ...account,
                connected: false,
                username: '',
                lastSync: undefined,
                profileImage: undefined,
                followers: undefined,
              };
            }
            return account;
          }),
        );
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh connections', error);
      updateInstagramFromPayload(null);
      return null;
    }
  }, [updateInstagramFromPayload]);

  const pollMetaConnection = useCallback(async () => {
    const payload = await refreshConnection();
    const connectionTimestamp = payload?.metaConnection?.updatedAt ?? payload?.metaConnection?.createdAt;
    const parsedTimestamp = connectionTimestamp ? Date.parse(connectionTimestamp) : NaN;
    const startedAt = connectionWaitStartRef.current;
    const hasNewConnection =
      !Number.isNaN(parsedTimestamp) && startedAt !== null && parsedTimestamp >= startedAt;

    if (payload && awaitingConnectionRef.current && connectingPlatformRef.current === 'instagram' && hasNewConnection) {
      connectionWaitStartRef.current = null;
      awaitingConnectionRef.current = false;
      stopPolling();
      setConnectingPlatform(null);
      setSuccessPlatform('Instagram');
      setShowSuccessModal(true);
      closePopup();
    }
  }, [refreshConnection, stopPolling, closePopup]);

  const startPolling = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (pollingRef.current !== null) {
      return;
    }
    void pollMetaConnection();
    pollingRef.current = window.setInterval(() => {
      if (popupRef.current?.closed) {
        stopPolling();
        awaitingConnectionRef.current = false;
        setConnectingPlatform(null);
        connectionWaitStartRef.current = null;
        return;
      }
      void pollMetaConnection();
    }, POLL_INTERVAL_MS);
  }, [pollMetaConnection, stopPolling]);

  useEffect(() => {
    void refreshConnection();

    // Check for TikTok connection success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tiktok_connected') === '1') {
      setSuccessPlatform('TikTok');
      setShowSuccessModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }

    return () => {
      isMountedRef.current = false;
      awaitingConnectionRef.current = false;
      stopPolling();
      closePopup();
      connectionWaitStartRef.current = null;
    };
  }, [refreshConnection, stopPolling, closePopup]);

  // Fetch data summary separately to avoid circular dependency
  useEffect(() => {
    void fetchDataSummary();
  }, [fetchDataSummary]);

  const handleMetaConnectionMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        status?: 'success' | 'error';
        payload?: MetaDebugResponse;
      };
      if (data?.type !== 'META_CONNECTION') {
        return;
      }
      if (connectingPlatformRef.current !== 'instagram') {
        return;
      }
      awaitingConnectionRef.current = false;
      stopPolling();
      setConnectingPlatform(null);
      closePopup();
      if (data.status === 'success') {
        connectionWaitStartRef.current = null;
        setSuccessPlatform('Instagram');
        setShowSuccessModal(true);
        void refreshConnection();
      } else {
        console.warn('Meta reported an error during connection', data);
      }
    },
    [closePopup, refreshConnection, stopPolling],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('message', handleMetaConnectionMessage);
    return () => {
      window.removeEventListener('message', handleMetaConnectionMessage);
    };
  }, [handleMetaConnectionMessage]);

  const handleConnect = useCallback(async (platform: 'instagram' | 'tiktok') => {
    if (platform === 'instagram') {
      if (typeof window === 'undefined') {
        return;
      }

      // Get authentication token
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        console.error('No authentication token found');
        alert('ログインが必要です。ログインページにリダイレクトします。');
        navigate('/login');
        return;
      }

      setConnectingPlatform(platform);
      awaitingConnectionRef.current = true;
      const stateParam = `instagram-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const loginUrl = new URL(META_LOGIN_URL);
      loginUrl.searchParams.set('state', stateParam);
      loginUrl.searchParams.set('token', token);
      popupRef.current = window.open(
        loginUrl.toString(),
        'meta-login',
        'width=480,height=760,resizable,scrollbars=yes,status=1',
      );

      if (!popupRef.current) {
        awaitingConnectionRef.current = false;
        setConnectingPlatform(null);
        connectionWaitStartRef.current = null;
        return;
      }

      connectionWaitStartRef.current = Date.now();

      startPolling();
      return;
    }

    if (platform === 'tiktok') {
      if (typeof window === 'undefined') {
        return;
      }

      setConnectingPlatform(platform);
      
      // Get authentication token
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        console.error('No authentication token found');
        alert('ログインが必要です。ログインページにリダイレクトします。');
        navigate('/login');
        setConnectingPlatform(null);
        return;
      }

      // TikTok OAuth flow - redirect with Authorization header
      // We need to use a temporary redirect approach since we can't set headers on window.location
      const loginUrl = `${TIKTOK_LOGIN_URL}?token=${encodeURIComponent(token)}`;
      window.location.href = loginUrl;
      return;
    }
  }, [startPolling]);

  const [pendingDisconnectPlatform, setPendingDisconnectPlatform] = useState<
    'instagram' | 'tiktok' | null
  >(null);

  // Account deletion state
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Company name state
  const [companyName, setCompanyName] = useState('');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);

  // Fetch user profile including company name
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('nekocafe_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyName(data.user?.companyName || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveCompanyName = async () => {
    setIsSavingCompany(true);
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });

      if (response.ok) {
        setIsEditingCompany(false);
        setCompanySaveSuccess(true);
        setTimeout(() => setCompanySaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save company name', err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleDisconnect = useCallback(
    async (platform: 'instagram' | 'tiktok') => {
      const token = localStorage.getItem('nekocafe_token');
      
      if (platform === 'instagram') {
        try {
          const response = await fetch(META_DISCONNECT_URL, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok && response.status !== 404) {
            throw new Error(`Meta disconnect failed (${response.status})`);
          }
        } catch (error) {
          console.error('Failed to clear Meta connection', error);
        } finally {
          void refreshConnection();
        }
      }

      if (platform === 'tiktok') {
        try {
          const response = await fetch(TIKTOK_DISCONNECT_URL, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok && response.status !== 404) {
            throw new Error(`TikTok disconnect failed (${response.status})`);
          }
        } catch (error) {
          console.error('Failed to clear TikTok connection', error);
        } finally {
          void refreshConnection();
        }
      }

      setAccounts(prev =>
        prev.map(account => {
          if (account.platform === platform) {
            return {
              ...account,
              connected: false,
              username: '',
              lastSync: undefined,
              profileImage: undefined,
              followers: undefined,
            };
          }
          return account;
        }),
      );
    },
    [refreshConnection],
  );

  const confirmDisconnect = (platform: 'instagram' | 'tiktok') => {
    setPendingDisconnectPlatform(platform);
  };

  const cancelDisconnect = () => {
    setPendingDisconnectPlatform(null);
  };

  const executeDisconnect = () => {
    if (pendingDisconnectPlatform) {
      void handleDisconnect(pendingDisconnectPlatform);
      setPendingDisconnectPlatform(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== '削除する') return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        setDeleteError('ログインが必要です');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アカウントの削除に失敗しました');
      }

      localStorage.removeItem('nekocafe_token');
      localStorage.removeItem('nekocafe_user');
      alert('アカウントとすべてのデータが削除されました。');
      navigate('/login');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'アカウントの削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const instagramAccount = accounts.find(a => a.platform === 'instagram');
  const tiktokAccount = accounts.find(a => a.platform === 'tiktok');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">アカウント管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              SNSアカウントの連携とアカウント設定を管理します
            </p>
          </div>

          {/* 会社名設定セクション */}
          <div className="mb-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">会社情報</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名・組織名
                  </label>
                  {isEditingCompany ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="例: 株式会社サンプル"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={handleSaveCompanyName}
                        disabled={isSavingCompany}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingCompany ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={() => setIsEditingCompany(false)}
                        className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">
                        {companyName || <span className="text-gray-400">未設定</span>}
                      </p>
                      <button
                        onClick={() => setIsEditingCompany(true)}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        編集
                      </button>
                    </div>
                  )}
                  {companySaveSuccess && (
                    <p className="mt-2 text-sm text-emerald-600">
                      <i className="ri-check-line mr-1"></i>
                      保存しました
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                サイドバーに表示される会社名・組織名を設定できます
              </p>
            </div>
          </div>

          {/* SNS連携セクション */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SNSアカウント連携</h2>
          </div>

          {/* 連携カードエリア */}
          <div className="space-y-4 max-w-3xl">
            {/* Instagram カード */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {instagramAccount?.connected && instagramAccount.profileImage ? (
                    <img 
                      src={instagramAccount.profileImage} 
                      alt="Instagram Profile" 
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                      <i className="ri-instagram-line text-white text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
                      {instagramAccount?.connected && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          接続済み
                        </span>
                      )}
                    </div>
                    {instagramAccount?.connected ? (
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-700">{instagramAccount.username}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            フォロワー: {instagramAccount.followers?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            最終同期: {instagramAccount.lastSync}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">
                        Instagramビジネスアカウントを接続してください
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {instagramAccount?.connected ? (
                    <>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                        <i className="ri-refresh-line mr-1"></i>
                        同期
                      </button>
                      <button 
                        onClick={() => confirmDisconnect('instagram')}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        接続解除
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleConnect('instagram')}
                      disabled={connectingPlatform === 'instagram'}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap flex items-center"
                    >
                      {connectingPlatform === 'instagram' ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          接続中...
                        </>
                      ) : (
                        <>
                          <i className="ri-link mr-2"></i>
                          接続する
                        </>
                      )}
                    </button>
                  )}
                </div>
                {instagramAccount?.connected && instagramAccount.username && (
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    接続アカウント: {instagramAccount.username}
                  </p>
                )}
              </div>
            </div>

            {/* TikTok カード */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {tiktokAccount?.connected && tiktokAccount.profileImage ? (
                    <img 
                      src={tiktokAccount.profileImage} 
                      alt="TikTok Profile" 
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-pink-500/20"></div>
                      <i className="ri-tiktok-line text-white text-2xl relative z-10"></i>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">TikTok</h3>
                      {tiktokAccount?.connected && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          接続済み
                        </span>
                      )}
                    </div>
                    {tiktokAccount?.connected ? (
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-700">{tiktokAccount.username}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            フォロワー: {tiktokAccount.followers?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            最終同期: {tiktokAccount.lastSync}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">
                        TikTokビジネスアカウントを接続してください
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-3">
                    {tiktokAccount?.connected ? (
                      <>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                          <i className="ri-refresh-line mr-1"></i>
                          同期
                        </button>
                        <button 
                          onClick={() => confirmDisconnect('tiktok')}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                        >
                          接続解除
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleConnect('tiktok')}
                        disabled={connectingPlatform === 'tiktok'}
                        className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center"
                      >
                        {connectingPlatform === 'tiktok' ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            接続中...
                          </>
                        ) : (
                          <>
                            <i className="ri-link mr-2"></i>
                            接続する
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {tiktokAccount?.connected && tiktokAccount.username && (
                    <p className="text-xs text-gray-500 text-right">
                      接続アカウント: {tiktokAccount.username}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 接続ガイド */}
          <div className="mt-12 max-w-3xl">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-line text-emerald-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">接続のヒント</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start">
                      <i className="ri-check-line text-emerald-500 mr-2 mt-0.5"></i>
                      <span>InstagramはFacebookビジネスアカウントと連携している必要があります</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-emerald-500 mr-2 mt-0.5"></i>
                      <span>TikTokはビジネスアカウントまたはクリエイターアカウントが必要です</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-emerald-500 mr-2 mt-0.5"></i>
                      <span>接続後、データの同期には最大24時間かかる場合があります</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 権限説明 */}
          <div className="mt-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">アクセス権限について</h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-eye-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">投稿の閲覧</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">読み取り専用</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-bar-chart-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">インサイト・分析データ</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">読み取り専用</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-user-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">プロフィール情報</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">読み取り専用</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-chat-3-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">コメント管理</span>
                </div>
                <span className="text-xs text-amber-600 font-medium">読み書き</span>
              </div>
            </div>
          </div>

          {/* アカウント削除セクション */}
          <div className="mt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">アカウント削除</h2>
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-delete-bin-line text-red-600 text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">アカウントを完全に削除</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    アカウントを削除すると、すべてのデータ（SNS連携情報、コンテンツアイデア、スクリプトなど）が完全に削除されます。この操作は取り消せません。
                  </p>
                  {dataSummary && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-2">削除されるデータ:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Instagram連携: {dataSummary.dataCounts.metaConnections}件</li>
                        <li>• TikTok連携: {dataSummary.dataCounts.tiktokConnections}件</li>
                        <li>• コンテンツアイデア: {dataSummary.dataCounts.contentIdeas}件</li>
                        <li>• コンテンツスクリプト: {dataSummary.dataCounts.contentScripts}件</li>
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    アカウントを削除する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-emerald-600 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">接続完了</h3>
            <p className="text-sm text-gray-500 mb-6">
              {successPlatform}アカウントが正常に接続されました。データの同期を開始します。
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all whitespace-nowrap"
            >
              ダッシュボードへ戻る
            </button>
          </div>
        </div>
      )}
      {pendingDisconnectPlatform && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {pendingDisconnectPlatform === 'instagram'
                ? 'Instagramアカウントを解除しますか？'
                : 'TikTokアカウントを解除しますか？'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {pendingDisconnectPlatform === 'instagram'
                ? 'この操作を実行すると、Instagramの連携情報が完全に解除されます。'
                : 'この操作を実行すると、TikTokの連携情報が完全に解除されます。'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDisconnect}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={executeDisconnect}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
              >
                解除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アカウント削除確認モーダル */}
      {showDeleteModal && (
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

            {deleteError && (
              <p className="text-sm text-red-600 mb-4">{deleteError}</p>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                  setDeleteError(null);
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
