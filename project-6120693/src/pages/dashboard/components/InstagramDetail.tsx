import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError, type InstagramInsightsResponse } from '../../../services/api';
import FollowerTrendChart from './instagram/FollowerTrendChart';
import SummaryMetrics from './instagram/SummaryMetrics';
import ActionTrendChart from './instagram/ActionTrendChart';
import GenderBarChart from './instagram/GenderBarChart';
import GenderPieChart from './instagram/GenderPieChart';
import RegionBarChart from './instagram/RegionBarChart';
import PostingHoursChart from './instagram/PostingHoursChart';

export default function InstagramDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<InstagramInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setNotConnected(false);
        const insights = await api.getInstagramInsights();
        setData(insights);
      } catch (err) {
        console.error('Failed to fetch Instagram insights:', err);
        if (err instanceof ApiError && (err.status === 404 || err.status === 422)) {
          setNotConnected(true);
        } else {
          setNotConnected(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!loading && notConnected) {
    return (
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-400">
            <i className="ri-instagram-line text-lg text-white"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Instagram</h2>
            <p className="text-xs text-gray-400">{t('instagram.subtitle')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
              <i className="ri-instagram-line text-3xl text-pink-500"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('instagram.connectPrompt')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('instagram.connectDesc')}
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all cursor-pointer"
            >
              <i className="ri-link mr-2"></i>
              {t('dashboard.connectOnSettings')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-400">
            <i className="ri-instagram-line text-lg text-white"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Instagram</h2>
            <p className="text-xs text-gray-400">{t('instagram.subtitle')}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-gray-400 mb-2"></i>
          <p className="text-sm text-gray-500">{t('dashboard.loading')}</p>
        </div>
      )}

      {!loading && data && (
        <>
          <SummaryMetrics data={data.summary} />
          <div className="mt-5">
            <FollowerTrendChart data={data.followerTrend} />
          </div>
          <div className="mt-5">
            <ActionTrendChart 
              data={data.actionTrend} 
              summary={data.actionSummary} 
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <GenderBarChart data={data.genderByPeriod} />
            <GenderPieChart data={data.genderRatio} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <RegionBarChart data={data.regions} />
            <PostingHoursChart data={data.postingHours} />
          </div>
        </>
      )}
    </div>
  );
}
