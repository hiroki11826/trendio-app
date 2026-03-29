import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface TikTokUserInfo {
  open_id?: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

interface TikTokVideo {
  id?: string;
  title?: string;
  cover_image_url?: string;
  share_url?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  create_time?: number;
}

export default function TikTokDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<TikTokUserInfo | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);

  useEffect(() => {
    fetchTikTokData();
  }, []);

  const fetchTikTokData = async () => {
    try {
      setLoading(true);
      setNotConnected(false);

      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        setNotConnected(true);
        setLoading(false);
        return;
      }

      // Fetch user info
      const userResponse = await fetch(`${API_BASE_URL}/api/tiktok/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.status === 404 || userResponse.status === 401) {
        setNotConnected(true);
        setLoading(false);
        return;
      }

      if (!userResponse.ok) {
        setNotConnected(true);
        setLoading(false);
        return;
      }

      const userData = await userResponse.json();
      setUserInfo(userData);

      // Fetch videos
      const videosResponse = await fetch(`${API_BASE_URL}/api/tiktok/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }

    } catch (err) {
      console.error('Failed to fetch TikTok data:', err);
      setNotConnected(true);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const calculateEngagementRate = (): string => {
    if (!userInfo || !userInfo.follower_count) return '0.00';
    const totalEngagement = videos.reduce((sum, video) => {
      return sum + (video.like_count || 0) + (video.comment_count || 0) + (video.share_count || 0);
    }, 0);
    const avgEngagement = videos.length > 0 ? totalEngagement / videos.length : 0;
    return ((avgEngagement / userInfo.follower_count) * 100).toFixed(2);
  };

  const totalViews = videos.reduce((sum, video) => sum + (video.view_count || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900">
            <i className="ri-tiktok-line text-lg text-white"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
            <p className="text-xs text-gray-400">読み込み中...</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-12 border border-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (notConnected) {
    return (
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900">
            <i className="ri-tiktok-line text-lg text-white"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
            <p className="text-xs text-gray-400">フォロワー・動画パフォーマンス</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="ri-tiktok-line text-3xl text-gray-900"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              TikTokアカウントを連携してください
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              アカウントを連携すると、動画のパフォーマンスやエンゲージメント分析などのインサイトデータを確認できます。
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
            >
              <i className="ri-link mr-2"></i>
              設定ページで連携する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const metrics = [
    { label: 'フォロワー', value: formatNumber(userInfo.follower_count), icon: 'ri-user-follow-line' },
    { label: '動画数', value: formatNumber(userInfo.video_count), icon: 'ri-video-line' },
    { label: '合計いいね', value: formatNumber(userInfo.likes_count), icon: 'ri-heart-line' },
    { label: '平均視聴回数', value: formatNumber(avgViews), icon: 'ri-eye-line' },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900">
          <i className="ri-tiktok-line text-lg text-white"></i>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
          <p className="text-xs text-gray-400">{userInfo.display_name || 'ユーザー'}</p>
        </div>
      </div>

      {/* サマリー指標 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50">
                <i className={`${metric.icon} text-gray-900 text-base`}></i>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{metric.label}</p>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* 最近の動画 */}
      {videos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">最近の動画</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.slice(0, 8).map((video, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden mb-2">
                  {video.cover_image_url && (
                    <img
                      src={video.cover_image_url}
                      alt={video.title || 'Video'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="ri-play-circle-line text-4xl text-white"></i>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center space-x-2 text-white text-xs">
                      <span className="flex items-center">
                        <i className="ri-eye-line mr-1"></i>
                        {formatNumber(video.view_count)}
                      </span>
                      <span className="flex items-center">
                        <i className="ri-heart-line mr-1"></i>
                        {formatNumber(video.like_count)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{video.title || '無題'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* エンゲージメント率 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">エンゲージメント率</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full"
                style={{ width: `${Math.min(parseFloat(calculateEngagementRate()), 100)}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-semibold text-gray-900">{calculateEngagementRate()}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          フォロワーあたりの平均エンゲージメント（いいね + コメント + シェア）
        </p>
      </div>
    </div>
  );
}
