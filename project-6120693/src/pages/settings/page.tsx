
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  connected: boolean;
  lastSync?: string;
  profileImage?: string;
  followers?: number;
}

export default function Settings() {
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

  const handleConnect = (platform: 'instagram' | 'tiktok') => {
    setConnectingPlatform(platform);
    
    // 接続シミュレーション
    setTimeout(() => {
      setAccounts(prev => prev.map(account => {
        if (account.platform === platform) {
          return {
            ...account,
            connected: true,
            username: platform === 'instagram' ? '@your_brand_official' : '@your_brand_tiktok',
            lastSync: '今',
            profileImage: platform === 'instagram' 
              ? 'https://readdy.ai/api/search-image?query=professional%20brand%20logo%20icon%20minimalist%20design%20on%20gradient%20pink%20purple%20background%20clean%20modern%20aesthetic&width=100&height=100&seq=ig1&orientation=squarish'
              : 'https://readdy.ai/api/search-image?query=professional%20brand%20logo%20icon%20minimalist%20design%20on%20black%20background%20with%20cyan%20accent%20clean%20modern%20aesthetic&width=100&height=100&seq=tt1&orientation=squarish',
            followers: platform === 'instagram' ? 12500 : 8300,
          };
        }
        return account;
      }));
      setConnectingPlatform(null);
      setSuccessPlatform(platform === 'instagram' ? 'Instagram' : 'TikTok');
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleDisconnect = (platform: 'instagram' | 'tiktok') => {
    setAccounts(prev => prev.map(account => {
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
    }));
  };

  const instagramAccount = accounts.find(a => a.platform === 'instagram');
  const tiktokAccount = accounts.find(a => a.platform === 'tiktok');

  const features = [
    {
      number: '01',
      title: '自動投稿',
      description: 'コンテンツを自動的に複数のSNSに同時投稿できます',
      icon: 'ri-send-plane-line',
    },
    {
      number: '02',
      title: '統合分析',
      description: '全プラットフォームのデータを一元管理・分析',
      icon: 'ri-bar-chart-box-line',
    },
    {
      number: '03',
      title: 'スケジュール管理',
      description: '最適な時間に投稿を自動スケジューリング',
      icon: 'ri-calendar-schedule-line',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">SNSアカウント連携</h1>
            <p className="text-sm text-gray-500 mt-1">
              InstagramとTikTokを接続して、コンテンツを自動共有しましょう
            </p>
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
                        onClick={() => handleDisconnect('instagram')}
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
                <div className="flex items-center space-x-3">
                  {tiktokAccount?.connected ? (
                    <>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                        <i className="ri-refresh-line mr-1"></i>
                        同期
                      </button>
                      <button 
                        onClick={() => handleDisconnect('tiktok')}
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
              </div>
            </div>
          </div>

          {/* 機能説明エリア */}
          <div className="mt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">連携でできること</h2>
            <div className="grid grid-cols-3 gap-6">
              {features.map((feature) => (
                <div key={feature.number} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                    <i className={`${feature.icon} text-white text-lg`}></i>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
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
        </div>
      </div>

      {/* 成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-emerald-600 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">接続完了！</h3>
            <p className="text-sm text-gray-500 mb-6">
              {successPlatform}アカウントが正常に接続されました。データの同期を開始します。
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all whitespace-nowrap"
            >
              ダッシュボードへ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
