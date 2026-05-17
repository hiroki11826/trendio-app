import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
}

type Step = 'intro' | 'connecting' | 'select-page' | 'select-instagram' | 'complete';

export default function InstagramConnect() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Listen for OAuth callback message
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'META_CONNECTION') {
        if (event.data.status === 'success') {
          // OAuth completed with page and Instagram selection done by Meta
          // Go directly to complete screen
          setStep('complete');
        } else {
          setError(event.data.message || t('instagram.connectionFailed'));
          setStep('intro');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [t]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('nekocafe_token');
      
      const response = await fetch(`${API_BASE_URL}/api/instagram/pages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      setPages(data.pages || []);
      setAccessToken(data.accessToken);
      
      if (data.pages.length === 0) {
        setError(t('instagram.noPagesFound'));
      }
    } catch (err) {
      setError(t('instagram.fetchPagesFailed'));
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConnection = () => {
    setStep('connecting');
    const token = localStorage.getItem('nekocafe_token');
    const locale = i18n.language === 'ja' ? 'ja_JP' : 'en_US';
    
    // Open OAuth in popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const authUrl = `${API_BASE_URL}/api/auth/meta/login?token=${token}&locale=${locale}`;
    
    window.open(
      authUrl,
      'meta-oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleSelectPage = async (page: FacebookPage) => {
    setSelectedPage(page);
    
    if (page.instagram_business_account) {
      // Page already has Instagram account
      setStep('select-instagram');
    } else {
      setError(t('instagram.noInstagramAccount'));
    }
  };

  const handleConfirmInstagram = async () => {
    if (!selectedPage || !selectedPage.instagram_business_account) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('nekocafe_token');

      const response = await fetch(`${API_BASE_URL}/api/instagram/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: selectedPage.id,
          pageAccessToken: selectedPage.access_token,
          igUserId: selectedPage.instagram_business_account.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect Instagram');
      }

      setStep('complete');
    } catch (err) {
      setError(t('instagram.connectionFailed'));
      console.error('Error connecting Instagram:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToComments = () => {
    navigate('/comments');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Intro Step */}
        {step === 'intro' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                <i className="ri-instagram-line text-white text-4xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('instagram.connectTitle')}
              </h1>
              <p className="text-gray-600">
                {t('instagram.connectSubtitle')}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('instagram.step1Title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('instagram.step1Description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('instagram.step2Title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('instagram.step2Description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('instagram.step3Title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('instagram.step3Description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-amber-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">{t('instagram.requirementsTitle')}</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>{t('instagram.requirement1')}</li>
                    <li>{t('instagram.requirement2')}</li>
                    <li>{t('instagram.requirement3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            <button
              onClick={handleStartConnection}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <i className="ri-facebook-box-fill text-2xl"></i>
              {t('instagram.connectWithFacebook')}
            </button>
          </div>
        )}

        {/* Connecting Step */}
        {step === 'connecting' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <i className="ri-loader-4-line animate-spin text-blue-600 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('instagram.connecting')}
            </h2>
            <p className="text-gray-600">
              {t('instagram.connectingDescription')}
            </p>
          </div>
        )}

        {/* Select Page Step */}
        {step === 'select-page' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <i className="ri-pages-line text-blue-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('instagram.selectPageTitle')}
              </h2>
              <p className="text-gray-600">
                {t('instagram.selectPageDescription')}
              </p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <i className="ri-loader-4-line animate-spin text-4xl text-gray-400"></i>
                <p className="text-gray-500 mt-4">{t('dashboard.loading')}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            {!loading && pages.length > 0 && (
              <div className="space-y-3">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <i className="ri-facebook-box-fill text-blue-600 text-2xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{page.name}</h3>
                          <p className="text-sm text-gray-500">{page.category || 'Facebook Page'}</p>
                          {page.instagram_business_account && (
                            <div className="flex items-center gap-1 mt-1">
                              <i className="ri-instagram-line text-pink-500 text-sm"></i>
                              <span className="text-xs text-pink-600 font-medium">
                                {t('instagram.instagramConnected')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <i className="ri-arrow-right-line text-gray-400 text-xl group-hover:text-blue-600 transition-colors"></i>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Select Instagram Account Step */}
        {step === 'select-instagram' && selectedPage && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                <i className="ri-instagram-line text-white text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('instagram.confirmInstagramTitle')}
              </h2>
              <p className="text-gray-600">
                {t('instagram.confirmInstagramDescription')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                  <i className="ri-facebook-box-fill text-blue-600 text-3xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPage.name}</h3>
                  <p className="text-sm text-gray-600">{t('instagram.facebookPage')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <i className="ri-arrow-down-line text-gray-400"></i>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              {selectedPage.instagram_business_account && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <i className="ri-instagram-line text-white text-3xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      @{selectedPage.instagram_business_account.username || 'Instagram Business Account'}
                    </h3>
                    <p className="text-sm text-gray-600">{t('instagram.instagramBusinessAccount')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="ri-shield-check-line text-blue-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">{t('instagram.permissionsGrantedTitle')}</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>{t('instagram.permission1')}</li>
                    <li>{t('instagram.permission2')}</li>
                    <li>{t('instagram.permission3')}</li>
                    <li>{t('instagram.permission4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select-page')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleConfirmInstagram}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    {t('instagram.connecting')}
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    {t('instagram.confirmConnection')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <i className="ri-checkbox-circle-fill text-green-600 text-5xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('instagram.connectionCompleteTitle')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('instagram.connectionCompleteDescription')}
            </p>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">{t('instagram.whatYouCanDoTitle')}</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <i className="ri-bar-chart-line text-emerald-600 text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-gray-900">{t('instagram.feature1Title')}</p>
                    <p className="text-sm text-gray-600">{t('instagram.feature1Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-chat-3-line text-emerald-600 text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-gray-900">{t('instagram.feature2Title')}</p>
                    <p className="text-sm text-gray-600">{t('instagram.feature2Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-emerald-600 text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-gray-900">{t('instagram.feature3Title')}</p>
                    <p className="text-sm text-gray-600">{t('instagram.feature3Description')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <i className="ri-dashboard-line"></i>
                {t('instagram.goToDashboard')}
              </button>
              <button
                onClick={handleGoToComments}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <i className="ri-chat-3-line"></i>
                {t('instagram.goToComments')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
