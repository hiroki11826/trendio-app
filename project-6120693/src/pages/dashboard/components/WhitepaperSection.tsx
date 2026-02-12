
import { useState } from 'react';

interface InsightData {
  followers: string;
  impressions: string;
  engagementRate: string;
  comments: string;
}

interface WhitepaperSectionProps {
  insights: InsightData;
}

export default function WhitepaperSection({ insights }: WhitepaperSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'summary' | 'detailed'>('summary');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowWhitepaper(true);
    }, 2000);
  };

  const whitepaperContent = {
    title: 'SNSパフォーマンス分析レポート',
    generatedAt: new Date().toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    sections: [
      {
        title: 'エグゼクティブサマリー',
        icon: 'ri-file-list-3-line',
        content: `現在のSNS運用状況は非常に良好です。フォロワー数${insights.followers}を達成し、インプレッション${insights.impressions}を記録しています。エンゲージメント率${insights.engagementRate}は業界平均の3.5%を上回っており、コンテンツ戦略が効果的に機能していることを示しています。`
      },
      {
        title: 'オーディエンス分析',
        icon: 'ri-group-line',
        content: `総フォロワー数${insights.followers}のうち、アクティブユーザーは約78%を占めています。主要なオーディエンス層は25-34歳の女性で、全体の42%を構成しています。地域別では東京都が最も多く、次いで大阪府、神奈川県となっています。`
      },
      {
        title: 'エンゲージメント分析',
        icon: 'ri-heart-pulse-line',
        content: `エンゲージメント率${insights.engagementRate}は前月比+2.1%の成長を示しています。コメント数${insights.comments}件のうち、ポジティブな反応が85%を占めています。最もエンゲージメントが高い投稿時間帯は平日の19:00-21:00です。`
      },
      {
        title: 'リーチ＆インプレッション',
        icon: 'ri-eye-line',
        content: `総インプレッション${insights.impressions}を達成し、前月比+18.2%の成長を記録しました。オーガニックリーチは全体の67%を占め、ハッシュタグ経由の流入が23%増加しています。リール動画のリーチは通常投稿の3.2倍を記録しています。`
      },
      {
        title: '推奨アクション',
        icon: 'ri-lightbulb-line',
        content: `1. リール動画の投稿頻度を週3回から週5回に増加させることを推奨します。\n2. 19:00-21:00の投稿を優先し、エンゲージメントを最大化してください。\n3. ユーザー生成コンテンツ（UGC）キャンペーンの実施を検討してください。\n4. コメントへの返信率を現在の65%から80%以上に向上させることで、コミュニティ形成を強化できます。`
      }
    ],
    keyMetrics: [
      { label: 'フォロワー成長率', value: '+12.5%', trend: 'up' },
      { label: 'エンゲージメント率', value: insights.engagementRate, trend: 'up' },
      { label: 'リーチ率', value: '68.3%', trend: 'up' },
      { label: 'コンバージョン率', value: '2.4%', trend: 'stable' }
    ]
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <i className="ri-file-paper-2-line text-lg text-gray-400"></i>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">インサイトホワイトペーパー</h2>
              <p className="text-xs text-gray-400">AIがデータを分析してレポートを自動生成</p>
            </div>
          </div>
          
          {!showWhitepaper && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <i className="ri-magic-line"></i>
                  <span>レポート生成</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showWhitepaper && (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{whitepaperContent.title}</h3>
                <p className="text-[11px] text-gray-400">
                  <i className="ri-time-line mr-1"></i>
                  生成日時: {whitepaperContent.generatedAt}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setSelectedFormat('summary')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedFormat === 'summary'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  サマリー
                </button>
                <button
                  onClick={() => setSelectedFormat('detailed')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedFormat === 'detailed'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  詳細
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {whitepaperContent.keyMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 mb-1">{metric.label}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-800">{metric.value}</span>
                  <i className={`text-xs ${
                    metric.trend === 'up' ? 'ri-arrow-up-line text-emerald-500' :
                    metric.trend === 'down' ? 'ri-arrow-down-line text-red-400' :
                    'ri-subtract-line text-gray-300'
                  }`}></i>
                </div>
              </div>
            ))}
          </div>

          {/* Content Sections */}
          <div className="space-y-3">
            {whitepaperContent.sections.map((section, index) => (
              <div 
                key={index} 
                className={`border border-gray-50 rounded-lg overflow-hidden ${
                  selectedFormat === 'summary' && index > 1 ? 'hidden' : ''
                }`}
              >
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                      <i className={`${section.icon} text-gray-400 text-xs`}></i>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-700">{section.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
            <button
              onClick={() => setShowWhitepaper(false)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line"></i>
              <span>再生成</span>
            </button>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-file-copy-line"></i>
                <span>コピー</span>
              </button>
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-download-line"></i>
                <span>PDFダウンロード</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {!showWhitepaper && !isGenerating && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="ri-file-chart-line text-2xl text-gray-300"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">インサイトレポートを生成</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            現在のSNSパフォーマンスデータをもとに、AIが詳細な分析レポートを自動生成します。
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">レポートを生成中...</h3>
          <p className="text-xs text-gray-400">
            AIがデータを分析しています。しばらくお待ちください。
          </p>
          <div className="mt-4 w-40 mx-auto bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="bg-gray-400 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
