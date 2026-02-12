
import { useState } from 'react';

interface Post {
  id: number;
  platform: string;
  thumbnail: string;
  caption: string;
  impressions: number;
  engagement: number;
  date: string;
  isHighPerforming: boolean;
}

interface ActionInsightsProps {
  topPosts: Post[];
  hashtags: Array<{ tag: string; posts: number; growth: number }>;
  audios: Array<{ name: string; uses: number; trend: string }>;
}

export default function ActionInsights({ topPosts, hashtags, audios }: ActionInsightsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'trends'>('posts');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const highPerformingPosts = topPosts.filter(p => p.isHighPerforming).slice(0, 3);

  const aiSuggestions = [
    {
      icon: 'ri-time-line',
      title: '最適な投稿時間',
      description: 'オーディエンスの活動に基づき、19〜21時の投稿でエンゲージメントが23%向上します。',
      priority: 'high',
    },
    {
      icon: 'ri-hashtag',
      title: 'トレンドハッシュタグ',
      description: `#${hashtags[0]?.tag.replace('#', '')} が+${hashtags[0]?.growth}%成長中。次の投稿に含めましょう。`,
      priority: 'medium',
    },
    {
      icon: 'ri-movie-line',
      title: 'リール動画を増やす',
      description: 'リールは通常投稿の2.3倍のリーチを獲得。頻度を増やしましょう。',
      priority: 'high',
    },
    {
      icon: 'ri-music-2-line',
      title: 'トレンドオーディオ',
      description: `「${audios[0]?.name}」が${formatNumber(audios[0]?.uses || 0)}回使用でトレンド中。`,
      priority: 'medium',
    }
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100">
          <i className="ri-flashlight-line text-gray-500 text-lg"></i>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">アクションインサイト</h2>
          <p className="text-xs text-gray-400">データに基づいた改善提案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Suggestions */}
        <div className="lg:col-span-1 bg-gray-900 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10">
              <i className="ri-sparkling-2-fill text-amber-300 text-sm"></i>
            </div>
            <h3 className="text-sm font-semibold text-white">AI 提案</h3>
          </div>
          
          <div className="space-y-2.5">
            {aiSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="bg-white/5 rounded-lg p-3.5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 bg-white/10">
                    <i className={`${suggestion.icon} text-xs ${suggestion.priority === 'high' ? 'text-amber-300' : 'text-gray-400'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <p className="text-xs font-medium text-white">{suggestion.title}</p>
                      {suggestion.priority === 'high' && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded whitespace-nowrap">重要</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'posts' ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <i className="ri-fire-line text-gray-400"></i>
                  <h3 className="text-sm font-semibold text-gray-700">高パフォーマンス投稿</h3>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer whitespace-nowrap">
                  すべて表示
                </button>
              </div>

              <div className="space-y-3">
                {highPerformingPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="flex items-center space-x-4 p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-semibold text-xs flex-shrink-0">
                      {index + 1}
                    </div>
                    <img 
                      src={post.thumbnail} 
                      alt={post.caption}
                      className="w-14 h-14 rounded-lg object-cover object-top flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <i className={`${post.platform === 'instagram' ? 'ri-instagram-line text-gray-400' : 'ri-tiktok-line text-gray-600'} text-xs`}></i>
                        <p className="text-xs font-medium text-gray-700 truncate">{post.caption}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                        <span><i className="ri-eye-line mr-1"></i>{formatNumber(post.impressions)}</span>
                        <span><i className="ri-heart-line mr-1"></i>{formatNumber(post.engagement)}</span>
                        <span className="text-gray-600 font-medium">
                          {((post.engagement / post.impressions) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all cursor-pointer">
                        <i className="ri-repeat-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 flex-shrink-0">
                    <i className="ri-lightbulb-flash-line text-gray-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">成功パターンの分析</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      これらの投稿に共通する要素：強力なフック、トレンドオーディオの活用、明確なCTAが含まれています。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 h-full">
              <div className="grid grid-cols-2 gap-4">
                {/* Trending Hashtags */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <i className="ri-hashtag text-gray-400"></i>
                    <h3 className="text-xs font-semibold text-gray-700">トレンドハッシュタグ</h3>
                  </div>
                  <div className="space-y-2">
                    {hashtags.slice(0, 5).map((hashtag, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-gray-700">{hashtag.tag}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">+{hashtag.growth}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Audio */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <i className="ri-music-2-line text-gray-400"></i>
                    <h3 className="text-xs font-semibold text-gray-700">トレンドオーディオ</h3>
                  </div>
                  <div className="space-y-2">
                    {audios.map((audio, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200">
                            <i className="ri-play-fill text-gray-500 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{audio.name}</p>
                            <p className="text-[10px] text-gray-400">{formatNumber(audio.uses)} uses</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium ${
                          audio.trend === 'rising' ? 'text-gray-700' : 
                          audio.trend === 'stable' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {audio.trend === 'rising' ? '↑ 急上昇中' : audio.trend === 'stable' ? '→ 安定' : '↓ 減少'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-search-line mr-2"></i>
                    もっと見る
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
