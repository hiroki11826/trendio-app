import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DataDeletionInfoPage() {
  useEffect(() => {
    document.title = 'ユーザーデータの削除について | Trendio';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Trendioにおけるユーザーデータの削除対象と削除方法についてご説明します。');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ユーザーデータの削除について
          </h1>
          <p className="text-sm text-gray-500">最終更新日: 2026年3月21日</p>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed">
            Trendio（以下、「当サービス」といいます。）では、ユーザーの皆様がご自身のデータを管理・削除できる機能を提供しています。
            本ページでは、削除対象となるデータの種類と、削除方法についてご説明します。
          </p>
        </section>

        {/* Section 1: Data Types */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            1. 削除対象データ
          </h2>
          <p className="text-gray-700 mb-4">
            アカウント削除を実行すると、以下のすべてのデータが完全に削除されます。
          </p>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-user-line text-blue-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">アカウント情報</h3>
                <p className="text-sm text-gray-600">メールアドレス、氏名、パスワード（暗号化済み）、登録日時、最終ログイン日時</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-instagram-line text-pink-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instagram連携情報</h3>
                <p className="text-sm text-gray-600">アクセストークン、ページID、Instagramビジネスアカウント情報</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-tiktok-line text-white"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">TikTok連携情報</h3>
                <p className="text-sm text-gray-600">アクセストークン、リフレッシュトークン、OpenID、接続情報</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-lightbulb-line text-amber-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">コンテンツアイデア</h3>
                <p className="text-sm text-gray-600">AI生成されたコンテンツアイデア、タイトル、コンセプト、ハッシュタグ等</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-file-text-line text-emerald-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">コンテンツスクリプト</h3>
                <p className="text-sm text-gray-600">AI生成された動画台本、撮影指示、テロップ、サムネイルアイデア等</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How to Delete */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            2. 削除方法
          </h2>
          <p className="text-gray-700 mb-4">
            以下の手順でアカウントとすべてのデータを削除できます。
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                1
              </div>
              <div className="pt-1">
                <p className="text-gray-700">
                  <a href="https://app.trendio.jp/login" className="text-blue-600 hover:underline">Trendio</a>にログインします。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                2
              </div>
              <div className="pt-1">
                <p className="text-gray-700">
                  サイドバーから「アカウント管理」を選択します。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                3
              </div>
              <div className="pt-1">
                <p className="text-gray-700">
                  ページ下部の「アカウント削除」セクションにある「アカウントを削除する」ボタンをクリックします。
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                4
              </div>
              <div className="pt-1">
                <p className="text-gray-700">
                  確認のため「削除する」と入力し、「削除を実行」ボタンをクリックします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Important Notes */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            3. 注意事項
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <i className="ri-alert-line text-red-500 mr-2 mt-0.5"></i>
                <span>この操作は取り消すことができません。</span>
              </li>
              <li className="flex items-start">
                <i className="ri-alert-line text-red-500 mr-2 mt-0.5"></i>
                <span>削除されたデータを復元することはできません。</span>
              </li>
              <li className="flex items-start">
                <i className="ri-alert-line text-red-500 mr-2 mt-0.5"></i>
                <span>SNS連携（Instagram、TikTok）の認証情報も完全に削除されます。</span>
              </li>
              <li className="flex items-start">
                <i className="ri-alert-line text-red-500 mr-2 mt-0.5"></i>
                <span>削除後、同じメールアドレスで再登録することは可能です。</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data Retention */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            4. データの保持期間
          </h2>
          <p className="text-gray-700 leading-relaxed">
            アカウント削除を実行すると、上記のすべてのデータは即座にデータベースから完全に削除されます。
            バックアップデータについても、定期的なバックアップローテーションにより30日以内に完全に削除されます。
          </p>
        </section>

        {/* Section 5: Alternative Methods */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            5. その他の削除方法
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            上記の方法でアカウント削除ができない場合、または特定のデータのみの削除をご希望の場合は、
            以下のお問い合わせ先までご連絡ください。ご本人確認の上、対応いたします。
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">お問い合わせ先:</span>{' '}
              <a href="mailto:support@trendio.jp" className="text-blue-600 hover:underline">
                support@trendio.jp
              </a>
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <footer className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            <Link to="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2026 Trendio. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
