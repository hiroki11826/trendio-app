
import { instagramDetailData } from '../../../mocks/analytics';
import FollowerTrendChart from './instagram/FollowerTrendChart';
import SummaryMetrics from './instagram/SummaryMetrics';
import ActionTrendChart from './instagram/ActionTrendChart';
import GenderBarChart from './instagram/GenderBarChart';
import GenderPieChart from './instagram/GenderPieChart';
import RegionBarChart from './instagram/RegionBarChart';
import PostingHoursChart from './instagram/PostingHoursChart';

export default function InstagramDetail() {
  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-400">
          <i className="ri-instagram-line text-lg text-white"></i>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">Instagram</h2>
          <p className="text-xs text-gray-400">フォロワー・エンゲージメント・オーディエンス</p>
        </div>
      </div>

      {/* サマリー指標 */}
      <SummaryMetrics data={instagramDetailData.summary} />

      {/* フォロワー推移グラフ */}
      <div className="mt-5">
        <FollowerTrendChart data={instagramDetailData.followerTrend} />
      </div>

      {/* アクション推移グラフ */}
      <div className="mt-5">
        <ActionTrendChart 
          data={instagramDetailData.actionTrend} 
          summary={instagramDetailData.actionSummary} 
        />
      </div>

      {/* フォロワー層分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <GenderBarChart data={instagramDetailData.genderByPeriod} />
        <GenderPieChart data={instagramDetailData.genderRatio} />
      </div>

      {/* 地域 & 投稿時間 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <RegionBarChart data={instagramDetailData.regions} />
        <PostingHoursChart data={instagramDetailData.postingHours} />
      </div>
    </div>
  );
}
