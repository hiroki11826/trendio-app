import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import TrendVideoCard from './components/TrendVideoCard';
import { trendVideosData } from '../../mocks/trends';

export default function Trends() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');

  const categories = [
    { id: 'all', label: 'すべて', icon: 'ri-grid-line' },
    { id: 'recruitment', label: '採用', icon: 'ri-briefcase-line' },
    { id: 'food', label: '飲食', icon: 'ri-restaurant-line' },
    { id: 'realestate', label: '不動産', icon: 'ri-building-line' },
    { id: 'construction', label: '建設', icon: 'ri-hammer-line' },
  ];

  const filteredTrends = trendVideosData.filter(trend => {
    if (categoryFilter !== 'all' && trend.category !== categoryFilter) return false;
    if (platformFilter !== 'all' && trend.platform !== platformFilter) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">トレンド発見</h1>
            <p className="text-gray-500 mt-2">人気のInstagram ReelsとTikTok動画を発見</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">カテゴリー</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setCategoryFilter(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                        categoryFilter === category.id
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`${category.icon} text-base`}></i>
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">プラットフォーム</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      platformFilter === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => setPlatformFilter('instagram')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      platformFilter === 'instagram'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlatformFilter('tiktok')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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

          {/* Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map((trend) => (
              <TrendVideoCard key={trend.id} video={trend} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
