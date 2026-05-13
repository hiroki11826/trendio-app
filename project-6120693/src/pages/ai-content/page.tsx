import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../dashboard/components/Sidebar';
import ContentIdeaCard from './components/ContentIdeaCard';
import ScriptPreview from './components/ScriptPreview';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

export default function AIContent() {
  const { t } = useTranslation();
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

  useEffect(() => { loadSavedIdeas(); }, []);

  const industries = [
    { id: 'food', label: t('industry.food') },
    { id: 'beauty', label: t('industry.beauty') },
    { id: 'apparel', label: t('industry.apparel') },
    { id: 'ec', label: t('industry.ec') },
    { id: 'education', label: t('industry.education') },
    { id: 'it_saas', label: t('industry.it_saas') },
    { id: 'btob', label: t('industry.btob') },
    { id: 'realestate', label: t('industry.realestate') },
    { id: 'travel', label: t('industry.travel') },
    { id: 'fitness', label: t('industry.fitness') },
    { id: 'medical', label: t('industry.medical') },
    { id: 'entertainment', label: t('industry.entertainment') },
    { id: 'influencer', label: t('industry.influencer') },
    { id: 'local', label: t('industry.local') },
    { id: 'startup', label: t('industry.startup') },
    { id: 'recruitment', label: t('industry.recruitment') },
    { id: 'automotive', label: t('industry.automotive') },
    { id: 'finance', label: t('industry.finance') },
    { id: 'pet', label: t('industry.pet') },
    { id: 'other', label: t('industry.other') },
  ];

  const goals = [
    { category: t('goal.category.awareness'), options: [
      { id: 'brand_awareness', label: t('goal.brand_awareness') },
      { id: 'follower_growth', label: t('goal.follower_growth') },
      { id: 'viral', label: t('goal.viral') },
    ]},
    { category: t('goal.category.acquisition'), options: [
      { id: 'store_visit', label: t('goal.store_visit') },
      { id: 'product_purchase', label: t('goal.product_purchase') },
      { id: 'ec_sales', label: t('goal.ec_sales') },
    ]},
    { category: t('goal.category.relationship'), options: [
      { id: 'fan_growth', label: t('goal.fan_growth') },
      { id: 'community', label: t('goal.community') },
      { id: 'engagement', label: t('goal.engagement') },
    ]},
    { category: t('goal.category.trust'), options: [
      { id: 'expertise', label: t('goal.expertise') },
      { id: 'credibility', label: t('goal.credibility') },
      { id: 'showcase_results', label: t('goal.showcase_results') },
    ]},
    { category: t('goal.category.recruitment'), options: [
      { id: 'recruitment_applications', label: t('goal.recruitment_applications') },
      { id: 'company_appeal', label: t('goal.company_appeal') },
    ]},
  ];

  const allGoalOptions = goals.flatMap(g => g.options);

  const loadSavedIdeas = async () => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/content-ideas`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedIdeas(data.contentIdeas);
        const ids = new Set<number>(data.contentIdeas.map((idea: any) => idea.id));
        setSavedIdeaIds(ids);
      }
    } catch (error) { console.error('Error loading saved ideas:', error); }
  };

  const saveContentIdea = async (idea: any) => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) { alert(t('aiContent.loginRequired')); return; }
      const response = await fetch(`${API_BASE_URL}/api/content-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...idea, ...generationContext }),
      });
      if (response.ok) {
        const data = await response.json();
        setContentIdeas(prev => prev.map(i => i.tempId === idea.tempId ? { ...i, id: data.contentIdea.id } : i));
        alert(t('aiContent.ideaSaved'));
        await loadSavedIdeas();
      } else { throw new Error('Failed to save'); }
    } catch (error) { console.error('Error saving idea:', error); alert(t('aiContent.saveFailed')); }
  };

  const deleteContentIdea = async (ideaId: number) => {
    if (!confirm(t('aiContent.deleteConfirm'))) return;
    try {
      const token = localStorage.getItem('nekocafe_token');
      const response = await fetch(`${API_BASE_URL}/api/content-ideas/${ideaId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) { alert(t('aiContent.deleted')); loadSavedIdeas(); }
    } catch (error) { console.error('Error deleting idea:', error); alert(t('aiContent.deleteFailed')); }
  };

  const saveScript = async (ideaId: number, script: any) => {
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) { alert(t('aiContent.loginRequired')); return; }
      const response = await fetch(`${API_BASE_URL}/api/content-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ contentIdeaId: ideaId, ...script }),
      });
      if (response.ok) { 
        const data = await response.json();
        alert(t('aiContent.scriptSaved')); 
        // 保存後、selectedScriptを更新してisSavedをtrueにする
        if (selectedScript) {
          setSelectedScript({ ...selectedScript, id: data.contentScript.id, ideaId: ideaId });
        }
        await loadSavedIdeas(); 
      }
      else { throw new Error('Failed to save script'); }
    } catch (error) { console.error('Error saving script:', error); alert(t('aiContent.scriptSaveFailed')); }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const industryValue = selectedIndustry === 'other' ? customIndustry : selectedIndustry;
      const goalLabel = allGoalOptions.find(g => g.id === selectedGoal)?.label || selectedGoal;
      const context = { industry: industryValue, goal: goalLabel, freeInput };
      setGenerationContext(context);
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-ideas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });
      if (!response.ok) throw new Error('Failed to generate content ideas');
      const data = await response.json();
      setContentIdeas(data.ideas.map((idea: any, index: number) => ({ ...idea, tempId: index + 1 })));
    } catch (error) { console.error('Error generating content:', error); alert(t('aiContent.generateFailed')); }
    finally { setIsGenerating(false); }
  };

  const handleGenerateScript = async (idea: any) => {
    setIsGeneratingScript(true);
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        alert(t('aiContent.loginRequired'));
        setIsGeneratingScript(false);
        return;
      }

      // スクリプトを生成
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-script`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentIdea: { title: idea.title, concept: idea.concept, format: idea.format, hook: idea.hook, structure: idea.structure, caption: idea.caption, hashtags: idea.hashtags },
          context: generationContext,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 500 && errorData.message?.includes('Too Many Requests')) { alert(t('aiContent.rateLimitError')); return; }
        throw new Error('Failed to generate script');
      }
      const data = await response.json();
      const generatedScript = data.script;

      // アイデアが保存されていない場合は、まずアイデアを保存
      let contentIdeaId = idea.id;
      if (!contentIdeaId) {
        const ideaResponse = await fetch(`${API_BASE_URL}/api/content-ideas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            title: idea.title,
            concept: idea.concept,
            format: idea.format,
            hook: idea.hook,
            structure: idea.structure,
            caption: idea.caption,
            hashtags: idea.hashtags,
            ...generationContext
          }),
        });
        if (!ideaResponse.ok) throw new Error('Failed to save idea');
        const ideaData = await ideaResponse.json();
        contentIdeaId = ideaData.contentIdea.id;
      }

      // スクリプトを自動保存
      const scriptResponse = await fetch(`${API_BASE_URL}/api/content-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          contentIdeaId: contentIdeaId,
          videoTitle: generatedScript.videoTitle,
          objective: generatedScript.objective,
          timeline: generatedScript.timeline,
          fullScript: generatedScript.fullScript,
          shootingInstructions: generatedScript.shootingInstructions,
          telops: generatedScript.telops,
          captionText: generatedScript.captionText,
          hashtags: generatedScript.hashtags,
          thumbnailIdea: generatedScript.thumbnailIdea,
          estimatedDuration: generatedScript.estimatedDuration,
          whyItWorks: generatedScript.whyItWorks
        }),
      });

      if (!scriptResponse.ok) throw new Error('Failed to save script');
      const scriptData = await scriptResponse.json();

      // 保存されたスクリプトを表示（id付き）
      setSelectedScript({
        ...generatedScript,
        id: scriptData.contentScript.id,
        ideaId: contentIdeaId,
        title: idea.title,
        concept: idea.concept,
        format: idea.format,
        hook: idea.hook,
        structure: idea.structure,
        caption: idea.caption,
        hashtags: idea.hashtags
      });

      // 保存済みアイデアリストを更新
      await loadSavedIdeas();
      
      // savedIdeasの状態を即座に更新して、UIに反映
      setSavedIdeas(prev => prev.map(i => 
        i.id === contentIdeaId 
          ? { ...i, scripts: [scriptData.contentScript] } 
          : i
      ));
      
      // New Generationタブの場合、contentIdeasも更新
      if (!idea.id) {
        setContentIdeas(prev => prev.map(i => 
          i.tempId === idea.tempId ? { ...i, id: contentIdeaId } : i
        ));
        setSavedIdeaIds(prev => new Set([...prev, contentIdeaId]));
      }
      
    } catch (error) { 
      console.error('Error generating/saving script:', error); 
      alert(t('aiContent.generateFailed')); 
    }
    finally { setIsGeneratingScript(false); }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('aiContent.title')}</h1>
            <p className="text-gray-500 mt-2">{t('aiContent.subtitle')}</p>
            <div className="flex space-x-4 mt-6 border-b border-gray-200">
              <button onClick={() => { setShowSaved(false); loadSavedIdeas(); }} className={`pb-3 px-4 font-medium transition-colors ${!showSaved ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('aiContent.newGeneration')}</button>
              <button onClick={() => { setShowSaved(true); loadSavedIdeas(); }} className={`pb-3 px-4 font-medium transition-colors ${showSaved ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('aiContent.saved')} ({savedIdeas.length})</button>
            </div>
          </div>
          {!showSaved && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('aiContent.selectIndustry')}</label>
                  <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors">
                    {industries.map((industry) => (<option key={industry.id} value={industry.id}>{industry.label}</option>))}
                  </select>
                  {selectedIndustry === 'other' && (<input type="text" value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} placeholder={t('aiContent.enterIndustry')} className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors" />)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('aiContent.marketingGoal')}</label>
                  <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors">
                    {goals.map((group) => (<optgroup key={group.category} label={group.category}>{group.options.map((goal) => (<option key={goal.id} value={goal.id}>{goal.label}</option>))}</optgroup>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('aiContent.additionalRequests')}</label>
                  <textarea value={freeInput} onChange={(e) => setFreeInput(e.target.value)} placeholder={t('aiContent.additionalRequestsPlaceholder')} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors resize-none" />
                </div>
                <button onClick={generateContent} disabled={isGenerating || (selectedIndustry === 'other' && !customIndustry)} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap">
                  {isGenerating ? (<><i className="ri-loader-4-line animate-spin text-xl"></i><span>{t('aiContent.generating')}</span></>) : (<><i className="ri-magic-line text-xl"></i><span>{t('aiContent.generate')}</span></>)}
                </button>
              </div>
            </div>
          )}
          {!showSaved && contentIdeas.length > 0 && (<div><h2 className="text-xl font-bold text-gray-900 mb-4">{t('aiContent.generatedIdeas')}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{contentIdeas.map((idea) => (<ContentIdeaCard key={idea.tempId || idea.id} idea={idea} onGenerateScript={() => handleGenerateScript(idea)} onSave={() => saveContentIdea(idea)} isGenerating={isGeneratingScript} isSaved={idea.id && savedIdeaIds.has(idea.id)} />))}</div></div>)}
          {showSaved && (<div><h2 className="text-xl font-bold text-gray-900 mb-4">{t('aiContent.savedIdeas')}</h2>{savedIdeas.length === 0 ? (<div className="text-center py-12 text-gray-500"><i className="ri-inbox-line text-4xl mb-2"></i><p>{t('aiContent.noSavedIdeas')}</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{savedIdeas.map((idea) => (<ContentIdeaCard key={idea.id} idea={idea} onGenerateScript={() => { if (idea.scripts && idea.scripts.length > 0) { const script = idea.scripts[0]; setSelectedScript({ 
            videoTitle: script.videoTitle,
            objective: script.objective,
            timeline: script.timeline,
            fullScript: script.fullScript,
            shootingInstructions: script.shootingInstructions,
            telops: script.telops,
            captionText: script.captionText,
            hashtags: script.hashtags,
            thumbnailIdea: script.thumbnailIdea,
            estimatedDuration: script.estimatedDuration,
            whyItWorks: script.whyItWorks,
            ideaId: idea.id, 
            id: script.id,
            title: idea.title,
            concept: idea.concept,
            format: idea.format,
            hook: idea.hook,
            structure: idea.structure,
            caption: idea.caption
          }); } else { handleGenerateScript(idea); } }} onDelete={() => deleteContentIdea(idea.id)} isGenerating={isGeneratingScript} isSaved={true} hasScript={idea.scripts && idea.scripts.length > 0} />))}</div>)}</div>)}
        </div>
      </div>
      {selectedScript && (<ScriptPreview script={selectedScript} onClose={() => setSelectedScript(null)} isSaved={selectedScript.id !== undefined} onSave={async () => { const token = localStorage.getItem('nekocafe_token'); if (!selectedScript.ideaId) { try { if (!token) { alert(t('aiContent.loginRequired')); return; } const ideaResponse = await fetch(`${API_BASE_URL}/api/content-ideas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: selectedScript.title, concept: selectedScript.concept, format: selectedScript.format, hook: selectedScript.hook, structure: selectedScript.structure, caption: selectedScript.caption, hashtags: selectedScript.hashtags, ...generationContext }) }); if (!ideaResponse.ok) throw new Error('Failed to save idea'); const ideaData = await ideaResponse.json(); await saveScript(ideaData.contentIdea.id, { videoTitle: selectedScript.videoTitle, objective: selectedScript.objective, timeline: selectedScript.timeline, fullScript: selectedScript.fullScript, shootingInstructions: selectedScript.shootingInstructions, telops: selectedScript.telops, captionText: selectedScript.captionText, hashtags: selectedScript.hashtags, thumbnailIdea: selectedScript.thumbnailIdea, estimatedDuration: selectedScript.estimatedDuration, whyItWorks: selectedScript.whyItWorks }); } catch (error) { console.error('Error saving:', error); alert(t('aiContent.saveFailed') + ': ' + (error as Error).message); } } else { await saveScript(selectedScript.ideaId, { videoTitle: selectedScript.videoTitle, objective: selectedScript.objective, timeline: selectedScript.timeline, fullScript: selectedScript.fullScript, shootingInstructions: selectedScript.shootingInstructions, telops: selectedScript.telops, captionText: selectedScript.captionText, hashtags: selectedScript.hashtags, thumbnailIdea: selectedScript.thumbnailIdea, estimatedDuration: selectedScript.estimatedDuration, whyItWorks: selectedScript.whyItWorks }); } }} />)}
    </div>
  );
}
