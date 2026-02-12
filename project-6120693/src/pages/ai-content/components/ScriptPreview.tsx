interface ScriptPreviewProps {
  idea: any;
  onClose: () => void;
}

export default function ScriptPreview({ idea, onClose }: ScriptPreviewProps) {
  const script = {
    hook: "🎬 Ever wondered what it's really like to work here? Let me show you!",
    body: [
      "Start your day with our team standup - everyone's voice matters here",
      "Dive into exciting projects that actually make a difference",
      "Lunch with the team - we're not just colleagues, we're friends",
      "Afternoon collaboration sessions where creativity flows",
      "End the day knowing you've contributed to something meaningful"
    ],
    cta: "Ready to join our team? Link in bio to apply! 🚀",
    hashtags: "#DayInTheLife #CompanyCulture #JoinOurTeam #CareerGoals #WorkLife",
    duration: "30-45 seconds",
    tips: [
      "Use upbeat background music to maintain energy",
      "Show genuine moments - authenticity is key",
      "Include diverse team members and perspectives",
      "Keep transitions quick and dynamic",
      "End with a clear call-to-action"
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <i className="ri-file-text-line text-xl text-white"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{idea.title}</h2>
              <p className="text-sm text-gray-600">AI-Generated Script</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <i className="ri-lightbulb-line text-blue-600 text-lg mt-0.5"></i>
              <div>
                <p className="text-sm font-medium text-blue-900">Script Overview</p>
                <p className="text-xs text-blue-700 mt-1">
                  Recommended duration: {script.duration} • Platform: {idea.platform === 'instagram' ? 'Instagram Reels' : 'TikTok'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-flashlight-line text-orange-600 mr-2"></i>
                Hook (First 3 seconds)
              </h3>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-900">{script.hook}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-list-check text-blue-600 mr-2"></i>
                Main Content
              </h3>
              <div className="space-y-3">
                {script.body.map((line, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-900">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-megaphone-line text-green-600 mr-2"></i>
                Call-to-Action
              </h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-900">{script.cta}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-hashtag text-purple-600 mr-2"></i>
                Hashtags
              </h3>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-900">{script.hashtags}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-lightbulb-flash-line text-yellow-600 mr-2"></i>
                Production Tips
              </h3>
              <div className="space-y-2">
                {script.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <i className="ri-check-line text-yellow-600 mt-0.5"></i>
                    <p className="text-sm text-gray-900">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-file-copy-line mr-2"></i>
            Copy Script
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md cursor-pointer whitespace-nowrap">
            <i className="ri-download-line mr-2"></i>
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
