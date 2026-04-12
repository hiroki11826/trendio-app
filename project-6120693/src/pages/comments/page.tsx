import { useTranslation } from 'react-i18next';
import Sidebar from '../dashboard/components/Sidebar';

export default function Comments() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('comments.title')}</h1>
            <p className="text-gray-500 mt-2">{t('comments.subtitle')}</p>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <i className="ri-chat-3-line text-4xl text-emerald-500"></i>
              </div>
              
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
                <i className="ri-time-line mr-1.5"></i>
                {t('comments.comingSoon')}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('comments.comingSoonTitle')}
              </h2>
              
              <p className="text-gray-500 leading-relaxed mb-8">
                {t('comments.comingSoonDesc')}
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('comments.plannedFeatures')}</h3>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>{t('comments.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>{t('comments.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>{t('comments.feature3')}</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>{t('comments.feature4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
