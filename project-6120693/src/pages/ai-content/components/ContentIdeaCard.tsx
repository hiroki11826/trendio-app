interface ContentIdeaCardProps {
  idea: any;
  onGenerateScript: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  isGenerating?: boolean;
  isSaved?: boolean;
  hasScript?: boolean;
}

export default function ContentIdeaCard({ idea, onGenerateScript, onSave, onDelete, isGenerating = false, isSaved = false, hasScript = false }: ContentIdeaCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{idea.title}</h3>
        {isSaved && onDelete && (
          <button
            onClick={onDelete}
            className="ml-2 text-red-500 hover:text-red-700"
            title="削除"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">{idea.concept}</p>
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
          {idea.format}
        </span>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <div className="flex items-start space-x-2">
          <i className="ri-flashlight-line text-pink-600 mt-0.5"></i>
          <div>
            <p className="text-xs font-semibold text-pink-900 mb-1">フック（最初の3秒）</p>
            <p className="text-sm text-pink-800">{idea.hook}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">投稿構成</p>
        <ol className="space-y-1">
          {idea.structure?.map((item: string, index: number) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-emerald-600 font-medium mr-2">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-1">キャプション例</p>
        <p className="text-sm text-gray-600 line-clamp-3">{idea.caption}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-1">ハッシュタグ</p>
        <p className="text-xs text-blue-600">{idea.hashtags}</p>
      </div>

      <button
        onClick={onGenerateScript}
        disabled={isGenerating}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-2"
      >
        {isGenerating ? (
          <>
            <i className="ri-loader-4-line animate-spin mr-2"></i>
            台本生成中...
          </>
        ) : hasScript ? (
          <>
            <i className="ri-file-text-line mr-2"></i>
            保存済み台本を表示
          </>
        ) : (
          <>
            <i className="ri-file-text-line mr-2"></i>
            詳細な台本を生成
          </>
        )}
      </button>
      
      {!isSaved && onSave ? (
        <button
          onClick={onSave}
          className="w-full py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-all flex items-center justify-center"
        >
          <i className="ri-save-line mr-2"></i>
          保存する
        </button>
      ) : isSaved ? (
        <div className="w-full py-2 bg-emerald-50 border-2 border-emerald-600 text-emerald-700 rounded-lg font-medium flex items-center justify-center">
          <i className="ri-check-line mr-2"></i>
          保存済み
        </div>
      ) : null}
    </div>
  );
}
