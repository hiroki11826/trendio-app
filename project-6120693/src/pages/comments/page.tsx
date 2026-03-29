import Sidebar from '../dashboard/components/Sidebar';

export default function Comments() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">コメント管理</h1>
            <p className="text-gray-500 mt-2">InstagramとTikTokのコメントを監視・管理</p>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <i className="ri-chat-3-line text-4xl text-emerald-500"></i>
              </div>
              
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
                <i className="ri-time-line mr-1.5"></i>
                Coming Soon
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                コメント管理機能は準備中です
              </h2>
              
              <p className="text-gray-500 leading-relaxed mb-8">
                InstagramとTikTokのコメントを一元管理し、効率的に返信・DM送信ができる機能を開発中です。もうしばらくお待ちください。
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">実装予定の機能</h3>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>コメントの一覧表示・フィルタリング</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>未対応コメントの管理</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>DM一括送信機能</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-checkbox-circle-line text-emerald-500 mr-2 mt-0.5"></i>
                    <span>AIによる返信文提案</span>
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
