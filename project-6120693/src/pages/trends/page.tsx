import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface TrendingTopic {
  topic: string;
  description: string;
  whyTrending: string;
  exampleTitles: string[];
}

interface PopularHashtag {
  hashtag: string;
  category: string;
  usage: string;
}

interface ContentFormat {
  format: string;
  description: string;
  effectiveness: string;
}

interface TrendData {
  trendingTopics: TrendingTopic[];
  popularHashtags: PopularHashtag[];
  contentFormats: ContentFormat[];
  insights: {
    summary: string;
    recommendations: string[];
  };
}

export default function Trends() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'both'>('both');

  const industries = [
    { id: 'food', label: '飲食' },
    { id: 'beauty', label: '美容・サロン' },
    { id: 'apparel', label: 'アパレル' },
    { id: 'ec', label: 'EC・ネットショップ' },
    { id: 'education', label: '教育・スクール' },
    { id: 'it_saas', label: 'IT・SaaS' },
    { id: 'btob', label: 'BtoBサービス' },
    { id: 'realestate', label: '不動産' },
    { id: 'travel', label: '旅行・観光' },
    { id: 'fitness', label: 'フィットネス・ジム' },
    { id: 'medical', label: '医療・クリニック' },
    { id: 'entertainment', label: 'エンタメ' },
    { id: 'influencer', label: '個人ブランド / インフルエンサー' },
    { id: 'local', label: '地方ビジネス' },
    { id: 'startup', label: 'スタートアップ' },
    { id: 'recruitment', label: '採用・HR' },
    { id: 'automotive', label: '自動車' },
    { id: 'finance', label: '金融・投資' },
    { id: 'pet', label: 'ペット' },
    { id: 'construction', label: '建設・建築' },
    { id: 'other', label: 'その他（自由記述可）' },
  ];

  const analyzeTrends = async () => {
    const industryValue = selectedIndustry === 'other' ? customIndustry : selectedIndustry;
    
    if (!industryValue) {
      setError('業界を選択または入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/trends/analyze?industry=${encodeURIComponent(industryValue)}&platform=${selectedPlatform}`
      );

      if (!response.ok) {
        setError('トレンド分析に失敗しました');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTrendData(data);
    } catch (err) {
      console.error('Failed to analyze trends:', err);
      setError('トレンド分析に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">トレンド発見</h1>
            <p className="text-gray-500 mt-2">業界ごとの最新SNSトレンドを分析</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">業界を選択</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  size={1}
                >
                  <option value="">業界を選択してください</option>
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedIndustry === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">業界名を入力</label>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="例：ペット用品、農業、製造業など"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">プラットフォーム</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPlatform('both')}
                    className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      selectedPlatform === 'both'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                      selectedPlatform === 'instagram'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-instagram-line"></i>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('tiktok')}
                    className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                      selectedPlatform === 'tiktok'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-tiktok-line"></i>
                    <span>TikTok</span>
                  </button>
                </div>
              </div>

              <button
                onClick={analyzeTrends}
                disabled={(!selectedIndustry || (selectedIndustry === 'other' && !customIndustry)) || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-search-line text-xl"></i>
                    <span>トレンドを分析</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-3">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
                <div>
                  <h3 className="font-semibold text-red-900">エラー</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {trendData && (
            <>
              {/* Insights Summary */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <i className="ri-lightbulb-line mr-2"></i>
                  トレンドサマリー
                </h3>
                <p className="text-white/90 mb-4">{trendData.insights.summary}</p>
                <div className="space-y-2">
                  {trendData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <i className="ri-check-line text-emerald-200 mt-1"></i>
                      <span className="text-white/90">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
                  <i className="ri-fire-line text-orange-500 mr-2"></i>
                  今バズっているトピック
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendData.trendingTopics.map((topic, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <h4 className="font-semibold text-gray-900 mb-2">{topic.topic}</h4>
                      <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1">なぜバズっているか</p>
                        <p className="text-sm text-emerald-900">{topic.whyTrending}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">投稿例</p>
                        <div className="space-y-1">
                          {topic.exampleTitles.map((title, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                              <i className="ri-arrow-right-s-line text-emerald-600 mt-0.5"></i>
                              <span>{title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Hashtags */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
                  <i className="ri-hashtag text-blue-600 mr-2"></i>
                  人気のハッシュタグ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trendData.popularHashtags.map((hashtag, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-700">{hashtag.hashtag}</span>
                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{hashtag.category}</span>
                      </div>
                      <p className="text-sm text-gray-600">{hashtag.usage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Formats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
                  <i className="ri-video-line text-purple-600 mr-2"></i>
                  効果的なコンテンツ形式
                </h3>
                <div className="space-y-4">
                  {trendData.contentFormats.map((format, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <h4 className="font-semibold text-gray-900 mb-2">{format.format}</h4>
                      <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-purple-700 mb-1">効果的な理由</p>
                        <p className="text-sm text-purple-900">{format.effectiveness}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
