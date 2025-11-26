<template>
  <div class="comment-timeline-chart">
    <div class="chart-header">
      <h3 class="chart-title">评论时间分布</h3>
      
      <!-- 时间范围切换按钮 -->
      <div class="time-range-selector">
        <button 
          v-for="range in timeRanges" 
          :key="range.value"
          :class="['range-btn', { active: selectedRange === range.value }]"
          @click="changeTimeRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- 空数据状态 -->
    <div v-if="isEmpty" class="empty-state">
      <p class="empty-message">暂无数据</p>
      <p class="empty-hint">当前时间范围内没有评论数据</p>
    </div>

    <!-- 图表容器 -->
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'CommentTimelineChart',
  props: {
    commentData: {
      type: Array,
      default: () => [],
      validator: (value) => {
        return Array.isArray(value) && value.every(item => 
          item && typeof item === 'object' && 
          'date' in item && 
          'count' in item
        );
      }
    },
    timeRange: {
      type: String,
      default: 'month',
      validator: (value) => ['day', 'week', 'month'].includes(value)
    }
  },
  data() {
    return {
      chart: null,
      selectedRange: this.timeRange,
      timeRanges: [
        { value: 'day', label: '日' },
        { value: 'week', label: '周' },
        { value: 'month', label: '月' }
      ]
    };
  },
  computed: {
    isEmpty() {
      return !this.commentData || this.commentData.length === 0;
    },
    chartData() {
      if (this.isEmpty) return null;

      return {
        labels: this.commentData.map(item => this.formatDateLabel(item.date)),
        datasets: [{
          label: '评论数量',
          data: this.commentData.map(item => item.count),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: '#9966FF',
          borderWidth: 2,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(153, 102, 255, 0.8)',
          hoverBorderColor: '#9966FF'
        }]
      };
    }
  },
  watch: {
    commentData: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    timeRange(newValue) {
      this.selectedRange = newValue;
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
    formatDateLabel(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      
      // 根据时间范围选择不同的格式
      if (this.selectedRange === 'day') {
        // 日视图: MM/DD
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else if (this.selectedRange === 'week') {
        // 周视图: MM/DD
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        // 月视图: YYYY/MM
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    },
    renderChart() {
      if (!this.$refs.chartCanvas || this.isEmpty) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 15,
                font: {
                  size: 12
                },
                usePointStyle: true
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#9966FF',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  const originalDate = this.commentData[index].date;
                  return this.formatTooltipDate(originalDate);
                },
                label: (context) => {
                  const value = context.parsed.y;
                  return `评论数量: ${value}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '时间',
                font: {
                  size: 14,
                  weight: 'bold'
                },
                color: '#666'
              },
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 0,
                font: {
                  size: 11
                },
                color: '#666'
              }
            },
            y: {
              title: {
                display: true,
                text: '数量',
                font: {
                  size: 14,
                  weight: 'bold'
                },
                color: '#666'
              },
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                precision: 0,
                font: {
                  size: 11
                },
                color: '#666'
              }
            }
          }
        }
      });
    },
    formatTooltipDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
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
    changeTimeRange(range) {
      if (this.selectedRange !== range) {
        this.selectedRange = range;
        this.$emit('time-range-change', range);
      }
    }
  }
};
</script>

<style scoped>
.comment-timeline-chart {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.range-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 50px;
}

.range-btn:hover {
  background: rgba(153, 102, 255, 0.1);
  color: #9966FF;
}

.range-btn.active {
  background: #9966FF;
  color: white;
  box-shadow: 0 2px 4px rgba(153, 102, 255, 0.3);
}

.chart-container {
  position: relative;
  height: 350px;
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

/* 平板端响应式 */
@media (max-width: 1024px) {
  .chart-container {
    height: 320px;
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .comment-timeline-chart {
    padding: 1.25rem;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-container {
    height: 280px;
  }

  .chart-title {
    font-size: 16px;
  }

  .time-range-selector {
    width: 100%;
    justify-content: space-between;
  }

  .range-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 13px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .comment-timeline-chart {
    padding: 1rem;
  }

  .chart-container {
    height: 250px;
  }

  .chart-header {
    margin-bottom: 1rem;
  }

  .range-btn {
    padding: 0.4rem 0.5rem;
    font-size: 12px;
    min-width: 40px;
  }
}
</style>
