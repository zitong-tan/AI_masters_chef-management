<template>
  <div class="comment-timeline-demo">
    <h2>评论时间分布图表演示</h2>
    
    <div class="demo-controls">
      <button @click="loadData" :disabled="loading">
        {{ loading ? '加载中...' : '加载数据' }}
      </button>
      <button @click="clearData" :disabled="loading">清空数据</button>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <CommentTimelineChart 
      :commentData="commentData"
      :timeRange="currentTimeRange"
      @time-range-change="handleTimeRangeChange"
    />

    <div class="data-info">
      <h3>当前数据:</h3>
      <p>数据点数量: {{ commentData.length }}</p>
      <p>时间范围: {{ currentTimeRange }}</p>
      <p>总评论数: {{ totalComments }}</p>
    </div>
  </div>
</template>

<script>
import CommentTimelineChart from './CommentTimelineChart.vue';
import { getCommentTimeline } from '../services/supabaseService';

export default {
  name: 'CommentTimelineChartDemo',
  components: {
    CommentTimelineChart
  },
  data() {
    return {
      commentData: [],
      currentTimeRange: 'month',
      loading: false,
      error: null
    };
  },
  computed: {
    totalComments() {
      return this.commentData.reduce((sum, item) => sum + item.count, 0);
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await getCommentTimeline(this.currentTimeRange);
        this.commentData = data;
      } catch (err) {
        this.error = `加载失败: ${err.message}`;
        console.error('Error loading comment timeline:', err);
      } finally {
        this.loading = false;
      }
    },
    clearData() {
      this.commentData = [];
    },
    async handleTimeRangeChange(newRange) {
      this.currentTimeRange = newRange;
      await this.loadData();
    }
  }
};
</script>

<style scoped>
.comment-timeline-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.demo-controls button {
  padding: 0.75rem 1.5rem;
  background: #9966FF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-controls button:hover:not(:disabled) {
  background: #8855EE;
}

.demo-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #c33;
}

.data-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.data-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.data-info p {
  margin: 0.5rem 0;
  color: #666;
}
</style>
