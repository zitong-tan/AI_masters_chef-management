<template>
  <div class="user-ranking-list">
    <div class="ranking-header">
      <h2 class="ranking-title">🏆 用户活跃度排行榜</h2>
      <p class="ranking-subtitle">基于菜谱和评论数量的综合排名</p>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载排行榜数据..." size="small" />

    <!-- 错误状态 -->
    <ErrorMessage 
      v-else-if="error" 
      :message="error" 
      title="加载失败"
      :retryable="true"
      @retry="loadRankingData"
    />

    <!-- 空数据状态 -->
    <EmptyState 
      v-else-if="!users || users.length === 0"
      icon="👥"
      title="暂无用户数据"
      description="当前没有用户活跃度数据"
    />

    <!-- 排行榜列表 -->
    <div v-else class="ranking-list">
      <div 
        v-for="user in users" 
        :key="user.userName"
        class="ranking-item"
        :class="getRankingClass(user.rank)"
        @click="handleUserClick(user)"
      >
        <!-- 排名徽章 -->
        <div class="rank-badge" :class="getBadgeClass(user.rank)">
          <span v-if="user.rank <= 3" class="rank-medal">{{ getMedal(user.rank) }}</span>
          <span v-else class="rank-number">{{ user.rank }}</span>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <h3 class="user-name">{{ user.userName }}</h3>
          <div class="user-stats">
            <span class="stat-item">
              <span class="stat-icon">🍳</span>
              <span class="stat-text">{{ user.dishCount }} 菜谱</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">💬</span>
              <span class="stat-text">{{ user.commentCount }} 评论</span>
            </span>
          </div>
        </div>

        <!-- 活跃度分数 -->
        <div class="activity-score">
          <div class="score-value">{{ user.activityScore }}</div>
          <div class="score-label">活跃度</div>
        </div>

        <!-- 点击指示器 -->
        <div class="click-indicator">›</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserRanking } from '../services/supabaseService';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import EmptyState from './EmptyState.vue';

export default {
  name: 'UserRankingList',
  components: {
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  },
  props: {
    limit: {
      type: Number,
      default: 10,
      validator: (value) => value > 0 && value <= 100
    },
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      users: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    if (this.autoLoad) {
      this.loadRankingData();
    }
  },
  methods: {
    /**
     * 加载排行榜数据
     */
    async loadRankingData() {
      this.loading = true;
      this.error = null;

      try {
        const data = await getUserRanking(this.limit);
        
        // 添加排名信息
        this.users = data.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        this.$emit('data-loaded', this.users);
      } catch (err) {
        console.error('Failed to load user ranking:', err);
        this.error = err.message.includes('timeout') 
          ? '请求超时，请检查网络连接' 
          : '数据加载失败，请稍后重试';
        this.$emit('error', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取排名对应的奖牌
     */
    getMedal(rank) {
      const medals = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
      };
      return medals[rank] || '';
    },

    /**
     * 获取排名徽章的样式类
     */
    getBadgeClass(rank) {
      if (rank === 1) return 'rank-badge--gold';
      if (rank === 2) return 'rank-badge--silver';
      if (rank === 3) return 'rank-badge--bronze';
      return 'rank-badge--default';
    },

    /**
     * 获取排行项的样式类
     */
    getRankingClass(rank) {
      if (rank <= 3) return 'ranking-item--top';
      return '';
    },

    /**
     * 处理用户点击事件
     */
    handleUserClick(user) {
      this.$emit('user-click', user);
    },

    /**
     * 刷新数据（公开方法）
     */
    refresh() {
      this.loadRankingData();
    }
  }
};
</script>

<style scoped>
.user-ranking-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.ranking-title {
  margin: 0 0 0.5rem 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.ranking-subtitle {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.ranking-item:hover {
  background: #f5f5f5;
  border-color: #e0e0e0;
  transform: translateX(4px);
}

.ranking-item--top {
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  border-color: #ffd700;
}

.ranking-item--top:hover {
  background: linear-gradient(135deg, #fff5cc 0%, #fafafa 100%);
  border-color: #ffcc00;
}

/* 排名徽章 */
.rank-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-badge--gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #b8860b;
}

.rank-badge--silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #696969;
}

.rank-badge--bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%);
  color: #8b4513;
}

.rank-badge--default {
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  color: #666;
}

.rank-medal {
  font-size: 28px;
}

.rank-number {
  font-size: 20px;
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 13px;
  color: #666;
}

.stat-icon {
  font-size: 14px;
}

.stat-text {
  white-space: nowrap;
}

/* 活跃度分数 */
.activity-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #3498db;
  flex-shrink: 0;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
  line-height: 1;
}

.score-label {
  font-size: 11px;
  color: #999;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 点击指示器 */
.click-indicator {
  font-size: 24px;
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.2s, transform 0.2s;
}

.ranking-item:hover .click-indicator {
  color: #999;
  transform: translateX(4px);
}

/* 平板端响应式 */
@media (max-width: 1024px) {
  .user-ranking-list {
    padding: 1.25rem;
  }

  .ranking-title {
    font-size: 18px;
  }

  .rank-badge {
    width: 44px;
    height: 44px;
  }

  .rank-medal {
    font-size: 24px;
  }

  .rank-number {
    font-size: 18px;
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .user-ranking-list {
    padding: 1rem;
  }

  .ranking-header {
    margin-bottom: 1rem;
  }

  .ranking-title {
    font-size: 17px;
  }

  .ranking-subtitle {
    font-size: 12px;
  }

  .ranking-item {
    gap: 0.75rem;
    padding: 0.875rem;
  }

  .rank-badge {
    width: 40px;
    height: 40px;
  }

  .rank-medal {
    font-size: 22px;
  }

  .rank-number {
    font-size: 16px;
  }

  .user-name {
    font-size: 15px;
  }

  .user-stats {
    gap: 0.75rem;
  }

  .stat-item {
    font-size: 12px;
  }

  .stat-icon {
    font-size: 13px;
  }

  .activity-score {
    padding: 0.375rem 0.75rem;
  }

  .score-value {
    font-size: 20px;
  }

  .score-label {
    font-size: 10px;
  }

  .click-indicator {
    font-size: 20px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .user-ranking-list {
    padding: 0.875rem;
  }

  .ranking-list {
    gap: 0.625rem;
  }

  .ranking-item {
    gap: 0.625rem;
    padding: 0.75rem;
  }

  .rank-badge {
    width: 36px;
    height: 36px;
  }

  .rank-medal {
    font-size: 20px;
  }

  .rank-number {
    font-size: 14px;
  }

  .user-name {
    font-size: 14px;
    margin-bottom: 0.375rem;
  }

  .user-stats {
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-item {
    font-size: 11px;
  }

  .activity-score {
    padding: 0.25rem 0.625rem;
  }

  .score-value {
    font-size: 18px;
  }

  .click-indicator {
    display: none;
  }
}
</style>
