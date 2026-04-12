import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ScriptPreviewProps {
  script: any;
  onClose: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function ScriptPreview({ script, onClose, onSave, isSaved = false }: ScriptPreviewProps) {
  const { t } = useTranslation();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullScript = () => {
    const fullText = `
【${script.videoTitle}】

【${t('script.objective')}】
${script.objective}

【${t('script.videoStructure')}】
${script.timeline?.map((item: any) => `${item.time}: ${item.content}`).join('\n')}

【${t('script.fullScript')}】
${script.fullScript}

【${t('script.shootingInstructions')}】
${script.shootingInstructions?.map((item: any) => `${item.scene}: ${item.instruction}`).join('\n')}

【${t('script.telopSuggestions')}】
${script.telops?.join('\n')}

【${t('script.captionSuggestion')}】
${script.captionText}

【${t('aiContent.hashtags')}】
${script.hashtags}

【${t('script.thumbnailIdea')}】
${script.thumbnailIdea}

【${t('script.estimatedDuration')}】
${script.estimatedDuration}

【${t('script.whyItWorks')}】
${script.whyItWorks}
    `.trim();
    copyToClipboard(fullText, 'full');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <i className="ri-file-text-line text-xl text-white"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{script.videoTitle || script.title}</h2>
              <p className="text-sm text-gray-600">{t('script.detailedScript')}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-target-line text-emerald-600 mr-2"></i>
                  {t('script.objective')}
                </h3>
                <button onClick={() => copyToClipboard(script.objective, 'objective')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                  <i className={`${copiedSection === 'objective' ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} mr-1`}></i>
                  {copiedSection === 'objective' ? t('script.copied') : t('script.copy')}
                </button>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-900">{script.objective}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-time-line text-blue-600 mr-2"></i>
                  {t('script.videoStructure')}
                </h3>
                <span className="text-xs text-gray-500">{t('script.estimatedDuration')}: {script.estimatedDuration}</span>
              </div>
              <div className="space-y-2">
                {script.timeline?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="flex-shrink-0 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">{item.time}</span>
                    <p className="text-sm text-gray-900 flex-1">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-chat-quote-line text-purple-600 mr-2"></i>
                  {t('script.fullScript')}
                </h3>
                <button onClick={() => copyToClipboard(script.fullScript, 'script')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                  <i className={`${copiedSection === 'script' ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} mr-1`}></i>
                  {copiedSection === 'script' ? t('script.copied') : t('script.copy')}
                </button>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{script.fullScript}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-camera-line text-orange-600 mr-2"></i>
                  {t('script.shootingInstructions')}
                </h3>
              </div>
              <div className="space-y-2">
                {script.shootingInstructions?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="flex-shrink-0 font-semibold text-orange-900 text-sm">{item.scene}:</span>
                    <p className="text-sm text-gray-900">{item.instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-text text-pink-600 mr-2"></i>
                  {t('script.telopSuggestions')}
                </h3>
              </div>
              <div className="space-y-2">
                {script.telops?.map((telop: string, index: number) => (
                  <div key={index} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <p className="text-sm text-gray-900">{telop}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-article-line text-teal-600 mr-2"></i>
                  {t('script.captionSuggestion')}
                </h3>
                <button onClick={() => copyToClipboard(script.captionText, 'caption')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                  <i className={`${copiedSection === 'caption' ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} mr-1`}></i>
                  {copiedSection === 'caption' ? t('script.copied') : t('script.copy')}
                </button>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{script.captionText}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-hashtag text-indigo-600 mr-2"></i>
                  {t('aiContent.hashtags')}
                </h3>
                <button onClick={() => copyToClipboard(script.hashtags, 'hashtags')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                  <i className={`${copiedSection === 'hashtags' ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} mr-1`}></i>
                  {copiedSection === 'hashtags' ? t('script.copied') : t('script.copy')}
                </button>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-900">{script.hashtags}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-image-line text-yellow-600 mr-2"></i>
                  {t('script.thumbnailIdea')}
                </h3>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-900">{script.thumbnailIdea}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <i className="ri-lightbulb-line text-green-600 mr-2"></i>
                  {t('script.whyItWorks')}
                </h3>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-900">{script.whyItWorks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
            {t('script.close')}
          </button>
          {onSave && !isSaved && (
            <button onClick={onSave} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap flex items-center">
              <i className="ri-save-line mr-2"></i>
              {t('script.saveScript')}
            </button>
          )}
          {isSaved && (
            <div className="px-5 py-2.5 bg-emerald-50 border-2 border-emerald-600 text-emerald-700 rounded-lg font-medium flex items-center">
              <i className="ri-check-line mr-2"></i>
              {t('aiContent.alreadySaved')}
            </div>
          )}
          <button onClick={copyFullScript} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center">
            <i className={`${copiedSection === 'full' ? 'ri-check-line' : 'ri-file-copy-line'} mr-2`}></i>
            {copiedSection === 'full' ? t('script.copied') : t('script.copyAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
