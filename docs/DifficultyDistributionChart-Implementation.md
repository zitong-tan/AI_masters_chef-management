# DifficultyDistributionChart 组件实现文档

## 概述

`DifficultyDistributionChart` 是一个用于展示菜谱难度分布的环形图表组件。该组件使用 Chart.js 的 doughnut 图表类型，显示简单、中等、困难三个级别的菜谱分布，并能够处理未分类数据。

## 功能特性

### 核心功能

1. **环形图展示**
   - 使用 Chart.js doughnut 图表类型
   - 65% 的中心镂空比例，形成环形效果
   - 不同难度级别使用不同颜色标识

2. **数据处理**
   - 自动计算每个难度级别的百分比
   - 使用 `calculatePercentages` 工具函数确保计算准确性
   - 处理未分类数据（显示为"未分类"）

3. **统计信息展示**
   - 图表下方显示详细的统计列表
   - 每个难度级别显示：颜色指示器、名称、数量、百分比
   - 悬停时背景色变化提供视觉反馈

4. **空数据处理**
   - 当没有数据时显示友好的空状态提示
   - 不渲染图表，避免错误

5. **响应式设计**
   - 适配桌面、平板、移动设备
   - 图表高度和统计信息布局自动调整

## 组件接口

### Props

```javascript
{
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
}
```

**数据格式示例：**
```javascript
[
  { difficulty: '简单', count: 45 },
  { difficulty: '中等', count: 78 },
  { difficulty: '困难', count: 23 },
  { difficulty: '未分类', count: 12 }
]
```

### 计算属性

- `isEmpty`: 检查数据是否为空
- `chartDataWithPercentages`: 添加百分比和颜色信息的数据
- `chartData`: Chart.js 所需的数据格式

### 方法

- `renderChart()`: 渲染图表
- `updateChart()`: 更新图表（销毁旧图表并重新渲染）

## 颜色方案

组件使用预定义的颜色方案来区分不同难度级别：

```javascript
{
  '简单': '#4CAF50',   // 绿色
  '中等': '#FF9800',   // 橙色
  '困难': '#F44336',   // 红色
  '未分类': '#9E9E9E'  // 灰色
}
```

## 使用示例

### 基本使用

```vue
<template>
  <DifficultyDistributionChart :difficultyData="difficultyData" />
</template>

<script>
import DifficultyDistributionChart from '@/components/DifficultyDistributionChart.vue';
import { getDifficultyDistribution } from '@/services/supabaseService';

export default {
  components: {
    DifficultyDistributionChart
  },
  data() {
    return {
      difficultyData: []
    };
  },
  async mounted() {
    try {
      this.difficultyData = await getDifficultyDistribution();
    } catch (error) {
      console.error('Failed to load difficulty distribution:', error);
    }
  }
};
</script>
```

### 演示组件

项目包含一个演示组件 `DifficultyDistributionChartDemo.vue`，提供以下功能：

- 加载模拟数据
- 清空数据（测试空状态）
- 加载包含未分类数据的示例
- 从 Supabase 加载真实数据

## 技术实现细节

### 百分比计算

组件使用 `@/utils/dataProcessing` 中的 `calculatePercentages` 函数来计算百分比：

```javascript
import { calculatePercentages } from '@/utils/dataProcessing';

// 在 computed 属性中使用
chartDataWithPercentages() {
  const dataWithPercentages = calculatePercentages(this.difficultyData);
  return dataWithPercentages.map(item => ({
    ...item,
    color: this.difficultyColors[item.difficulty] || '#9E9E9E'
  }));
}
```

### Chart.js 配置

```javascript
{
  type: 'doughnut',
  data: {
    labels: ['简单', '中等', '困难'],
    datasets: [{
      data: [45, 78, 23],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',  // 环形图中心镂空比例
    plugins: {
      legend: {
        display: false  // 使用自定义统计列表代替默认图例
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // 显示：难度: 数量 (百分比%)
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  }
}
```

### 响应式断点

- **桌面**: > 1024px - 图表高度 280px
- **平板**: 768px - 1024px - 图表高度 260px
- **移动**: 480px - 768px - 图表高度 240px
- **小屏**: < 480px - 图表高度 220px

## 数据验证

组件包含 prop 验证器，确保传入的数据格式正确：

```javascript
validator: (value) => {
  return Array.isArray(value) && value.every(item => 
    item && typeof item === 'object' && 
    'difficulty' in item && 
    'count' in item
  );
}
```

## 性能优化

1. **条件渲染**: 只在有数据时渲染图表
2. **图表销毁**: 在组件销毁前正确清理 Chart.js 实例
3. **深度监听**: 使用 `deep: true` 监听数据变化
4. **nextTick**: 在 DOM 更新后再渲染图表

## 满足的需求

该组件满足以下需求（来自 requirements.md）：

- **需求 7.1**: 显示按难度分类的统计图表
- **需求 7.2**: 分别计算简单、中等、困难三个级别的菜谱数量
- **需求 7.3**: 使用环形图展示
- **需求 7.4**: 将难度字段为空的归类为"未分类"
- **需求 7.5**: 显示每个难度级别的百分比

## 测试建议

### 单元测试场景

1. 测试组件渲染
2. 测试空数据处理
3. 测试百分比计算
4. 测试未分类数据处理
5. 测试图表更新

### 手动测试场景

1. 使用演示组件测试各种数据场景
2. 测试响应式布局（调整浏览器窗口大小）
3. 测试悬停效果
4. 测试从 Supabase 加载真实数据

## 已知限制

1. 颜色方案固定，不支持自定义
2. 难度级别名称固定为中文
3. 图表类型固定为环形图，不支持切换为其他类型

## 未来改进方向

1. 支持自定义颜色方案
2. 支持国际化（i18n）
3. 添加图表类型切换功能（环形图/柱状图）
4. 添加数据导出功能
5. 添加点击事件，显示该难度级别的详细菜谱列表

