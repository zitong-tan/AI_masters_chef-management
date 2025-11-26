<template>
  <div class="cuisine-distribution-chart">
    <div class="chart-header">
      <h3 class="chart-title">菜系分布</h3>
    </div>

    <!-- 空数据状态 -->
    <div v-if="isEmpty" class="empty-state">
      <p class="empty-message">暂无数据</p>
      <p class="empty-hint">当前没有菜系分布数据</p>
    </div>

    <!-- 图表容器 -->
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedCuisine" class="detail-modal" @click="closeDetail">
      <div class="detail-content" @click.stop>
        <button class="close-btn" @click="closeDetail">×</button>
        <h4 class="detail-title">{{ selectedCuisine.cuisine }}</h4>
        <div class="detail-info">
          <p><strong>菜谱数量:</strong> {{ selectedCuisine.count }}</p>
          <p><strong>占比:</strong> {{ selectedCuisine.percentage }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'CuisineDistributionChart',
  props: {
    cuisineData: {
      type: Array,
      default: () => [],
      validator: (value) => {
        return Array.isArray(value) && value.every(item => 
          item && typeof item === 'object' && 
          'cuisine' in item && 
          'count' in item
        );
      }
    }
  },
  data() {
    return {
      chart: null,
      selectedCuisine: null
    };
  },
  computed: {
    isEmpty() {
      return !this.cuisineData || this.cuisineData.length === 0;
    },
    chartData() {
      if (this.isEmpty) return null;

      const total = this.cuisineData.reduce((sum, item) => sum + item.count, 0);
      
      return {
        labels: this.cuisineData.map(item => item.cuisine),
        datasets: [{
          data: this.cuisineData.map(item => item.count),
          backgroundColor: this.generateColors(this.cuisineData.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 10
        }],
        percentages: this.cuisineData.map(item => 
          ((item.count / total) * 100).toFixed(1)
        )
      };
    }
  },
  watch: {
    cuisineData: {
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
    generateColors(count) {
      // 预定义的颜色方案
      const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
        '#36A2EB', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0'
      ];
      
      return baseColors.slice(0, count);
    },
    renderChart() {
      if (!this.$refs.chartCanvas || this.isEmpty) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 15,
                font: {
                  size: 12
                },
                generateLabels: (chart) => {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const dataset = data.datasets[0];
                      const percentage = this.chartData.percentages[i];
                      return {
                        text: `${label} (${percentage}%)`,
                        fillStyle: dataset.backgroundColor[i],
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const percentage = this.chartData.percentages[context.dataIndex];
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              this.showDetail(index);
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
    },
    showDetail(index) {
      const item = this.cuisineData[index];
      const percentage = this.chartData.percentages[index];
      
      this.selectedCuisine = {
        cuisine: item.cuisine,
        count: item.count,
        percentage: percentage
      };
    },
    closeDetail() {
      this.selectedCuisine = null;
    }
  }
};
</script>

<style scoped>
.cuisine-distribution-chart {
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
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 详情弹窗样式 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.detail-title {
  margin: 0 0 1.5rem 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  padding-right: 2rem;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-info p {
  margin: 0;
  font-size: 16px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-info strong {
  color: #333;
  font-weight: 600;
}

/* 平板端响应式 */
@media (max-width: 1024px) {
  .chart-container {
    height: 320px;
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .cuisine-distribution-chart {
    padding: 1.25rem;
  }

  .chart-container {
    height: 280px;
  }

  .chart-title {
    font-size: 16px;
  }

  .detail-content {
    padding: 1.5rem;
  }

  .detail-title {
    font-size: 20px;
  }

  .detail-info p {
    font-size: 14px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .cuisine-distribution-chart {
    padding: 1rem;
  }

  .chart-container {
    height: 250px;
  }

  .chart-header {
    margin-bottom: 1rem;
  }
}
</style>
