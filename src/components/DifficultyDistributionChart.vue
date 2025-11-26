<template>
  <div class="difficulty-distribution-chart">
    <div class="chart-header">
      <h3 class="chart-title">菜谱难度分布</h3>
    </div>

    <!-- 空数据状态 -->
    <div v-if="isEmpty" class="empty-state">
      <p class="empty-message">暂无数据</p>
      <p class="empty-hint">当前没有菜谱难度分布数据</p>
    </div>

    <!-- 图表容器 -->
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- 统计信息 -->
    <div v-if="!isEmpty" class="stats-summary">
      <div 
        v-for="item in chartDataWithPercentages" 
        :key="item.difficulty"
        class="stat-item"
      >
        <div class="stat-label">
          <span 
            class="color-indicator" 
            :style="{ backgroundColor: item.color }"
          ></span>
          <span class="difficulty-name">{{ item.difficulty }}</span>
        </div>
        <div class="stat-value">
          <span class="count">{{ item.count }}</span>
          <span class="percentage">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { calculatePercentages } from '@/utils/dataProcessing';

export default {
  name: 'DifficultyDistributionChart',
  props: {
    difficultyData: {
      type: Array,
      default: () => [],
      validator: (value) => {
        return Array.isArray(value) && value.every(item => 
          item && typeof item === 'object' && 
          'difficulty' in item && 
          'count' in item
        );
      }
    }
  },
  data() {
    return {
      chart: null,
      difficultyColors: {
        '简单': '#4CAF50',
        '中等': '#FF9800',
        '困难': '#F44336',
        '未分类': '#9E9E9E'
      }
    };
  },
  computed: {
    isEmpty() {
      return !this.difficultyData || this.difficultyData.length === 0;
    },
    chartDataWithPercentages() {
      if (this.isEmpty) return [];

      // 使用工具函数计算百分比
      const dataWithPercentages = calculatePercentages(this.difficultyData);
      
      // 添加颜色信息
      return dataWithPercentages.map(item => ({
        ...item,
        color: this.difficultyColors[item.difficulty] || '#9E9E9E'
      }));
    },
    chartData() {
      if (this.isEmpty) return null;

      const data = this.chartDataWithPercentages;

      return {
        labels: data.map(item => item.difficulty),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: data.map(item => item.color),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      };
    }
  },
  watch: {
    difficultyData: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  mounted() {
    if (!this.isEmpty) {
      this.renderChart();
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    renderChart() {
      if (!this.$refs.chartCanvas || this.isEmpty) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const dataItem = this.chartDataWithPercentages[context.dataIndex];
                  const percentage = dataItem ? dataItem.percentage : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      if (!this.isEmpty) {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    }
  }
};
</script>

<style scoped>
.difficulty-distribution-chart {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.chart-container {
  position: relative;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.chart-container canvas {
  max-height: 100%;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-message {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: #666;
}

.empty-hint {
  font-size: 14px;
  margin: 0;
  color: #999;
}

/* 统计信息样式 */
.stats-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.stat-item:hover {
  background: #f0f0f0;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.difficulty-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.count {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: right;
}

.percentage {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 50px;
  text-align: right;
}

/* 平板端响应式 */
@media (max-width: 1024px) {
  .chart-container {
    height: 260px;
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .difficulty-distribution-chart {
    padding: 1.25rem;
  }

  .chart-container {
    height: 240px;
  }

  .chart-title {
    font-size: 16px;
  }

  .stat-item {
    padding: 0.625rem;
  }

  .difficulty-name {
    font-size: 13px;
  }

  .count {
    font-size: 15px;
    min-width: 35px;
  }

  .percentage {
    font-size: 13px;
    min-width: 45px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .difficulty-distribution-chart {
    padding: 1rem;
  }

  .chart-container {
    height: 220px;
  }

  .chart-header {
    margin-bottom: 1rem;
  }

  .stats-summary {
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.5rem;
  }

  .color-indicator {
    width: 14px;
    height: 14px;
  }

  .stat-label {
    gap: 0.5rem;
  }

  .difficulty-name {
    font-size: 12px;
  }

  .stat-value {
    gap: 0.75rem;
  }

  .count {
    font-size: 14px;
    min-width: 30px;
  }

  .percentage {
    font-size: 12px;
    min-width: 40px;
  }
}
</style>
