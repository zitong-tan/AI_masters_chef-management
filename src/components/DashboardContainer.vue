<template>
  <div class="dashboard-container">
    <!-- 仪表板头部 -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">🍳 AI美食大师管理系统</h1>
        <p class="dashboard-subtitle">数据可视化管理平台</p>
      </div>
      <div class="header-actions">
        <button 
          @click="refreshAllData" 
          class="refresh-button"
          :disabled="loading"
          :title="loading ? '加载中...' : '刷新数据'"
        >
          <span class="refresh-icon" :class="{ 'refresh-icon--spinning': loading }">🔄</span>
          <span class="refresh-text">刷新</span>
        </button>
        <DataExportButton />
      </div>
    </header>

    <!-- 全局加载状态 -->
    <LoadingSpinner 
      v-if="loading && !hasData" 
      message="正在加载仪表板数据..." 
      size="large"
    />

    <!-- 全局错误状态 -->
    <ErrorMessage
      v-else-if="error && !hasData"
      :message="error"
      title="数据加载失败"
      :retryable="true"
      @retry="refreshAllData"
    />

    <!-- 仪表板内容 -->
    <div v-else class="dashboard-content">
      <!-- 统计卡片区域 -->
      <section class="dashboard-section">
        <StatisticsCards :stats="statistics" />
      </section>

      <!-- 图表网格布局 -->
      <div class="dashboard-grid">
        <!-- 菜系分布图表 -->
        <section class="dashboard-section dashboard-section--chart">
          <CuisineDistributionChart :cuisineData="cuisineDistribution" />
        </section>

        <!-- 菜谱趋势图表 -->
        <section class="dashboard-section dashboard-section--chart">
          <DishTrendChart 
            :trendData="dishTrend" 
            :timeRange="dishTrendTimeRange"
            @time-range-change="handleDishTrendRangeChange"
          />
        </section>

        <!-- 用户排行榜 -->
        <section class="dashboard-section dashboard-section--list">
          <UserRankingList 
            ref="userRanking"
            :limit="10"
            :autoLoad="false"
          />
        </section>

        <!-- 食材过期预警 -->
        <section class="dashboard-section dashboard-section--list">
          <FoodExpirationAlert 
            :foods="expiringFoods"
            :loading="false"
            :error="null"
            @retry="loadExpiringFoods"
          />
        </section>

        <!-- 评论时间分布图表 -->
        <section class="dashboard-section dashboard-section--chart">
          <CommentTimelineChart 
            :commentData="commentTimeline"
            :timeRange="commentTimelineRange"
            @time-range-change="handleCommentTimelineRangeChange"
          />
        </section>

        <!-- 最新评论列表 -->
        <section class="dashboard-section dashboard-section--list">
          <RecentCommentsList 
            ref="recentComments"
            :limit="20"
            :autoLoad="false"
          />
        </section>

        <!-- 菜谱难度分布图表 -->
        <section class="dashboard-section dashboard-section--chart">
          <DifficultyDistributionChart :difficultyData="difficultyDistribution" />
        </section>
      </div>
    </div>

    <!-- 最后更新时间 -->
    <footer v-if="lastUpdated && !loading" class="dashboard-footer">
      <p class="last-updated">最后更新: {{ formatLastUpdated(lastUpdated) }}</p>
    </footer>
  </div>
</template>

<script>
import StatisticsCards from './StatisticsCards.vue';
import CuisineDistributionChart from './CuisineDistributionChart.vue';
import DishTrendChart from './DishTrendChart.vue';
import UserRankingList from './UserRankingList.vue';
import FoodExpirationAlert from './FoodExpirationAlert.vue';
import CommentTimelineChart from './CommentTimelineChart.vue';
import RecentCommentsList from './RecentCommentsList.vue';
import DifficultyDistributionChart from './DifficultyDistributionChart.vue';
import DataExportButton from './DataExportButton.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';

import {
  getStatistics,
  getCuisineDistribution,
  getDishTrend,
  getExpiringFoods,
  getCommentTimeline,
  getDifficultyDistribution
} from '../services/supabaseService';

