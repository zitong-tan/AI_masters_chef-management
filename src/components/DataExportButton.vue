<template>
  <div class="data-export-button">
    <div class="export-controls">
      <select 
        v-model="selectedFormat" 
        class="format-selector"
        :disabled="isExporting"
      >
        <option value="json">JSON格式</option>
        <option value="csv">CSV格式</option>
      </select>
      
      <button 
        @click="handleExport" 
        class="export-button"
        :disabled="isExporting"
      >
        <span v-if="!isExporting">📥 导出数据</span>
        <span v-else>⏳ 导出中...</span>
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
      <button @click="handleRetry" class="retry-button">
        🔄 重试
      </button>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      <span class="success-icon">✅</span>
      <span class="success-text">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script>
import { exportAllData } from '../services/supabaseService';
import { exportToJSON, exportToCSV, prepareDataForCSV } from '../utils/exportData';

export default {
  name: 'DataExportButton',
  data() {
    return {
      selectedFormat: 'json',
      isExporting: false,
      error: null,
      successMessage: null
    };
  },
  methods: {
    /**
     * 处理导出操作
     */
    async handleExport() {
      // 清除之前的消息
      this.error = null;
      this.successMessage = null;
      this.isExporting = true;

      try {
        // 收集所有图表数据
        const allData = await exportAllData();

        // 根据选择的格式导出
        let success = false;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `dashboard-export-${timestamp}`;

        if (this.selectedFormat === 'json') {
          success = this.exportAsJSON(allData, filename);
        } else if (this.selectedFormat === 'csv') {
          success = this.exportAsCSV(allData, filename);
        }

        if (success) {
          this.successMessage = '数据导出成功！';
          // 3秒后清除成功消息
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        } else {
          throw new Error('导出失败，请重试');
        }
      } catch (err) {
        console.error('Export error:', err);
        this.error = this.getErrorMessage(err);
      } finally {
        this.isExporting = false;
      }
    },

    /**
     * 导出为JSON格式
     */
    exportAsJSON(data, filename) {
      try {
        return exportToJSON(data, filename);
      } catch (error) {
        console.error('JSON export failed:', error);
        return false;
      }
    },

    /**
     * 导出为CSV格式
     * 将多个数据集分别导出为不同的CSV文件
     */
    exportAsCSV(data, filename) {
      try {
        // 导出统计数据
        if (data.statistics) {
          const statsArray = [data.statistics];
          exportToCSV(statsArray, `${filename}-statistics`);
        }

        // 导出菜系分布
        if (data.cuisineDistribution && data.cuisineDistribution.length > 0) {
          const cuisineData = prepareDataForCSV(data.cuisineDistribution);
          exportToCSV(cuisineData, `${filename}-cuisine-distribution`);
        }

        // 导出菜谱趋势
        if (data.dishTrend && data.dishTrend.length > 0) {
          const trendData = prepareDataForCSV(data.dishTrend);
          exportToCSV(trendData, `${filename}-dish-trend`);
        }

        // 导出用户排行
        if (data.userRanking && data.userRanking.length > 0) {
          const rankingData = prepareDataForCSV(data.userRanking);
          exportToCSV(rankingData, `${filename}-user-ranking`);
        }

        // 导出过期食材
        if (data.expiringFoods && data.expiringFoods.length > 0) {
          const foodsData = prepareDataForCSV(data.expiringFoods);
          exportToCSV(foodsData, `${filename}-expiring-foods`);
        }

        // 导出评论时间线
        if (data.commentTimeline && data.commentTimeline.length > 0) {
          const timelineData = prepareDataForCSV(data.commentTimeline);
          exportToCSV(timelineData, `${filename}-comment-timeline`);
        }

        // 导出难度分布
        if (data.difficultyDistribution && data.difficultyDistribution.length > 0) {
          const difficultyData = prepareDataForCSV(data.difficultyDistribution);
          exportToCSV(difficultyData, `${filename}-difficulty-distribution`);
        }

        return true;
      } catch (error) {
        console.error('CSV export failed:', error);
        return false;
      }
    },

    /**
     * 处理重试
     */
    handleRetry() {
      this.error = null;
      this.handleExport();
    },

    /**
     * 获取用户友好的错误消息
     */
    getErrorMessage(error) {
      if (error.message.includes('timeout')) {
        return '请求超时，请检查网络连接后重试';
      } else if (error.message.includes('network')) {
        return '网络连接失败，请检查网络后重试';
      } else if (error.message.includes('Invalid data')) {
        return '数据格式错误，无法导出';
      } else {
        return '导出失败，请稍后重试';
      }
    }
  }
};
</script>

<style scoped>
.data-export-button {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.export-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.format-selector {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 140px;
}

.format-selector:hover:not(:disabled) {
  border-color: #3498db;
}

.format-selector:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.format-selector:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.export-button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.export-button:active:not(:disabled) {
  transform: translateY(0);
}

.export-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.retry-button:hover {
  background: #c0392b;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
}

.success-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.success-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .export-controls {
    flex-direction: column;
    width: 100%;
  }

  .format-selector,
  .export-button {
    width: 100%;
  }

  .error-message,
  .success-message {
    flex-direction: column;
    align-items: flex-start;
  }

  .retry-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .format-selector,
  .export-button {
    padding: 0.625rem 1rem;
    font-size: 13px;
  }

  .error-message,
  .success-message {
    padding: 0.875rem;
    font-size: 13px;
  }
}
</style>
