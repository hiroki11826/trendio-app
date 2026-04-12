import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ReportData {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    analysis: string;
  }>;
  sections: Array<{
    title: string;
    icon: string;
    content: string;
  }>;
  recommendations: string[];
  conclusion: string;
}

interface SavedReport extends ReportData {
  id: string;
  platform: 'instagram' | 'tiktok';
  savedAt: string;
}

export default function WhitepaperSection() {
  const { t, i18n } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [selectedFormat, setSelectedFormat] = useState<'summary' | 'detailed'>('summary');
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => {
    const saved = localStorage.getItem('whitepaper_reports');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedList, setShowSavedList] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleGenerateClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = () => {
    setShowConfirmModal(false);
    handleGenerate();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem('nekocafe_token');
      if (!token) {
        setError(t('whitepaper.loginRequired'));
        setIsGenerating(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/report/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ platform: selectedPlatform }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('whitepaper.generateFailed'));
      }
      const data = await response.json();
      setReport(data);
      setShowWhitepaper(true);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err instanceof Error ? err.message : t('whitepaper.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'ja' ? 'ja-JP' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveReport = () => {
    if (!report) return;
    const savedReport: SavedReport = {
      ...report,
      id: Date.now().toString(),
      platform: selectedPlatform,
      savedAt: new Date().toISOString(),
    };
    const updatedReports = [savedReport, ...savedReports];
    setSavedReports(updatedReports);
    localStorage.setItem('whitepaper_reports', JSON.stringify(updatedReports));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoadReport = (savedReport: SavedReport) => {
    setReport(savedReport);
    setSelectedPlatform(savedReport.platform);
    setShowWhitepaper(true);
    setShowSavedList(false);
  };

  const handleDeleteReport = (id: string) => {
    const updatedReports = savedReports.filter(r => r.id !== id);
    setSavedReports(updatedReports);
    localStorage.setItem('whitepaper_reports', JSON.stringify(updatedReports));
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
              <h2 className="text-base font-semibold text-gray-800">{t('whitepaper.title')}</h2>
              <p className="text-xs text-gray-400">{t('whitepaper.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowSavedList(!showSavedList)} className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${showSavedList ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              <i className="ri-folder-line"></i>
              <span>{t('whitepaper.saved')} ({savedReports.length})</span>
            </button>
            <div className="flex items-center space-x-1.5 bg-gray-50 rounded-lg p-1">
              <button onClick={() => setSelectedPlatform('instagram')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedPlatform === 'instagram' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <i className="ri-instagram-line"></i>
                <span>Instagram</span>
              </button>
              <button onClick={() => setSelectedPlatform('tiktok')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedPlatform === 'tiktok' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <i className="ri-tiktok-line"></i>
                <span>TikTok</span>
              </button>
            </div>
            <button onClick={handleGenerateClick} disabled={isGenerating} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap">
              {isGenerating ? (<><i className="ri-loader-4-line animate-spin"></i><span>{t('whitepaper.generating')}</span></>) : (<><i className="ri-magic-line"></i><span>{t('whitepaper.generate')}</span></>)}
            </button>
          </div>
        </div>
      </div>

      {showSavedList && (
        <div className="p-6 border-b border-gray-50 bg-gray-50">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">{t('whitepaper.savedReports')}</h4>
          {savedReports.length === 0 ? (
            <p className="text-xs text-gray-400">{t('whitepaper.noSavedReports')}</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedReports.map((savedReport) => (
                <div key={savedReport.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className={savedReport.platform === 'instagram' ? 'ri-instagram-line text-pink-500' : 'ri-tiktok-line text-gray-900'}></i>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{savedReport.title}</p>
                      <p className="text-[10px] text-gray-400">{t('whitepaper.savedAt')}: {formatDate(savedReport.savedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleLoadReport(savedReport)} className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-all cursor-pointer">
                      <i className="ri-eye-line mr-1"></i>{t('whitepaper.view')}
                    </button>
                    <button onClick={() => handleDeleteReport(savedReport.id)} className="px-2 py-1 text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showWhitepaper && report && (
        <div className="p-6">
          <div className="mb-6 pb-6 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <i className={selectedPlatform === 'instagram' ? 'ri-instagram-line text-pink-500' : 'ri-tiktok-line text-gray-900'}></i>
                  <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                </div>
                <p className="text-[11px] text-gray-400">
                  <i className="ri-time-line mr-1"></i>
                  {t('whitepaper.generatedAt')}: {formatDate(report.generatedAt)}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 rounded-lg p-1">
                <button onClick={() => setSelectedFormat('summary')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedFormat === 'summary' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t('whitepaper.summary')}
                </button>
                <button onClick={() => setSelectedFormat('detailed')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedFormat === 'detailed' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t('whitepaper.detailed')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">{t('whitepaper.executiveSummary')}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{report.executiveSummary}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {report.keyMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 mb-1">{metric.label}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-800">{metric.value}</span>
                  <i className={`text-xs ${metric.trend === 'up' ? 'ri-arrow-up-line text-emerald-500' : metric.trend === 'down' ? 'ri-arrow-down-line text-red-400' : 'ri-subtract-line text-gray-300'}`}></i>
                </div>
                {selectedFormat === 'detailed' && <p className="text-[10px] text-gray-400 mt-2">{metric.analysis}</p>}
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            {report.sections.map((section, index) => (
              <div key={index} className={`border border-gray-50 rounded-lg overflow-hidden ${selectedFormat === 'summary' && index > 1 ? 'hidden' : ''}`}>
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                      <i className={`${section.icon} text-gray-400 text-xs`}></i>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-700">{section.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedFormat === 'detailed' && (
            <div className="border border-gray-50 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                    <i className="ri-lightbulb-line text-gray-400 text-xs"></i>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-700">{t('whitepaper.recommendedActions')}</h4>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs text-gray-500">
                      <span className="text-gray-400">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedFormat === 'detailed' && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h4 className="text-xs font-semibold text-white mb-2">{t('whitepaper.conclusion')}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{report.conclusion}</p>
            </div>
          )}

          <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
            <button onClick={() => { setShowWhitepaper(false); setReport(null); }} className="flex items-center space-x-1.5 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
              <i className="ri-close-line"></i>
              <span>{t('whitepaper.close')}</span>
            </button>
            <div className="flex items-center space-x-2">
              <button onClick={handleSaveReport} className={`flex items-center space-x-1.5 px-3 py-2 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${saveSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                <i className={saveSuccess ? 'ri-check-line' : 'ri-save-line'}></i>
                <span>{saveSuccess ? t('settings.saved') : t('whitepaper.save')}</span>
              </button>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))} className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-file-copy-line"></i>
                <span>{t('whitepaper.copy')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <i className="ri-error-warning-line text-red-500"></i>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!showWhitepaper && !isGenerating && !error && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="ri-file-chart-line text-2xl text-gray-300"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">{t('whitepaper.generatePrompt')}</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">{t('whitepaper.generateDesc')}</p>
        </div>
      )}

      {isGenerating && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">{t('whitepaper.generating')}</h3>
          <p className="text-xs text-gray-400">{t('whitepaper.analyzingData')} {selectedPlatform === 'instagram' ? 'Instagram' : 'TikTok'} {t('whitepaper.data')}</p>
          <div className="mt-4 w-40 mx-auto bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="bg-gray-400 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="ri-information-line text-2xl text-amber-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('whitepaper.externalAITitle')}</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-5">
              <p className="text-sm text-gray-700 leading-relaxed">{t('whitepaper.externalAIDesc')}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-gray-400 mr-2 mt-0.5"></i>
                  <span>{selectedPlatform === 'instagram' ? 'Instagram' : 'TikTok'}{t('whitepaper.dataItem1')}</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-gray-400 mr-2 mt-0.5"></i>
                  <span>{t('whitepaper.dataItem2')}</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mb-5 text-center">{t('whitepaper.dataDisclaimer')}</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                {t('settings.cancel')}
              </button>
              <button onClick={handleConfirmGenerate} className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                {t('whitepaper.okGenerate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
