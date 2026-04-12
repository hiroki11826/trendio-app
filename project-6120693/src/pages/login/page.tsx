import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

type LoginPayload = {
  token?: string;
  user?: Record<string, unknown>;
  error?: string;
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
      });

      const payload = (await response.json().catch(() => ({}))) as LoginPayload;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Login failed.');
      }

      if (!payload?.token) {
        throw new Error('Failed to receive login token.');
      }

      localStorage.setItem('nekocafe_token', payload.token);
      if (payload.user) {
        localStorage.setItem('nekocafe_user', JSON.stringify(payload.user));
      } else {
        localStorage.removeItem('nekocafe_user');
      }

      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="/trendio-logo.png" 
              alt="Trendio" 
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
            <p className="text-sm text-gray-500 mt-2">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="ml-2 text-gray-600">{t('login.rememberMe')}</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                {t('login.forgotPassword')}
              </a>
            </div>

            <div className="text-sm">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                />
                <span className="ml-2 text-gray-600">
                  {t('login.agreeTerms')}
                  <Link to="/terms" className="text-emerald-600 hover:underline">{t('login.termsOfService')}</Link>
                  {t('login.and')}
                  <Link to="/privacy" className="text-emerald-600 hover:underline">{t('login.privacyPolicy')}</Link>
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !agreeTerms}
              className={`w-full text-white py-3 rounded-lg font-medium transition-all shadow-lg whitespace-nowrap ${
                isSubmitting || !agreeTerms
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl'
              }`}
            >
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                {t('login.register')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-700 whitespace-nowrap">{t('common.privacyPolicy')}</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-700 whitespace-nowrap">{t('common.termsOfService')}</Link>
            <span>•</span>
            <a href="mailto:support@trendio.jp" className="hover:text-gray-700 whitespace-nowrap">{t('login.support')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
