<template>
  <div class="demo-container">
    <h2>食材过期预警组件演示</h2>
    
    <div class="demo-controls">
      <button @click="loadMockData" class="demo-btn">加载模拟数据</button>
      <button @click="loadEmptyData" class="demo-btn">清空数据</button>
      <button @click="simulateLoading" class="demo-btn">模拟加载</button>
      <button @click="simulateError" class="demo-btn">模拟错误</button>
    </div>

    <FoodExpirationAlert
      :foods="foods"
      :loading="loading"
      :error="error"
      @retry="handleRetry"
    />
  </div>
</template>

<script>
import FoodExpirationAlert from './FoodExpirationAlert.vue';

export default {
  name: 'FoodExpirationAlertDemo',
  components: {
    FoodExpirationAlert
  },
  data() {
    return {
      foods: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadMockData();
  },
  methods: {
    loadMockData() {
      this.loading = false;
      this.error = null;
      
      // 模拟不同紧急程度的食材数据
      this.foods = [
        {
          id: 1,
          user_id: 'user-001',
          user_name: '张三',
          food_name: '牛奶',
          quantity: 2,
          unit: '瓶',
          expiration_date: this.getDateString(1),
          days_remaining: 1
        },
        {
          id: 2,
          user_id: 'user-002',
          user_name: '李四',
          food_name: '鸡蛋',
          quantity: 6,
          unit: '个',
          expiration_date: this.getDateString(2),
          days_remaining: 2
        },
        {
          id: 3,
          user_id: 'user-001',
          user_name: '张三',
          food_name: '面包',
          quantity: 1,
          unit: '袋',
          expiration_date: this.getDateString(3),
          days_remaining: 3
        },
        {
          id: 4,
          user_id: 'user-003',
          user_name: '王五',
          food_name: '酸奶',
          quantity: 4,
          unit: '杯',
          expiration_date: this.getDateString(5),
          days_remaining: 5
        },
        {
          id: 5,
          user_id: 'user-002',
          user_name: '李四',
          food_name: '豆腐',
          quantity: 1,
          unit: '盒',
          expiration_date: this.getDateString(7),
          days_remaining: 7
        },
        {
          id: 6,
          user_id: 'user-004',
          user_name: '赵六',
          food_name: '火腿',
          quantity: 3,
          unit: '根',
          expiration_date: this.getDateString(0),
          days_remaining: 0
        }
      ];
    },
    
    loadEmptyData() {
      this.loading = false;
      this.error = null;
      this.foods = [];
    },
    
    simulateLoading() {
      this.loading = true;
      this.error = null;
      this.foods = [];
      
      setTimeout(() => {
        this.loading = false;
        this.loadMockData();
      }, 2000);
    },
    
    simulateError() {
      this.loading = false;
      this.error = '无法加载食材数据，请检查网络连接';
      this.foods = [];
    },
    
    handleRetry() {
      this.simulateLoading();
    },
    
    getDateString(daysFromNow) {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date.toISOString().split('T')[0];
    }
  }
};
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-btn {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.demo-btn:hover {
  background-color: #2980b9;
}

.demo-btn:active {
  background-color: #21618c;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 0.5rem;
  }
  
  .demo-controls {
    gap: 0.5rem;
  }
  
  .demo-btn {
    font-size: 13px;
    padding: 0.4rem 0.8rem;
  }
}
</style>
