import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Trendio</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/register" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Trendio</h1>
          <p className="text-xl text-emerald-600 font-medium mb-6">AI-powered social media analytics platform</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trendio helps creators, marketers, and businesses understand their social media performance 
            and improve their content strategy with AI-driven insights.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Social Media Analytics</h3>
              <p className="text-gray-600">
                Track followers, engagement rates, and audience demographics across Instagram and TikTok in one unified dashboard.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Recommendations</h3>
              <p className="text-gray-600">
                Get intelligent content suggestions and optimization tips powered by advanced AI analysis of your performance data.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Integration</h3>
              <p className="text-gray-600">
                Seamlessly connect your Instagram and TikTok accounts to automatically sync and analyze your social media data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '📊', title: 'Dashboard Analytics', desc: 'Comprehensive overview of all your social metrics' },
              { icon: '👥', title: 'Audience Insights', desc: 'Understand your followers demographics and behavior' },
              { icon: '📈', title: 'Content Performance Tracking', desc: 'Monitor how your posts perform over time' },
              { icon: '🤖', title: 'AI-Generated Reports', desc: 'Automated insights and recommendations' },
              { icon: '🔗', title: 'Social Account Integration', desc: 'Connect Instagram and TikTok accounts' },
              { icon: '📱', title: 'Mobile Responsive', desc: 'Access your analytics from any device' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-xl">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account' },
              { step: '2', title: 'Connect', desc: 'Link your social accounts' },
              { step: '3', title: 'Analyze', desc: 'Data is processed automatically' },
              { step: '4', title: 'Insights', desc: 'View actionable analytics' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute transform translate-x-24">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Data & Privacy</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">User-Authorized Data Only</h3>
                  <p className="text-gray-600">We only access data that you explicitly authorize through official platform APIs (Instagram, TikTok).</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">We Do Not Sell Your Data</h3>
                  <p className="text-gray-600">Your personal information and social media data are never sold to third parties.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Service Functionality Only</h3>
                  <p className="text-gray-600">Data is used solely to provide analytics and insights within the Trendio platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company / Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Company</h2>
          <div className="bg-gray-50 rounded-xl p-8 inline-block">
            <p className="text-lg font-semibold text-gray-900 mb-2">株式会社宝樹</p>
            <p className="text-gray-600 mb-4">Houju Inc.</p>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:support@trendio.jp" className="text-emerald-600 hover:underline">support@trendio.jp</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">Trendio</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/data-deletion" className="text-gray-300 hover:text-white transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} 株式会社宝樹 (Houju Inc.). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
