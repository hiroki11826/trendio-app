import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import ContentIdeaCard from './components/ContentIdeaCard';
import ScriptPreview from './components/ScriptPreview';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

export default function AIContent() {
  const [selectedIndustry, setSelectedIndustry] = useState('food');
  const [customIndustry, setCustomIndustry] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('brand_awareness');
  const [freeInput, setFreeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  const [generationContext, setGenerationContext] = useState<any>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [savedIdeaIds, setSavedIdeaIds] = useState<Set<number>>(new Set());

  // Load saved ideas on mount
  useEffect(() => {
    loadSavedIdeas();
  }, []);

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
    { id: 'other', label: 'その他（自由入力）' },
  ];

  const goals = [
    { category: '認知系', options: [
      { id: 'brand_awareness', label: 'ブランド認知を上げたい' },
      { id: 'follower_growth', label: 'フォロワーを増やしたい' },
      { id: 'viral', label: 'バズを狙いたい' },
    ]},
    { category: '集客系', options: [
      { id: 'store_visit', label: '来店・予約を増やしたい' },
      { id: 'product_purchase', label: '商品購入につなげたい' },
      { id: 'ec_sales', label: 'EC売上を伸ばしたい' },
    ]},
    { category: '関係構築', options: [
      { id: 'fan_growth', label: 'ファンを増やしたい' },
      { id: 'community', label: 'コミュニティを作りたい' },
      { id: 'engagement', label: 'エンゲージメントを高めたい' },
    ]},
    { category: '信頼構築', options: [
      { id: 'expertise', label: '専門性をアピールしたい' },
      { id: 'credibility', label: '信頼性を高めたい' },
      { id: 'showcase_results', label: '実績を見せたい' },
    ]},
    { category: '採用', options: [
      { id: 'recruitment_applications', label: '採用応募を増やしたい' },
      { id: 'company_appeal', label: '会社の魅力を伝えたい' },
    ]},
  ];

  const allGoalOptions = goals.flatMap(g => g.options);

  // Load saved ideas on mount
  const loadSavedIdeas = async () => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/content-ideas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedIdeas(data.contentIdeas);
        // 保存済みIDのセットを作成
        const ids = new Set(data.contentIdeas.map((idea: any) => idea.id));
        setSavedIdeaIds(ids);
      }
    } catch (error) {
      console.error('Error loading saved ideas:', error);
    }
  };

  // Save content idea
  const saveContentIdea = async (idea: any) => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/content-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...idea,
          ...generationContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedId = data.contentIdea.id;
        
        // 生成されたアイデアリストを更新して、保存済みIDを追加
        setContentIdeas(prev => prev.map(i => 
          i.tempId === idea.tempId ? { ...i, id: savedId } : i
        ));
        
        alert('アイデアを保存しました');
        await loadSavedIdeas();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('保存に失敗しました');
    }
  };

  // Delete content idea
  const deleteContentIdea = async (ideaId: number) => {
    if (!confirm('このアイデアを削除しますか？')) return;

    try {
      const token = localStorage.getItem('nekocafe_token');
      const response = await fetch(`${API_BASE_URL}/api/content-ideas/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('削除しました');
        loadSavedIdeas();
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('削除に失敗しました');
    }
  };

  // Save script
  const saveScript = async (ideaId: number, script: any) => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      console.log('Saving script for idea:', ideaId);

      const response = await fetch(`${API_BASE_URL}/api/content-scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentIdeaId: ideaId,
          ...script,
        }),
      });

      if (response.ok) {
        alert('台本を保存しました');
        await loadSavedIdeas(); // 保存後にリロード
        console.log('Saved ideas reloaded');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save script error:', errorData);
        throw new Error('Failed to save script');
      }
    } catch (error) {
      console.error('Error saving script:', error);
      alert('台本の保存に失敗しました');
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const industryValue = selectedIndustry === 'other' ? customIndustry : selectedIndustry;
      const goalLabel = allGoalOptions.find(g => g.id === selectedGoal)?.label || selectedGoal;
      
      // コンテキスト情報を保存
      const context = {
        industry: industryValue,
        goal: goalLabel,
        freeInput: freeInput,
      };
      setGenerationContext(context);
      
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content ideas');
      }

      const data = await response.json();
      setContentIdeas(data.ideas.map((idea: any, index: number) => ({
        ...idea,
        tempId: index + 1, // 一時的なID（表示用）
      })));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('コンテンツの生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async (idea: any) => {
    setIsGeneratingScript(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentIdea: {
            title: idea.title,
            concept: idea.concept,
            format: idea.format,
            hook: idea.hook,
            structure: idea.structure,
            caption: idea.caption,
            hashtags: idea.hashtags,
          },
          context: generationContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // レート制限エラーの場合
        if (response.status === 500 && errorData.message?.includes('Too Many Requests')) {
          alert('APIのレート制限に達しました。1分ほど待ってから再度お試しください。');
          return;
        }
        
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setSelectedScript({
        ...idea,
        ...data.script,
        ideaId: idea.id, // 保存用にIDを保持
      });
    } catch (error) {
      console.error('Error generating script:', error);
      alert('台本の生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AIコンテンツ企画</h1>
            <p className="text-gray-500 mt-2">AIを活用したコンテンツアイデアと台本生成</p>
            
            {/* Tabs */}
            <div className="flex space-x-4 mt-6 border-b border-gray-200">
              <button
                onClick={() => { setShowSaved(false); loadSavedIdeas(); }}
                className={`pb-3 px-4 font-medium transition-colors ${
                  !showSaved
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                新規生成
              </button>
              <button
                onClick={() => { setShowSaved(true); loadSavedIdeas(); }}
                className={`pb-3 px-4 font-medium transition-colors ${
                  showSaved
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                保存済み ({savedIdeas.length})
              </button>
            </div>
          </div>

          {/* Selection Panel */}
          {!showSaved && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">業界を選択</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.label}
                    </option>
                  ))}
                </select>
                {selectedIndustry === 'other' && (
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="業界を入力してください"
                    className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">マーケティング目標</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                >
                  {goals.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.options.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">追加の要望（任意）</label>
                <textarea
                  value={freeInput}
                  onChange={(e) => setFreeInput(e.target.value)}
                  placeholder="例：20代女性向け、カジュアルなトーン、商品の特徴を強調したい など"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                onClick={generateContent}
                disabled={isGenerating || (selectedIndustry === 'other' && !customIndustry)}
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
          )}

          {/* Content Ideas */}
          {!showSaved && contentIdeas.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">生成されたコンテンツアイデア</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contentIdeas.map((idea) => (
                  <ContentIdeaCard 
                    key={idea.tempId || idea.id} 
                    idea={idea}
                    onGenerateScript={() => handleGenerateScript(idea)}
                    onSave={() => saveContentIdea(idea)}
                    isGenerating={isGeneratingScript}
                    isSaved={idea.id && savedIdeaIds.has(idea.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Saved Ideas */}
          {showSaved && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">保存済みアイデア</h2>
              {savedIdeas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <i className="ri-inbox-line text-4xl mb-2"></i>
                  <p>保存されたアイデアはありません</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedIdeas.map((idea) => (
                    <ContentIdeaCard 
                      key={idea.id} 
                      idea={idea}
                      onGenerateScript={() => {
                        if (idea.scripts && idea.scripts.length > 0) {
                          setSelectedScript({ ...idea, ...idea.scripts[0] });
                        } else {
                          handleGenerateScript(idea);
                        }
                      }}
                      onDelete={() => deleteContentIdea(idea.id)}
                      isGenerating={isGeneratingScript}
                      isSaved={true}
                      hasScript={idea.scripts && idea.scripts.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedScript && (
        <ScriptPreview 
          script={selectedScript}
          onClose={() => setSelectedScript(null)}
          isSaved={selectedScript.id !== undefined} // scriptにidがあれば保存済み
          onSave={async () => {
            // デバッグ情報
            const token = localStorage.getItem('nekocafe_token');
            console.log('Token exists:', !!token);
            console.log('Selected script:', selectedScript);
            
            // アイデアが保存されていない場合は先に保存
            if (!selectedScript.ideaId) {
              try {
                if (!token) {
                  alert('ログインが必要です。ログインページに移動してください。');
                  return;
                }

                console.log('Saving new idea and script...');

                // アイデアを保存
                const ideaResponse = await fetch(`${API_BASE_URL}/api/content-ideas`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    title: selectedScript.title,
                    concept: selectedScript.concept,
                    format: selectedScript.format,
                    hook: selectedScript.hook,
                    structure: selectedScript.structure,
                    caption: selectedScript.caption,
                    hashtags: selectedScript.hashtags,
                    ...generationContext,
                  }),
                });

                if (!ideaResponse.ok) {
                  const errorData = await ideaResponse.json().catch(() => ({}));
                  console.error('Idea save error:', errorData);
                  throw new Error('Failed to save idea');
                }

                const ideaData = await ideaResponse.json();
                const savedIdeaId = ideaData.contentIdea.id;
                console.log('Idea saved with ID:', savedIdeaId);

                // 台本を保存
                await saveScript(savedIdeaId, {
                  videoTitle: selectedScript.videoTitle,
                  objective: selectedScript.objective,
                  timeline: selectedScript.timeline,
                  fullScript: selectedScript.fullScript,
                  shootingInstructions: selectedScript.shootingInstructions,
                  telops: selectedScript.telops,
                  captionText: selectedScript.captionText,
                  hashtags: selectedScript.hashtags,
                  thumbnailIdea: selectedScript.thumbnailIdea,
                  estimatedDuration: selectedScript.estimatedDuration,
                  whyItWorks: selectedScript.whyItWorks,
                });
                
                console.log('Script saved successfully');
              } catch (error) {
                console.error('Error saving:', error);
                alert('保存に失敗しました: ' + (error as Error).message);
              }
            } else {
              console.log('Saving script for existing idea:', selectedScript.ideaId);
              // アイデアが既に保存されている場合は台本のみ保存
              await saveScript(selectedScript.ideaId, {
                videoTitle: selectedScript.videoTitle,
                objective: selectedScript.objective,
                timeline: selectedScript.timeline,
                fullScript: selectedScript.fullScript,
                shootingInstructions: selectedScript.shootingInstructions,
                telops: selectedScript.telops,
                captionText: selectedScript.captionText,
                hashtags: selectedScript.hashtags,
                thumbnailIdea: selectedScript.thumbnailIdea,
                estimatedDuration: selectedScript.estimatedDuration,
                whyItWorks: selectedScript.whyItWorks,
              });
            }
          }}
        />
      )}
    </div>
  );
}
