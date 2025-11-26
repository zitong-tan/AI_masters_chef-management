<template>
  <div class="demo-container">
    <h2>菜谱趋势图表演示</h2>
    
    <DishTrendChart 
      :trendData="sampleData" 
      :timeRange="currentRange"
      @time-range-change="handleRangeChange"
    />
    
    <div class="demo-info">
      <p>当前时间范围: {{ currentRange }}</p>
      <p>数据点数量: {{ sampleData.length }}</p>
    </div>
  </div>
</template>

<script>
import DishTrendChart from './DishTrendChart.vue';

export default {
  name: 'DishTrendChartDemo',
  components: {
    DishTrendChart
  },
  data() {
    return {
      currentRange: 'day',
      sampleData: [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 8 },
        { date: '2024-01-03', count: 12 },
        { date: '2024-01-04', count: 7 },
        { date: '2024-01-05', count: 15 },
        { date: '2024-01-06', count: 10 },
        { date: '2024-01-07', count: 18 },
        { date: '2024-01-08', count: 14 },
        { date: '2024-01-09', count: 20 },
        { date: '2024-01-10', count: 16 }
      ]
    };
  },
  methods: {
    handleRangeChange(range) {
      this.currentRange = range;
      console.log('Time range changed to:', range);
    }
  }
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.demo-info p {
  margin: 0.5rem 0;
  font-size: 14px;
  color: #666;
}
</style>
