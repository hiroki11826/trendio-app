import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import InstagramDetail from './components/InstagramDetail';
import TikTokDetail from './components/TikTokDetail';
import WhitepaperSection from './components/WhitepaperSection';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">{t('dashboard.title')}</h1>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.lastUpdated')}: {t('dashboard.today')} 9:00 AM</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-calendar-line text-gray-400"></i>
                  <span>{t('dashboard.last30days')}</span>
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                <button className="flex items-center space-x-2 px-3.5 py-2 bg-gray-900 rounded-lg text-xs font-medium text-white hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line text-sm"></i>
                  <span>{t('dashboard.export')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instagram Detail */}
          <InstagramDetail />

          {/* TikTok Detail */}
          <TikTokDetail />

          {/* Whitepaper */}
          <div className="mt-10">
            <WhitepaperSection />
          </div>
        </div>
      </div>
    </div>
  );
}
