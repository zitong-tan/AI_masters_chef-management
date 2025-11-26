# CommentTimelineChart 实现文档

## 任务概述
创建评论时间分布图表组件 (Task 10)

## 实现内容

### 1. 组件文件
- **文件路径**: `src/components/CommentTimelineChart.vue`
- **组件名称**: CommentTimelineChart

### 2. 功能实现

#### ✅ 创建components/CommentTimelineChart.vue
- 组件已创建并包含完整的模板、脚本和样式

#### ✅ 集成Chart.js柱状图或折线图
- 使用 Chart.js 的柱状图 (bar chart)
- 配置了完整的图表选项，包括：
  - 响应式设计
  - 交互模式设置
  - 图例配置
  - 工具提示配置
  - X轴和Y轴配置

#### ✅ 实现时间范围筛选
- 支持三种时间范围：日、周、月
- 时间范围选择器UI组件
- 点击按钮切换时间范围
- 触发 `time-range-change` 事件通知父组件

#### ✅ 显示每日评论数量
- 从 `commentData` prop 接收数据
- 数据格式：`[{ date: String, count: Number }]`
- 在柱状图中显示每日评论数量
- Y轴显示数量，X轴显示时间

#### ✅ 添加图表交互
- 鼠标悬停显示详细信息
- 工具提示显示完整日期和评论数量
- 柱状图悬停效果（颜色变化）
- 响应式图表大小调整

### 3. Props 定义

```javascript
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
}
```

### 4. 事件

- **time-range-change**: 当用户切换时间范围时触发，传递新的时间范围值

### 5. 数据处理

#### 日期格式化
- **formatDateLabel**: 根据时间范围格式化日期标签
  - 日/周视图: MM/DD
  - 月视图: YYYY/MM
- **formatTooltipDate**: 格式化工具提示中的日期为 YYYY-MM-DD

#### 空数据处理
- 当 `commentData` 为空或未定义时显示空状态
- 空状态提示："暂无数据" 和 "当前时间范围内没有评论数据"

### 6. 图表配置

#### 柱状图样式
- 背景色: rgba(153, 102, 255, 0.6) (紫色)
- 边框色: #9966FF
- 边框宽度: 2px
- 圆角: 4px
- 悬停效果: 背景色加深

#### 坐标轴
- **X轴**: 显示时间，标签旋转45度
- **Y轴**: 显示数量，从0开始，整数刻度

#### 工具提示
- 黑色半透明背景
- 显示完整日期和评论数量
- 紫色边框

### 7. 响应式设计

- **桌面**: 图表高度 350px
- **平板 (≤1024px)**: 图表高度 320px
- **移动端 (≤768px)**: 
  - 图表高度 280px
  - 标题和选择器垂直排列
  - 选择器占满宽度
- **小屏幕 (≤480px)**: 图表高度 250px

### 8. 测试文件

- **文件路径**: `tests/CommentTimelineChart.test.js`
- **测试覆盖**:
  - 组件渲染
  - 空数据处理
  - 时间范围切换
  - 日期格式化
  - Props 验证
  - 数据更新响应

### 9. 演示组件

- **文件路径**: `src/components/CommentTimelineChartDemo.vue`
- **功能**:
  - 从 Supabase 加载真实数据
  - 测试时间范围切换
  - 显示数据统计信息
  - 错误处理演示

## 需求验证

### 需求 6.1: 显示评论数量的时间分布图
✅ 已实现 - 使用柱状图显示评论时间分布

### 需求 6.2: 计算每日评论总数
✅ 已实现 - 从 supabaseService.getCommentTimeline() 获取按日聚合的数据

## 与现有代码集成

### 数据源
- 使用 `src/services/supabaseService.js` 中的 `getCommentTimeline(timeRange)` 方法
- 该方法已在任务2中实现

### 样式一致性
- 遵循项目统一的设计风格
- 与 DishTrendChart 组件保持一致的UI模式
- 使用相同的响应式断点

### Chart.js 集成
- 使用 Chart.js 3.x
- 与其他图表组件使用相同的导入方式
- 统一的图表配置模式

## 使用示例

```vue
<template>
  <div>
    <CommentTimelineChart 
      :commentData="commentData"
      :timeRange="currentTimeRange"
      @time-range-change="handleTimeRangeChange"
    />
  </div>
</template>

<script>
import CommentTimelineChart from '@/components/CommentTimelineChart.vue';
import { getCommentTimeline } from '@/services/supabaseService';

export default {
  components: {
    CommentTimelineChart
  },
  data() {
    return {
      commentData: [],
      currentTimeRange: 'month'
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.commentData = await getCommentTimeline(this.currentTimeRange);
    },
    async handleTimeRangeChange(newRange) {
      this.currentTimeRange = newRange;
      await this.loadData();
    }
  }
};
</script>
```

## 技术细节

### 生命周期管理
- **mounted**: 如果有数据则渲染图表
- **beforeDestroy**: 销毁 Chart.js 实例，防止内存泄漏

### 数据监听
- 监听 `commentData` 变化，自动更新图表
- 监听 `timeRange` prop 变化，同步内部状态

### 图表更新策略
- 数据变化时先销毁旧图表
- 使用 `$nextTick` 确保 DOM 更新后再渲染新图表

## 已知限制

1. **测试环境问题**: 由于项目中存在 Babel 版本冲突，Vue 组件测试无法运行。这是一个预存在的问题，影响所有 Vue 组件测试。
2. **图表类型**: 当前使用柱状图，如需切换为折线图，只需修改 Chart.js 配置中的 `type: 'bar'` 为 `type: 'line'`

## 完成状态

✅ 所有任务要求已实现
✅ 组件无语法错误
✅ 与现有代码库集成良好
✅ 遵循项目代码规范
✅ 包含完整的响应式设计
✅ 提供演示组件和测试文件

## 下一步

组件已准备好集成到主仪表板中。在任务14（创建主仪表板容器组件）中，可以导入并使用此组件。
