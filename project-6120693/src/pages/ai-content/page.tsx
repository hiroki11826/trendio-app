import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import ContentIdeaCard from './components/ContentIdeaCard';
import ScriptPreview from './components/ScriptPreview';

export default function AIContent() {
  const [selectedIndustry, setSelectedIndustry] = useState('recruitment');
  const [selectedGoal, setSelectedGoal] = useState('awareness');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  const [selectedScript, setSelectedScript] = useState<any>(null);

  const industries = [
    { id: 'recruitment', label: '採用', icon: 'ri-briefcase-line' },
    { id: 'food', label: '飲食', icon: 'ri-restaurant-line' },
    { id: 'realestate', label: '不動産', icon: 'ri-building-line' },
    { id: 'construction', label: '建設', icon: 'ri-hammer-line' },
  ];

  const goals = [
    { id: 'awareness', label: 'ブランド認知', icon: 'ri-eye-line' },
    { id: 'engagement', label: 'エンゲージメント', icon: 'ri-heart-line' },
    { id: 'conversion', label: 'コンバージョン', icon: 'ri-shopping-cart-line' },
    { id: 'education', label: '教育', icon: 'ri-book-line' },
  ];

  const generateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const ideas = [
        {
          id: 1,
          title: '1日の仕事風景',
          description: '実際の職場環境と社員の1日を紹介する動画',
          platform: 'instagram',
          estimatedViews: '15K-25K',
          difficulty: '簡単'
        },
        {
          id: 2,
          title: '社員インタビュー',
          description: '現役社員が語る会社の魅力とキャリアパス',
          platform: 'tiktok',
          estimatedViews: '20K-35K',
          difficulty: '中'
        },
        {
          id: 3,
          title: 'オフィスツアー',
          description: '快適な職場環境と充実した設備を紹介',
          platform: 'instagram',
          estimatedViews: '10K-20K',
          difficulty: '簡単'
        },
        {
          id: 4,
          title: '福利厚生紹介',
          description: '充実した福利厚生制度をわかりやすく説明',
          platform: 'tiktok',
          estimatedViews: '18K-30K',
          difficulty: '簡単'
        },
      ];
      setContentIdeas(ideas);
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateScript = (idea: any) => {
    const script = {
      ...idea,
      hook: '「この会社、本当に働きやすい！」実際の社員が語る理由とは？',
      mainContent: `
1. オープニング（0-3秒）
   - 明るい職場の雰囲気を映す
   - 社員の笑顔をクローズアップ

2. 問題提起（3-8秒）
   - 「働きやすい会社を探していませんか？」
   - 視聴者の共感を得る

3. 解決策の提示（8-20秒）
   - 実際の職場環境を紹介
   - 社員の生の声を届ける
   - 具体的な福利厚生を説明

4. 証拠・実例（20-35秒）
   - 社員インタビュー
   - オフィスツアー
   - チームの雰囲気

5. クロージング（35-45秒）
   - 応募方法の案内
   - 次のステップを明確に
      `,
      cta: '詳細はプロフィールのリンクから！今すぐチェック👆',
      hashtags: '#採用 #求人 #転職 #働きやすい会社 #キャリア #就活',
      tips: [
        '最初の3秒で視聴者の注意を引く',
        '明るく前向きなトーンで話す',
        '実際の社員の声を入れると信頼性UP',
        '字幕を必ず入れる（音声なしでも理解できるように）',
      ]
    };
    setSelectedScript(script);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AIコンテンツ企画</h1>
            <p className="text-gray-500 mt-2">AIを活用したコンテンツアイデアと台本生成</p>
          </div>

          {/* Selection Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">業界を選択</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => setSelectedIndustry(industry.id)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                        selectedIndustry === industry.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${industry.icon} text-2xl ${
                        selectedIndustry === industry.id ? 'text-emerald-600' : 'text-gray-600'
                      }`}></i>
                      <span className={`text-sm font-medium ${
                        selectedIndustry === industry.id ? 'text-emerald-900' : 'text-gray-700'
                      }`}>
                        {industry.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">マーケティング目標</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                        selectedGoal === goal.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${goal.icon} text-2xl ${
                        selectedGoal === goal.id ? 'text-teal-600' : 'text-gray-600'
                      }`}></i>
                      <span className={`text-sm font-medium ${
                        selectedGoal === goal.id ? 'text-teal-900' : 'text-gray-700'
                      }`}>
                        {goal.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateContent}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                    <span>AIが生成中...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line text-xl"></i>
                    <span>コンテンツアイデアを生成</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content Ideas */}
          {contentIdeas.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">生成されたコンテンツアイデア</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contentIdeas.map((idea) => (
                  <ContentIdeaCard 
                    key={idea.id} 
                    idea={idea}
                    onGenerateScript={() => handleGenerateScript(idea)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedScript && (
        <ScriptPreview 
          script={selectedScript}
          onClose={() => setSelectedScript(null)}
        />
      )}
    </div>
  );
}
