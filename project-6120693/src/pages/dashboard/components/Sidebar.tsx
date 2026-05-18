import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('nekocafe_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyName(data.user?.companyName || null);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();
  }, [location.pathname]);

  const menuItems = [
    { path: '/dashboard', icon: 'ri-dashboard-line', labelKey: 'sidebar.dashboard' },
    { path: '/comments', icon: 'ri-chat-3-line', labelKey: 'sidebar.comments' },
    { path: '/trends', icon: 'ri-fire-line', labelKey: 'sidebar.trends' },
    { path: '/ai-content', icon: 'ri-magic-line', labelKey: 'sidebar.aiContent' },
    { path: '/settings', icon: 'ri-settings-3-line', labelKey: 'sidebar.settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('nekocafe_token');
    localStorage.removeItem('nekocafe_user');
    navigate('/login');
  };

  return (
    <div className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img 
            src="/trendio-logo.png" 
            alt="Trendio" 
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Trendio</span>
            {companyName && (
              <span className="text-lg font-semibold text-gray-700 truncate max-w-[140px]">{companyName}</span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
              location.pathname === item.path
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className={`${item.icon} text-base w-5 h-5 flex items-center justify-center`}></i>
            <span className="font-medium text-[13px]">{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap"
        >
          <i className="ri-logout-box-line text-base w-5 h-5 flex items-center justify-center"></i>
          <span className="font-medium text-[13px]">{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
}
