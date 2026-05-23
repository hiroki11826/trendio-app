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
