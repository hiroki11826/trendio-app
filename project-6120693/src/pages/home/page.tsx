import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Trendio
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 font-medium">
              AI-powered social media analytics platform
            </p>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Trendio helps users analyze TikTok and Instagram performance with comprehensive dashboards, video insights, and AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Visual Examples */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Social Media Success
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to understand and grow your social media presence
            </p>
          </div>

          {/* Feature 1: TikTok Account Integration - WITH VISUAL */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <i className="ri-tiktok-line mr-2"></i>
                  TikTok Integration
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Secure TikTok Account Connection
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect your TikTok account securely via OAuth authentication. Once connected, Trendio retrieves your profile information including username, avatar, bio, follower count, and video statistics. All data access requires your explicit permission through TikTok's official authorization flow.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="ri-check-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">OAuth 2.0 secure authentication</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Access profile data: username, avatar, bio</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Retrieve account statistics: followers, likes, views</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Fetch video list with performance metrics</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-2xl text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">@creative_user</h4>
                      <p className="text-sm text-gray-500">Content Creator</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">72</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">17</div>
                      <div className="text-xs text-gray-500">Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">502</div>
                      <div className="text-xs text-gray-500">Total Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">842</div>
                      <div className="text-xs text-gray-500">Avg Views</div>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    <i className="ri-link mr-2"></i>
                    Connected via OAuth
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Analytics Dashboard - SIMPLIFIED */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-6">TikTok Account Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Followers</div>
                      <div className="text-2xl font-bold text-gray-900">72</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Videos</div>
                      <div className="text-2xl font-bold text-gray-900">17</div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Likes</div>
                      <div className="text-2xl font-bold text-gray-900">502</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Avg Views</div>
                      <div className="text-2xl font-bold text-gray-900">842</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                  <i className="ri-bar-chart-line mr-2"></i>
                  Analytics Dashboard
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comprehensive Performance Metrics
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  View key TikTok metrics at a glance: Followers, Videos, Total Likes, and Average Views per video. The dashboard displays your account statistics retrieved directly from TikTok's API, giving you a clear overview of your content performance and audience engagement.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="ri-check-line text-purple-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Follower count tracking</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-purple-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Total video count and total likes across all videos</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-purple-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Average views per video calculation</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-purple-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Recent video thumbnails with performance metrics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Video Insights - WITH VIDEO GRID */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-4">
                  <i className="ri-video-line mr-2"></i>
                  Video Insights
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Detailed Video Performance Analysis
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  View your recent TikTok videos in a grid layout with thumbnail images. Each video displays key performance metrics including views and likes. Click on any video thumbnail to open it directly on TikTok. The dashboard shows up to 8 of your most recent videos with their cover images and engagement statistics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Grid display of recent video thumbnails</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">View count and like count for each video</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Video titles displayed below thumbnails</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Click to open videos on TikTok</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Videos</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden mb-2" style={{aspectRatio: '9/16'}}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className="ri-play-circle-fill text-4xl text-white opacity-80"></i>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center justify-between text-white text-xs bg-black/50 rounded px-2 py-1">
                              <span className="flex items-center"><i className="ri-eye-line mr-1"></i>{(Math.random() * 100 + 20).toFixed(0)}K</span>
                              <span className="flex items-center"><i className="ri-heart-line mr-1"></i>{(Math.random() * 10 + 2).toFixed(1)}K</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">Video title example #{i}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: AI Insights - WITH REPORT PREVIEW */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <i className="ri-lightbulb-line text-xl text-white"></i>
                      </div>
                      <h4 className="font-semibold text-gray-900">AI-Generated Insights</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Peak Engagement Time</p>
                        <p className="text-xs text-blue-700">Your audience is most active on weekends between 6-9 PM. Consider posting during these hours for maximum reach.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <p className="text-sm font-medium text-purple-900 mb-1">Content Performance</p>
                        <p className="text-xs text-purple-700">Tutorial-style videos receive 3x more engagement than other content types. Focus on educational content.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
                        <p className="text-sm font-medium text-pink-900 mb-1">Growth Opportunity</p>
                        <p className="text-xs text-pink-700">Increase posting frequency to 4-5 times per week to maintain momentum and algorithm favorability.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
                  <i className="ri-sparkling-line mr-2"></i>
                  AI Insights
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  AI-Powered Recommendations
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AI generates personalized reports based on your analytics data. Get actionable recommendations to improve content strategy, boost engagement, and grow your audience. The AI analyzes patterns in your best-performing content and suggests optimal posting times, content types, and engagement strategies.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="ri-check-line text-yellow-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Personalized content strategy recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-yellow-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Optimal posting time suggestions based on audience behavior</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-yellow-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Content type analysis and performance predictions</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-yellow-600 text-xl mr-3 mt-0.5"></i>
                    <span className="text-gray-700">Engagement optimization strategies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Audience Demographics - WITH PIE CHART */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Audience Demographics Analysis</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={audienceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {audienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Age Distribution Insights</h4>
                  {audienceData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }}></div>
                        <span className="text-gray-700 font-medium">{item.name} years</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{item.value}%</span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
                    Understanding your audience demographics helps tailor content to your primary viewer segments and optimize engagement strategies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Trendio Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes with our simple, secure process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Create Account
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Sign up with your email address. No credit card required to start.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-mail-line mr-2 text-blue-600"></i>
                    <span>Email registration</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-shield-check-line mr-2 text-blue-600"></i>
                    <span>Secure authentication</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-time-line mr-2 text-blue-600"></i>
                    <span>Takes less than 1 minute</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Connect TikTok
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Securely link your TikTok account via official OAuth authentication.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-lock-line mr-2 text-blue-600"></i>
                    <span>OAuth 2.0 security</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-checkbox-circle-line mr-2 text-blue-600"></i>
                    <span>Review permissions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-refresh-line mr-2 text-blue-600"></i>
                    <span>Revoke anytime</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Analyze & Grow
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Access your dashboard with insights, analytics, and AI recommendations.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-line-chart-line mr-2 text-blue-600"></i>
                    <span>Real-time analytics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-lightbulb-line mr-2 text-blue-600"></i>
                    <span>AI-powered insights</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-rocket-line mr-2 text-blue-600"></i>
                    <span>Actionable recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete User Journey</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">User Registration & Login</h4>
                  <p className="text-gray-600 text-sm">
                    Create an account or log in to access the Trendio platform. Your credentials are securely stored and encrypted.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Navigate to Settings & Connect TikTok</h4>
                  <p className="text-gray-600 text-sm">
                    Click the "Connect TikTok" button in your settings page to initiate the secure OAuth authentication flow.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Grant Permissions on TikTok</h4>
                  <p className="text-gray-600 text-sm">
                    Review and approve the requested permissions on TikTok's official authorization page. Trendio requests access to: basic profile info, account statistics, and video list. Only authorized data will be accessed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Retrieval & Dashboard Display</h4>
                  <p className="text-gray-600 text-sm">
                    Your profile information (username, avatar, bio), statistics (followers, likes, views), and video list are securely retrieved via TikTok's API and displayed in your personalized dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Analyze Performance Metrics</h4>
                  <p className="text-gray-600 text-sm">
                    Explore interactive charts showing engagement trends, follower growth, video performance, and audience demographics. Filter by date range and content type.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Generate AI Insights & Recommendations</h4>
                  <p className="text-gray-600 text-sm">
                    Click "Generate AI Report" to receive personalized recommendations based on your analytics data. The AI analyzes your content patterns, audience behavior, and engagement trends to provide actionable strategies for growth.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  7
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Implement Strategies & Track Results</h4>
                  <p className="text-gray-600 text-sm">
                    Apply the AI-recommended strategies to your content creation and posting schedule. Return to your dashboard regularly to track improvements and adjust your approach based on new insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data & Privacy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Data & Privacy
            </h2>
            <p className="text-lg text-gray-600">
              Your data security is our top priority
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">
                  <strong>Only user-authorized data is accessed.</strong> We only retrieve data that you explicitly grant permission for during the OAuth process.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">
                  <strong>No data is accessed without consent.</strong> You have full control over what data Trendio can access.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">
                  <strong>Data is used only for analytics and reporting.</strong> Your data is used exclusively to provide you with insights and recommendations.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">
                  <strong>No data is sold to third parties.</strong> We never sell your data. Your information remains private and secure.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-200">
              <p className="text-sm text-gray-600 text-center">
                You can disconnect your account and delete your data at any time from the Settings page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Trendio</h3>
              <p className="text-gray-400">
                AI-powered social media analytics platform for TikTok and Instagram.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/data-deletion-info" className="text-gray-400 hover:text-white transition-colors">
                    Data Deletion
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Trendio. All rights reserved.</p>
            <p className="mt-2">
              Contact: <a href="mailto:support@trendio.jp" className="hover:text-white transition-colors">support@trendio.jp</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}