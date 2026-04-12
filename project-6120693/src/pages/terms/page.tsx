import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  useEffect(() => {
    document.title = '利用規約 | Trendio';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Trendioの利用規約です。サービスのご利用条件について定めています。');
    }
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-[850px] mx-auto px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            利用規約
          </h1>
          <p className="text-sm text-gray-500">最終更新日: 2026年3月19日</p>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed mb-3">
            本利用規約（以下、「本規約」といいます。）は、Trendio（以下、「当サービス」といいます。）の利用条件を定めるものです。
          </p>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、本規約に同意した上で当サービスを利用するものとします。
          </p>
        </section>

        {/* Article 1 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第1条（適用）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約は、ユーザーと当サービスの間の利用に関わる一切の関係に適用されます。
          </p>
        </section>

        {/* Article 2 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第2条（利用登録および同意）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            ユーザーは、本規約およびプライバシーポリシーに同意の上、当サービスを利用するものとします。
          </p>
          <p className="text-gray-700 leading-relaxed">
            ユーザーが外部サービス（Instagram、TikTok等）との連携を行う場合、当該サービスの利用規約およびポリシーにも同意しているものとみなします。
          </p>
        </section>

        {/* Article 3 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第3条（サービス内容）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            当サービスは、以下の機能を提供します。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 mb-3">
            <li>SNSアカウントの分析</li>
            <li>インサイトデータの可視化</li>
            <li>コンテンツ改善提案</li>
            <li>AIを活用した分析および提案機能</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-3">
            当サービスは、ユーザーが連携したSNSアカウントのデータを取得し、分析および機能提供に利用します。
          </p>
          <p className="text-gray-700 leading-relaxed">
            サービス内容は予告なく変更されることがあります。
          </p>
        </section>

        {/* Article 4 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第4条（外部サービス連携）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            当サービスは、以下の外部サービスと連携する場合があります。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 mb-3">
            <li>Instagram（Meta Platforms, Inc.）</li>
            <li>TikTok（ByteDance Ltd.）</li>
            <li>その他SNSサービス</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            ユーザーが外部サービス連携を行う場合、当サービスはユーザーの明示的な許可に基づき、必要な範囲でデータを取得します。
          </p>
        </section>

        {/* Article 5 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第5条（AIの利用）</h2>
          <p className="text-gray-700 leading-relaxed">
            当サービスは、分析機能の一部において外部AIサービスを利用する場合があります。この場合、ユーザーのデータは分析および提案生成の目的で、必要最小限の範囲で外部サービスに送信されることがあります。
          </p>
        </section>

        {/* Article 6 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第6条（禁止事項）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            ユーザーは以下の行為をしてはなりません。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>不正アクセスまたはその試み</li>
            <li>他ユーザーまたは第三者に不利益を与える行為</li>
            <li>サービス運営を妨害する行為</li>
          </ul>
        </section>

        {/* Article 7 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第7条（免責事項）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            当サービスは、提供する情報の正確性、完全性、有用性を保証するものではありません。
          </p>
          <p className="text-gray-700 leading-relaxed">
            当サービスの利用により生じた損害について、一切の責任を負いません。
          </p>
        </section>

        {/* Article 8 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第8条（サービスの変更・停止）</h2>
          <p className="text-gray-700 leading-relaxed">
            当サービスは、予告なくサービス内容の変更または提供の停止を行う場合があります。
          </p>
        </section>

        {/* Article 9 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第9条（データの削除）</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            ユーザーは、当サービス上でSNS連携の解除を行うことにより、関連するデータの削除を実行することができます。
          </p>
          <p className="text-gray-700 leading-relaxed">
            また、ユーザーは所定の方法により、保有する個人データの削除をリクエストすることができます。
          </p>
        </section>

        {/* Article 10 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第10条（プライバシー）</h2>
          <p className="text-gray-700 leading-relaxed">
            個人情報の取り扱いについては、別途定める
            <Link to="/privacy" className="text-blue-600 hover:underline mx-1">
              プライバシーポリシー
            </Link>
            に従います。
          </p>
        </section>

        {/* Article 11 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第11条（規約の変更）</h2>
          <p className="text-gray-700 leading-relaxed">
            当サービスは、必要に応じて本規約を変更することがあります。
          </p>
        </section>

        {/* Article 12 */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第12条（お問い合わせ）</h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
          <p className="mt-2">
            <a 
              href="mailto:support@trendio.jp" 
              className="text-blue-600 hover:underline"
            >
              support@trendio.jp
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            <Link to="/data-deletion-info" className="text-blue-600 hover:underline">
              データ削除について
            </Link>
            <Link to="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2026 Trendio. All rights reserved.
          </p>
        </footer>
      </article>
    </main>
  );
}
