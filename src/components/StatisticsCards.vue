<template>
  <div class="statistics-cards">
    <div class="stat-card stat-card--users">
      <div class="stat-icon">👥</div>
      <div class="stat-content">
        <h3 class="stat-label">用户总数</h3>
        <p class="stat-value">{{ formatNumber(stats.totalUsers) }}</p>
      </div>
    </div>

    <div class="stat-card stat-card--dishes">
      <div class="stat-icon">🍳</div>
      <div class="stat-content">
        <h3 class="stat-label">菜谱总数</h3>
        <p class="stat-value">{{ formatNumber(stats.totalDishes) }}</p>
      </div>
    </div>

    <div class="stat-card stat-card--comments">
      <div class="stat-icon">💬</div>
      <div class="stat-content">
        <h3 class="stat-label">评论总数</h3>
        <p class="stat-value">{{ formatNumber(stats.totalComments) }}</p>
      </div>
    </div>

    <div class="stat-card stat-card--foods">
      <div class="stat-icon">🥗</div>
      <div class="stat-content">
        <h3 class="stat-label">食材总数</h3>
        <p class="stat-value">{{ formatNumber(stats.totalFoods) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatisticsCards',
  props: {
    stats: {
      type: Object,
      default: () => ({
        totalUsers: 0,
        totalDishes: 0,
        totalComments: 0,
        totalFoods: 0
      }),
      validator: (value) => {
        // 数据验证：确保所有必需字段存在且为数字
        return (
          typeof value === 'object' &&
          value !== null &&
          'totalUsers' in value &&
          'totalDishes' in value &&
          'totalComments' in value &&
          'totalFoods' in value
        );
      }
    }
  },
  computed: {
    // 处理和验证统计数据，提供默认值
    validatedStats() {
      return {
        totalUsers: this.validateNumber(this.stats.totalUsers),
        totalDishes: this.validateNumber(this.stats.totalDishes),
        totalComments: this.validateNumber(this.stats.totalComments),
        totalFoods: this.validateNumber(this.stats.totalFoods)
      };
    }
  },
  methods: {
    // 验证并转换为有效数字
    validateNumber(value) {
      const num = Number(value);
      return !isNaN(num) && num >= 0 ? num : 0;
    },
    // 格式化数字显示（添加千位分隔符）
    formatNumber(value) {
      const num = this.validateNumber(value);
      return num.toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 48px;
  flex-shrink: 0;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

/* 不同卡片的主题色 */
.stat-card--users {
  border-left: 4px solid #3498db;
}

.stat-card--dishes {
  border-left: 4px solid #2ecc71;
}

.stat-card--comments {
  border-left: 4px solid #f39c12;
}

.stat-card--foods {
  border-left: 4px solid #e74c3c;
}

/* 平板端响应式布局（两列） */
@media (max-width: 1024px) {
  .statistics-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

/* 移动端响应式布局（单列） */
@media (max-width: 768px) {
  .statistics-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-icon {
    font-size: 40px;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-value {
    font-size: 28px;
  }
}

/* 小屏幕移动端优化 */
@media (max-width: 480px) {
  .statistics-cards {
    gap: 0.875rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    font-size: 36px;
  }

  .stat-label {
    font-size: 12px;
    margin-bottom: 0.375rem;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
