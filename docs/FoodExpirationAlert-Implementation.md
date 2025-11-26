# FoodExpirationAlert 组件实现文档

## 概述

FoodExpirationAlert 是一个用于显示即将过期食材的预警组件，根据剩余天数使用不同的颜色编码来标识紧急程度。

## 实现的功能

### 1. 核心功能
- ✅ 显示即将过期的食材列表
- ✅ 根据剩余天数应用颜色编码（红色/黄色/绿色）
- ✅ 显示食材名称、用户、过期日期、剩余天数
- ✅ 添加紧急程度标识（紧急/警告/提醒）
- ✅ 按剩余天数升序排序

### 2. 紧急程度分类
- **高紧急（红色）**: 剩余天数 ≤ 3天
- **中等紧急（黄色）**: 剩余天数 4-7天
- **低紧急（绿色）**: 剩余天数 > 7天

### 3. 状态处理
- ✅ 加载状态：显示加载动画
- ✅ 错误状态：显示错误信息和重试按钮
- ✅ 空状态：显示友好的空状态提示

### 4. 响应式设计
- ✅ 桌面端：完整布局
- ✅ 平板端：优化布局
- ✅ 移动端：单列布局，优化字体大小

## 组件接口

### Props
```javascript
{
  foods: Array,      // 食材数据数组
  loading: Boolean,  // 加载状态
  error: String      // 错误信息
}
```

### Events
```javascript
{
  retry: Function    // 重试事件
}
```

## 数据结构

### 食材对象
```javascript
{
  id: Number,                // 食材ID
  user_id: String,           // 用户ID
  user_name: String,         // 用户名
  food_name: String,         // 食材名称
  quantity: Number,          // 数量
  unit: String,              // 单位
  expiration_date: String,   // 过期日期 (YYYY-MM-DD)
  days_remaining: Number     // 剩余天数
}
```

## 使用示例

```vue
<template>
  <FoodExpirationAlert
    :foods="expiringFoods"
    :loading="loading"
    :error="error"
    @retry="fetchExpiringFoods"
  />
</template>

<script>
import FoodExpirationAlert from '@/components/FoodExpirationAlert.vue';
import { getExpiringFoods } from '@/services/supabaseService';

export default {
  components: {
    FoodExpirationAlert
  },
  data() {
    return {
      expiringFoods: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.fetchExpiringFoods();
  },
  methods: {
    async fetchExpiringFoods() {
      this.loading = true;
      this.error = null;
      
      try {
        this.expiringFoods = await getExpiringFoods();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## 依赖的工具函数

### calculateUrgencyLevel
从 `utils/dataProcessing.js` 导入，用于计算紧急程度级别。

```javascript
calculateUrgencyLevel(daysRemaining)
// 返回: 'high' | 'medium' | 'low'
```

### formatDate
从 `utils/dataProcessing.js` 导入，用于格式化日期。

```javascript
formatDate(date, 'date')
// 返回: 'YYYY-MM-DD'
```

## 样式特性

### 颜色方案
- **高紧急**: 
  - 边框: #ff4444 (红色)
  - 背景: #fff5f5 (浅红色)
  - 徽章: #ff4444

- **中等紧急**: 
  - 边框: #ffaa00 (黄色)
  - 背景: #fffbf0 (浅黄色)
  - 徽章: #ffaa00

- **低紧急**: 
  - 边框: #4CAF50 (绿色)
  - 背景: #f5fff5 (浅绿色)
  - 徽章: #4CAF50

### 交互效果
- 悬停时：卡片上移并显示阴影
- 平滑过渡动画

## 测试

### 演示组件
创建了 `FoodExpirationAlertDemo.vue` 用于测试组件的各种状态：
- 加载模拟数据
- 清空数据
- 模拟加载状态
- 模拟错误状态

## 验证需求

该组件满足以下需求：
- ✅ 需求 5.1: 显示食材总量统计
- ✅ 需求 5.3: 使用不同颜色标识不同紧急程度
- ✅ 需求 5.4: 3天内使用红色高亮显示
- ✅ 需求 5.5: 4-7天使用黄色警告显示

## 文件清单

1. `src/components/FoodExpirationAlert.vue` - 主组件
2. `src/components/FoodExpirationAlertDemo.vue` - 演示组件
3. `docs/FoodExpirationAlert-Implementation.md` - 本文档

## 构建验证

✅ 组件已通过构建测试，无编译错误
✅ 所有依赖项正确导入
✅ 响应式设计已实现
