import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

type LoginPayload = {
  token?: string;
  user?: Record<string, unknown>;
  error?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
      });

      const payload = (await response.json().catch(() => ({}))) as LoginPayload;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'ログインに失敗しました。');
      }

      if (!payload?.token) {
        throw new Error('ログイントークンを受信できませんでした。');
      }

      localStorage.setItem('nekocafe_token', payload.token);
      if (payload.user) {
        localStorage.setItem('nekocafe_user', JSON.stringify(payload.user));
      } else {
        localStorage.removeItem('nekocafe_user');
      }

      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'ログインに失敗しました。');
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
              src="https://public.readdy.ai/ai/img_res/b0f1d07c-3416-427c-9f66-d7c330ac0ee4.png" 
              alt="SNS運用プラットフォーム" 
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">おかえりなさい</h1>
            <p className="text-sm text-gray-500 mt-2">アカウントにログインして続行してください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="パスワードを入力してください"
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
                <span className="ml-2 text-gray-600">ログイン状態を保持</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                パスワードをお忘れですか？
              </a>
            </div>

            {error && (
              <p role="alert" className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white py-3 rounded-lg font-medium transition-all shadow-lg whitespace-nowrap ${
                isSubmitting
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'ログイン中…' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                営業担当にお問い合わせ
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700 whitespace-nowrap">プライバシーポリシー</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 whitespace-nowrap">利用規約</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 whitespace-nowrap">サポート</a>
          </div>
        </div>
      </div>
    </div>
  );
}
