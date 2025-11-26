<template>
  <div class="demo-container">
    <h2>数据导出功能演示</h2>
    <p class="demo-description">
      点击下方按钮导出仪表板数据。支持JSON和CSV两种格式。
    </p>
    
    <div class="demo-content">
      <DataExportButton />
    </div>

    <div class="demo-info">
      <h3>功能说明：</h3>
      <ul>
        <li>📊 <strong>JSON格式</strong>：导出包含所有数据的单个JSON文件</li>
        <li>📈 <strong>CSV格式</strong>：导出多个CSV文件，每个数据集一个文件</li>
        <li>🔄 <strong>错误重试</strong>：如果导出失败，可以点击重试按钮</li>
        <li>⏱️ <strong>超时控制</strong>：请求超过10秒将自动超时</li>
      </ul>
    </div>

    <div class="demo-info">
      <h3>导出的数据包括：</h3>
      <ul>
        <li>统计数据（用户、菜谱、评论、食材总数）</li>
        <li>菜系分布数据</li>
        <li>菜谱创建趋势数据</li>
        <li>用户活跃度排行数据</li>
        <li>即将过期的食材数据</li>
        <li>评论时间分布数据</li>
        <li>菜谱难度分布数据</li>
      </ul>
    </div>
  </div>
</template>

<script>
import DataExportButton from './DataExportButton.vue';

export default {
  name: 'DataExportButtonDemo',
  components: {
    DataExportButton
  }
};
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 24px;
}

.demo-description {
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

.demo-content {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.demo-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f7ff;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.demo-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 18px;
}

.demo-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.demo-info li {
  margin-bottom: 0.75rem;
  color: #555;
  line-height: 1.6;
}

.demo-info li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .demo-container {
    margin: 1rem;
    padding: 1.5rem;
  }

  h2 {
    font-size: 20px;
  }

  .demo-description {
    font-size: 14px;
  }

  .demo-content {
    padding: 1.5rem;
  }

  .demo-info {
    padding: 1rem;
  }

  .demo-info h3 {
    font-size: 16px;
  }

  .demo-info li {
    font-size: 14px;
  }
}
</style>
