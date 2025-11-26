<template>
  <div class="food-expiration-alert">
    <div class="alert-header">
      <h3 class="alert-title">🍎 食材过期预警</h3>
      <span v-if="foods.length > 0" class="alert-count">{{ foods.length }} 项</span>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载食材数据..." size="small" />

    <!-- 错误状态 -->
    <ErrorMessage
      v-else-if="error"
      :message="error"
      title="加载失败"
      :retryable="true"
      @retry="$emit('retry')"
    />

    <!-- 空状态 -->
    <EmptyState
      v-else-if="foods.length === 0"
      icon="✅"
      title="暂无即将过期的食材"
      description="所有食材都在保质期内"
    />

    <!-- 食材列表 -->
    <div v-else class="food-list">
      <div
        v-for="food in sortedFoods"
        :key="food.id"
        class="food-item"
        :class="`food-item--${getUrgencyLevel(food.days_remaining)}`"
      >
        <div class="food-urgency-badge" :class="`urgency-badge--${getUrgencyLevel(food.days_remaining)}`">
          {{ getUrgencyText(food.days_remaining) }}
        </div>
        
        <div class="food-content">
          <div class="food-main-info">
            <h4 class="food-name">{{ food.food_name }}</h4>
            <span class="food-quantity">{{ food.quantity }}{{ food.unit }}</span>
          </div>
          
          <div class="food-meta">
            <span class="food-user">👤 {{ food.user_name }}</span>
            <span class="food-expiration">📅 {{ formatExpirationDate(food.expiration_date) }}</span>
          </div>
          
          <div class="food-days-remaining" :class="`days-remaining--${getUrgencyLevel(food.days_remaining)}`">
            <span class="days-number">{{ food.days_remaining }}</span>
            <span class="days-text">天后过期</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import EmptyState from './EmptyState.vue';
import { calculateUrgencyLevel, formatDate } from '../utils/dataProcessing';

export default {
  name: 'FoodExpirationAlert',
  components: {
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  },
  props: {
    foods: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  computed: {
    /**
     * 按剩余天数升序排序的食材列表
     */
    sortedFoods() {
      return [...this.foods].sort((a, b) => {
        return a.days_remaining - b.days_remaining;
      });
    }
  },
  methods: {
    /**
     * 获取紧急程度级别
     * @param {Number} daysRemaining - 剩余天数
     * @returns {String} 'high' | 'medium' | 'low'
     */
    getUrgencyLevel(daysRemaining) {
      return calculateUrgencyLevel(daysRemaining);
    },
    
    /**
     * 获取紧急程度文本
     * @param {Number} daysRemaining - 剩余天数
     * @returns {String} 紧急程度文本
     */
    getUrgencyText(daysRemaining) {
      const level = this.getUrgencyLevel(daysRemaining);
      const textMap = {
        high: '紧急',
        medium: '警告',
        low: '提醒'
      };
      return textMap[level] || '提醒';
    },
    
    /**
     * 格式化过期日期
     * @param {String} date - 日期字符串
     * @returns {String} 格式化后的日期
     */
    formatExpirationDate(date) {
      return formatDate(date, 'date');
    }
  }
};
</script>

<style scoped>
.food-expiration-alert {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.alert-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.alert-count {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.food-item {
  position: relative;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.2s;
}

/* 紧急程度颜色编码 */
.food-item--high {
  border-color: #ff4444;
  background-color: #fff5f5;
}

.food-item--medium {
  border-color: #ffaa00;
  background-color: #fffbf0;
}

.food-item--low {
  border-color: #4CAF50;
  background-color: #f5fff5;
}

.food-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.food-urgency-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.urgency-badge--high {
  background-color: #ff4444;
}

.urgency-badge--medium {
  background-color: #ffaa00;
}

.urgency-badge--low {
  background-color: #4CAF50;
}

.food-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.food-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.food-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.food-quantity {
  font-size: 14px;
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.food-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 14px;
  color: #666;
}

.food-user,
.food-expiration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.food-days-remaining {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.days-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.days-text {
  font-size: 14px;
  font-weight: 500;
}

.days-remaining--high .days-number {
  color: #ff4444;
}

.days-remaining--medium .days-number {
  color: #ffaa00;
}

.days-remaining--low .days-number {
  color: #4CAF50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .food-expiration-alert {
    padding: 1rem;
  }

  .alert-title {
    font-size: 18px;
  }

  .alert-count {
    font-size: 12px;
    padding: 0.2rem 0.6rem;
  }

  .food-item {
    padding: 0.875rem;
  }

  .food-name {
    font-size: 16px;
  }

  .food-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .days-number {
    font-size: 24px;
  }

  .days-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .food-expiration-alert {
    padding: 0.875rem;
  }

  .alert-header {
    margin-bottom: 1rem;
  }

  .alert-title {
    font-size: 16px;
  }

  .food-item {
    padding: 0.75rem;
  }

  .food-name {
    font-size: 15px;
  }

  .food-quantity {
    font-size: 12px;
  }

  .food-meta {
    font-size: 13px;
  }

  .food-urgency-badge {
    font-size: 11px;
    padding: 0.2rem 0.6rem;
  }
}
</style>
