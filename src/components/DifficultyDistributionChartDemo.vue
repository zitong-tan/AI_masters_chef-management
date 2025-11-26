<template>
  <div class="demo-container">
    <h2 class="demo-title">菜谱难度分布图表 - 演示</h2>
    
    <div class="demo-controls">
      <button @click="loadMockData" class="demo-btn">加载模拟数据</button>
      <button @click="loadEmptyData" class="demo-btn">清空数据</button>
      <button @click="loadWithUnclassified" class="demo-btn">包含未分类</button>
      <button @click="loadRealData" class="demo-btn">加载真实数据</button>
    </div>

    <div class="demo-status">
      <p v-if="loading" class="status-loading">加载中...</p>
      <p v-if="error" class="status-error">{{ error }}</p>
    </div>

    <div class="chart-wrapper">
      <DifficultyDistributionChart :difficultyData="difficultyData" />
    </div>
  </div>
</template>

<script>
import DifficultyDistributionChart from './DifficultyDistributionChart.vue';
import { getDifficultyDistribution } from '@/services/supabaseService';

export default {
  name: 'DifficultyDistributionChartDemo',
  components: {
    DifficultyDistributionChart
  },
  data() {
    return {
      difficultyData: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadMockData();
  },
  methods: {
    loadMockData() {
      this.error = null;
      this.difficultyData = [
        { difficulty: '简单', count: 45 },
        { difficulty: '中等', count: 78 },
        { difficulty: '困难', count: 23 }
      ];
    },
    loadEmptyData() {
      this.error = null;
      this.difficultyData = [];
    },
    loadWithUnclassified() {
      this.error = null;
      this.difficultyData = [
        { difficulty: '简单', count: 35 },
        { difficulty: '中等', count: 52 },
        { difficulty: '困难', count: 18 },
        { difficulty: '未分类', count: 12 }
      ];
    },
    async loadRealData() {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await getDifficultyDistribution();
        this.difficultyData = data;
      } catch (err) {
        console.error('Failed to load difficulty distribution:', err);
        this.error = '加载数据失败: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-title {
  margin: 0 0 1.5rem 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.demo-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-btn {
  padding: 0.625rem 1.25rem;
  background: #36A2EB;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.demo-btn:hover {
  background: #2890d9;
}

.demo-btn:active {
  transform: translateY(1px);
}

.demo-status {
  min-height: 24px;
  margin-bottom: 1rem;
  text-align: center;
}

.status-loading {
  color: #36A2EB;
  font-size: 14px;
  margin: 0;
}

.status-error {
  color: #F44336;
  font-size: 14px;
  margin: 0;
}

.chart-wrapper {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 1rem;
  }

  .demo-title {
    font-size: 20px;
  }

  .demo-controls {
    gap: 0.5rem;
  }

  .demo-btn {
    padding: 0.5rem 1rem;
    font-size: 13px;
  }
}
</style>
