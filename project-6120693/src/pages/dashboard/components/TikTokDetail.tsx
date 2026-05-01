import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError, type TikTokInsightsResponse } from '../../../services/api';

export default function TikTokDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<TikTokInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setNotConnected(false);
        const insights = await api.getTikTokInsights();
        setData(insights);
      } catch (err) {
        // TikTok未連携の場合は想定内のエラーなので、警告レベルでログ出力
        if (err instanceof ApiError && (err.status === 404 || err.status === 422 || err.status === 401)) {
          console.warn('TikTok not connected:', err.status);
          setNotConnected(true);
        } else {
          console.error('Failed to fetch TikTok insights:', err);
          setNotConnected(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900">
            <i className="ri-tiktok-line text-lg text-white"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
            <p className="text-xs text-gray-400">{t('dashboard.loading')}</p>
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
            <p className="text-xs text-gray-400">{t('tiktok.subtitle')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="ri-tiktok-line text-3xl text-gray-900"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('tiktok.connectPrompt')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('tiktok.connectDesc')}</p>
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
            >
              <i className="ri-link mr-2"></i>
              {t('dashboard.connectOnSettings')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { account, summary, videos } = data;
  const avgViews = videos && videos.length > 0
    ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length)
    : 0;

  const metrics = [
    { label: t('instagram.followers'), value: formatNumber(account?.followerCount), icon: 'ri-user-follow-line' },
    { label: t('tiktok.videos'), value: formatNumber(account?.videoCount), icon: 'ri-video-line' },
    { label: t('tiktok.totalLikes'), value: formatNumber(summary?.totalLikes), icon: 'ri-heart-line' },
    { label: t('tiktok.avgViews'), value: formatNumber(avgViews), icon: 'ri-eye-line' },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900">
          <i className="ri-tiktok-line text-lg text-white"></i>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">TikTok</h2>
          <p className="text-xs text-gray-400">{account?.displayName || t('tiktok.user')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50">
                <i className={`${metric.icon} text-gray-900 text-base`}></i>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{metric.label}</p>
            {videos.slice(0, 8).map((video, index) => (
              <div key={video.id || index} className="group cursor-pointer" onClick={() => video.shareUrl && window.open(video.shareUrl, '_blank', 'noopener,noreferrer')}>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-2" style={{aspectRatio: '9/16'}}>
      </div>

      {videos && videos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">{t('tiktok.recentVideos')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos.slice(0, 8).map((video, index) => (
              <div key={video.id || index} className="group cursor-pointer">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-2" style={{aspectRatio: '9/16'}}>
                  {video.coverUrl && (
                    <img
                      src={video.coverUrl}
                      alt={video.title || t('tiktok.untitled')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="ri-play-circle-line text-4xl text-white"></i>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center space-x-2 text-white text-xs">
                      <span className="flex items-center"><i className="ri-eye-line mr-1"></i>{formatNumber(video.views)}</span>
                      <span className="flex items-center"><i className="ri-heart-line mr-1"></i>{formatNumber(video.likes)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{video.title || t('tiktok.untitled')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('tiktok.engagementRate')}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full"
                style={{ width: `${Math.min(summary?.avgEngagementRate ?? 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-semibold text-gray-900">{summary?.avgEngagementRate?.toFixed(2) || '0.00'}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('tiktok.engagementDesc')}</p>
      </div>
    </div>
  );
}
