import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/u, '');

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('お名前を入力してください。');
      return;
    }

    if (!email.trim()) {
      setError('メールアドレスを入力してください。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上必要です。');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (!agree) {
      setError('利用規約に同意してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' && payload.error.length
            ? payload.error
            : '登録に失敗しました。もう一度お試しください。',
        );
      }

      if (!payload?.token || typeof payload.token !== 'string') {
        throw new Error('セッションを確立できませんでした。');
      }

      localStorage.setItem('nekocafe_token', payload.token);
      if (payload.user) {
        localStorage.setItem('nekocafe_user', JSON.stringify(payload.user));
      } else {
        localStorage.removeItem('nekocafe_user');
      }

      navigate('/dashboard');
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : '登録中にエラーが発生しました。',
      );
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
              alt="Neko Cafe Logo"
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">新規ユーザー登録</h1>
            <p className="text-sm text-gray-500 mt-2">
              ログイン画面と同じカード構成で、最小の入力ステップから始められます。
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                お名前
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="田中 太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="you@example.com"
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
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="8文字以上のパスワードを設定"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード（再入力）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="もう一度入力してください"
              />
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <label className="flex items-center cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="ml-2">利用規約に同意する</span>
              </label>
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
              {isSubmitting ? '登録中…' : 'アカウントを作成'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                ログインへ戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