export default {
  name: 'DashboardContainer',
  components: {
    StatisticsCards,
    CuisineDistributionChart,
    DishTrendChart,
    UserRankingList,
    FoodExpirationAlert,
    CommentTimelineChart,
    RecentCommentsList,
    DifficultyDistributionChart,
    DataExportButton,
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      // 加载状态
      loading: false,
      error: null,
      lastUpdated: null,

      // 数据缓存
      statistics: {
        totalUsers: 0,
        totalDishes: 0,
        totalComments: 0,
        totalFoods: 0
      },
      cuisineDistribution: [],
      dishTrend: [],
      expiringFoods: [],
      commentTimeline: [],
      difficultyDistribution: [],

      // 时间范围选择
      dishTrendTimeRange: 'day',
      commentTimelineRange: 'month',

      // 刷新间隔（5分钟）
      refreshInterval: null,
      REFRESH_INTERVAL_MS: 5 * 60 * 1000
    };
  },
  computed: {
    /**
     * 是否有任何数据
     * 修改为：只要加载完成就认为有数据（即使是空数据也显示界面）
     */
    hasData() {
      // 如果还在加载中，返回false
      // 如果加载完成（无论是否有数据），返回true以显示界面
      return !this.loading || 
             this.statistics.totalUsers > 0 ||
             this.statistics.totalDishes > 0 ||
             this.cuisineDistribution.length > 0 ||
             this.dishTrend.length > 0;
    }
  },
  mounted() {
    console.log('DashboardContainer mounted');
    // 使用$nextTick确保所有子组件都已挂载
    this.$nextTick(() => {
      // 初始加载数据
      this.loadAllData();
    });

    // 设置自动刷新（可选）
    // this.startAutoRefresh();
  },
  beforeDestroy() {
    // 清除自动刷新定时器
    this.stopAutoRefresh();
  },
  methods: {
    /**
     * 加载所有数据
     */
    async loadAllData() {
      console.log('loadAllData started');
      this.loading = true;
      this.error = null;

      try {
        // 并行加载所有数据，使用allSettled以便部分失败时仍能显示其他数据
        const results = await Promise.allSettled([
          this.loadStatistics(),
          this.loadCuisineDistribution(),
          this.loadDishTrend(),
          this.loadExpiringFoods(),
          this.loadCommentTimeline(),
          this.loadDifficultyDistribution(),
          this.loadUserRanking(),
          this.loadRecentComments()
        ]);

        console.log('loadAllData results:', results);

        // 检查是否有失败的请求
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          console.warn(`${failures.length} data sources failed to load:`, failures);
          // 如果所有请求都失败了，显示错误
          if (failures.length === results.length) {
            this.error = '无法连接到数据库，请检查网络连接或稍后重试';
          }
        }

        this.lastUpdated = new Date();
        console.log('loadAllData completed, loading:', this.loading);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
        console.log('loadAllData finally, loading:', this.loading, 'hasData:', this.hasData);
      }
    },

    /**
     * 加载统计数据
     */
    async loadStatistics() {
      try {
        this.statistics = await getStatistics();
      } catch (err) {
        console.error('Failed to load statistics:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载菜系分布数据
     */
    async loadCuisineDistribution() {
      try {
        this.cuisineDistribution = await getCuisineDistribution();
      } catch (err) {
        console.error('Failed to load cuisine distribution:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载菜谱趋势数据
     */
    async loadDishTrend() {
      try {
        this.dishTrend = await getDishTrend(this.dishTrendTimeRange);
      } catch (err) {
        console.error('Failed to load dish trend:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载过期食材数据
     */
    async loadExpiringFoods() {
      try {
        this.expiringFoods = await getExpiringFoods();
      } catch (err) {
        console.error('Failed to load expiring foods:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载评论时间分布数据
     */
    async loadCommentTimeline() {
      try {
        this.commentTimeline = await getCommentTimeline(this.commentTimelineRange);
      } catch (err) {
        console.error('Failed to load comment timeline:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载难度分布数据
     */
    async loadDifficultyDistribution() {
      try {
        this.difficultyDistribution = await getDifficultyDistribution();
      } catch (err) {
        console.error('Failed to load difficulty distribution:', err);
        // 保持默认值，不抛出错误
      }
    },

    /**
     * 加载用户排行数据
     */
    async loadUserRanking() {
      try {
        if (this.$refs.userRanking && this.$refs.userRanking.loadRankingData) {
          await this.$refs.userRanking.loadRankingData();
        } else {
          console.warn('UserRankingList ref not available or loadRankingData method not found');
        }
      } catch (err) {
        console.error('Failed to load user ranking:', err);
        // 不抛出错误，让组件自己处理
      }
    },

    /**
     * 加载最新评论数据
     */
    async loadRecentComments() {
      try {
        console.log('loadRecentComments called, ref exists:', !!this.$refs.recentComments);
        if (this.$refs.recentComments && this.$refs.recentComments.loadComments) {
          console.log('Calling recentComments.loadComments()');
          await this.$refs.recentComments.loadComments();
          console.log('recentComments.loadComments() completed');
        } else {
          console.warn('RecentCommentsList ref not available or loadComments method not found');
          console.log('Available refs:', Object.keys(this.$refs));
        }
      } catch (err) {
        console.error('Failed to load recent comments:', err);
        // 不抛出错误，让组件自己处理
      }
    },

    /**
     * 刷新所有数据
     */
    async refreshAllData() {
      await this.loadAllData();
    },

    /**
     * 处理菜谱趋势时间范围变化
     */
    async handleDishTrendRangeChange(range) {
      this.dishTrendTimeRange = range;
      await this.loadDishTrend();
    },

    /**
     * 处理评论时间线时间范围变化
     */
    async handleCommentTimelineRangeChange(range) {
      this.commentTimelineRange = range;
      await this.loadCommentTimeline();
    },

    /**
     * 格式化最后更新时间
     */
    formatLastUpdated(date) {
      if (!date) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);

      if (diffSecs < 60) {
        return '刚刚';
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `今天 ${hours}:${minutes}`;
      }
    },

    /**
     * 获取用户友好的错误消息
     */
    getErrorMessage(error) {
      if (error.message.includes('timeout')) {
        return '请求超时，请检查网络连接';
      } else if (error.message.includes('network')) {
        return '网络连接失败，请检查网络';
      } else {
        return '数据加载失败，请稍后重试';
      }
    },

    /**
     * 启动自动刷新
     */
    startAutoRefresh() {
      this.stopAutoRefresh();
      this.refreshInterval = setInterval(() => {
        this.refreshAllData();
      }, this.REFRESH_INTERVAL_MS);
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* 仪表板头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  flex: 1;
  min-width: 250px;
}

.dashboard-title {
  margin: 0 0 0.5rem 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.refresh-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.refresh-icon {
  font-size: 18px;
  display: inline-block;
  transition: transform 0.3s;
}

.refresh-icon--spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 仪表板内容 */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-section {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.dashboard-section--chart {
  /* 图表组件占据一个网格单元 */
}

.dashboard-section--list {
  /* 列表组件占据一个网格单元 */
}

/* 仪表板底部 */
.dashboard-footer {
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
}

.last-updated {
  margin: 0;
  font-size: 13px;
  color: #999;
}

/* 平板端响应式布局（两列） */
@media (max-width: 1024px) {
  .dashboard-container {
    padding: 1.5rem;
  }

  .dashboard-header {
    padding: 1.25rem;
  }

  .dashboard-title {
    font-size: 24px;
  }

  .dashboard-grid {
    gap: 1.5rem;
  }
}

/* 移动端响应式布局（单列） */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .header-content {
    width: 100%;
  }

  .dashboard-title {
    font-size: 22px;
  }

  .dashboard-subtitle {
    font-size: 13px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
  }

  .dashboard-content {
    gap: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* 小屏幕移动端优化 */
@media (max-width: 480px) {
  .dashboard-container {
    padding: 0.75rem;
  }

  .dashboard-header {
    padding: 0.875rem;
  }

  .dashboard-title {
    font-size: 20px;
  }

  .dashboard-subtitle {
    font-size: 12px;
  }

  .refresh-button {
    padding: 0.625rem 1.25rem;
    font-size: 13px;
  }

  .dashboard-content {
    gap: 1.25rem;
  }

  .dashboard-grid {
    gap: 1.25rem;
  }
}
</style>
