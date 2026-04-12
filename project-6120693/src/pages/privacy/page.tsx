import { useEffect } from 'react';

// i18n対応を見据えた定数定義
const PRIVACY_CONTENT = {
  title: 'プライバシーポリシー',
  lastUpdated: '2026年3月19日',
  serviceName: 'Trendio',
  contactEmail: 'support@trendio.jp',
};

export default function PrivacyPage() {
  // SEO: ページタイトルとmeta descriptionを設定
  useEffect(() => {
    document.title = `${PRIVACY_CONTENT.title} | ${PRIVACY_CONTENT.serviceName}`;
    
    // meta descriptionを設定
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Trendioのプライバシーポリシーです。当サービスにおける個人情報およびSNS連携データの取得、利用、管理等について定めています。'
    );

    return () => {
      document.title = PRIVACY_CONTENT.serviceName;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ヘッダー */}
        <header className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {PRIVACY_CONTENT.title}
          </h1>
          <p className="text-sm text-gray-500">
            最終更新日: {PRIVACY_CONTENT.lastUpdated}
          </p>
        </header>

        {/* 本文 */}
        <article className="prose prose-gray max-w-none">
          {/* 導入文 */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed">
              {PRIVACY_CONTENT.serviceName}（以下、「当サービス」といいます。）は、ユーザーの個人情報および各種SNS連携データの重要性を認識し、適切に保護・管理することに努めます。本ポリシーでは、当サービスにおける情報の取得、利用、管理等について定めます。
            </p>
          </section>

          {/* 1. 取得する情報 */}
          <Section number={1} title="取得する情報">
            <p>当サービスは、以下の情報を取得することがあります。</p>
            <ul>
              <li>氏名、メールアドレス等、ユーザーが登録時に提供する情報</li>
              <li>お問い合わせ時にユーザーが入力する情報</li>
              <li>Instagram、TikTok その他当サービスが連携する外部プラットフォームのアカウント情報</li>
              <li>SNSアカウントの分析に必要な公開情報、またはユーザーの許可に基づき取得する情報</li>
              <li>インサイトデータ、エンゲージメントデータ、投稿データ、プロフィール情報、フォロワー数推移等の分析関連データ</li>
              <li>Cookie、IPアドレス、アクセスログ、端末情報、ブラウザ情報等の利用情報</li>
            </ul>
          </Section>

          {/* 2. 利用目的 */}
          <Section number={2} title="利用目的">
            <p>取得した情報は、以下の目的で利用します。</p>
            <ul>
              <li>当サービスの提供、運営、改善のため</li>
              <li>SNSアカウント分析機能、レポート機能、コンテンツ提案機能等の提供のため</li>
              <li>ユーザー認証、本人確認、ログイン管理のため</li>
              <li>不正利用防止、セキュリティ向上のため</li>
              <li>お問い合わせ対応のため</li>
              <li>利用状況の分析およびサービス改善のため</li>
              <li>新機能、更新情報、重要なお知らせの案内のため</li>
            </ul>
          </Section>

          {/* 3. 外部プラットフォームとの連携 */}
          <Section number={3} title="外部プラットフォームとの連携">
            <p>当サービスは、以下の外部プラットフォームと連携する場合があります。</p>
            <ul>
              <li>Instagram（Meta Platforms, Inc.）</li>
              <li>TikTok（ByteDance Ltd.）</li>
              <li>その他今後追加されるSNSプラットフォーム</li>
            </ul>
            <p>
              ユーザーが外部プラットフォーム連携を行う場合、当サービスは、ユーザーの明示的な許可に基づき、必要な範囲で情報を取得します。当サービスは、ユーザーの許可なく、必要範囲を超えて情報を取得することはありません。
            </p>
            <p>
              また、当サービスは、分析機能の提供のために、外部AIサービスを利用する場合があります。その際、必要最小限のデータのみを送信します。
            </p>
          </Section>

          {/* 4. 第三者提供 */}
          <Section number={4} title="第三者提供">
            <p>当サービスは、次の場合を除き、取得した個人情報を第三者に提供しません。</p>
            <ul>
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づき開示が求められる場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>業務委託先に対し、利用目的達成に必要な範囲で提供する場合</li>
            </ul>
          </Section>

          {/* 5. 情報の管理 */}
          <Section number={5} title="情報の管理">
            <p>
              当サービスは、取得した情報について、不正アクセス、漏えい、滅失、毀損等を防止するため、合理的な安全管理措置を講じます。
            </p>
          </Section>

          {/* 6. Cookie等の利用 */}
          <Section number={6} title="Cookie等の利用">
            <p>
              当サービスは、利便性向上、利用状況分析、品質改善等のためにCookieその他の技術を利用する場合があります。ユーザーはブラウザ設定によりCookieを制限または無効化できる場合がありますが、一部機能が制限される可能性があります。
            </p>
          </Section>

          {/* 7. 保有期間 */}
          <Section number={7} title="保有期間">
            <p>
              当サービスは、取得した情報を、利用目的の達成に必要な期間、または法令で定められた期間保有します。
            </p>
          </Section>

          {/* 8. ユーザーによる削除・連携解除 */}
          <Section number={8} title="ユーザーによる削除・連携解除">
            <p>
              ユーザーは、当サービス上でSNS連携解除を行うことができます。また、保有する個人情報や連携データの削除を希望する場合は、下記お問い合わせ先までご連絡いただくことで、合理的な範囲で対応いたします。
            </p>
          </Section>

          {/* 9. 未成年者の利用 */}
          <Section number={9} title="未成年者の利用">
            <p>
              未成年者が当サービスを利用する場合は、必要に応じて保護者の同意を得たうえで利用するものとします。
            </p>
          </Section>

          {/* 10. ポリシーの変更 */}
          <Section number={10} title="ポリシーの変更">
            <p>
              当サービスは、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、当サービス上または適切な方法で通知します。
            </p>
          </Section>

          {/* 11. お問い合わせ先 */}
          <Section number={11} title="お問い合わせ先">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="font-medium text-gray-900 mb-2">
                {PRIVACY_CONTENT.serviceName} お問い合わせ窓口
              </p>
              <p className="text-gray-700">
                メールアドレス:{' '}
                <a
                  href={`mailto:${PRIVACY_CONTENT.contactEmail}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {PRIVACY_CONTENT.contactEmail}
                </a>
              </p>
            </div>
          </Section>
        </article>

        {/* フッター */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} {PRIVACY_CONTENT.serviceName}. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

// セクションコンポーネント
function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
        {number}. {title}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:text-gray-700">
        {children}
      </div>
    </section>
  );
}
