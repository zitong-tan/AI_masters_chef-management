# 设计文档

## 概述

AI美食大师管理系统是一个基于Vue 2.6的单页应用（SPA），使用Supabase作为后端数据库服务。系统通过多种图表组件（Chart.js）实现数据可视化，为管理员提供直观的数据分析界面。系统采用组件化架构，确保代码的可维护性和可扩展性。

## 架构

### 技术栈

- **前端框架**: Vue 2.6
- **图表库**: Chart.js 3.x（轻量级、文档完善、Vue 2兼容）
- **HTTP客户端**: Supabase JavaScript Client
- **样式方案**: CSS3 + Flexbox/Grid（响应式布局）
- **状态管理**: Vue组件内部状态（考虑到项目规模，暂不引入Vuex）

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Vue Application                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │   Charts     │  │   Widgets    │  │
│  │  Container   │  │  Components  │  │  Components  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │           Supabase Service Layer                  │  │
│  │  - Data Fetching  - Error Handling  - Caching    │  │
│  └──────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │              Supabase Client                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Database                      │
│  - user_dishes  - user_comments  - foods                │
│  - expiring_foods (view)                                │
└─────────────────────────────────────────────────────────┘
```

## 组件和接口

### 核心组件结构

#### 1. DashboardContainer.vue
主容器组件，负责整体布局和数据协调。

**职责:**
- 管理全局加载状态
- 协调子组件数据获取
- 处理错误边界
- 提供数据刷新功能

**Props:** 无

**Data:**
```javascript
{
  loading: Boolean,
  error: String | null,
  refreshInterval: Number
}
```

#### 2. StatisticsCards.vue
统计卡片组件，显示关键指标。

**职责:**
- 显示用户总数、菜谱总数、评论总数、食材总数
- 提供数据对比（如环比增长）
- 响应式卡片布局

**Props:**
```javascript
{
  stats: {
    totalUsers: Number,
    totalDishes: Number,
    totalComments: Number,
    totalFoods: Number
  }
}
```

#### 3. CuisineDistributionChart.vue
菜系分布图表组件。

**职责:**
- 使用饼图或柱状图展示菜系分布
- 支持图表交互（点击、悬停）
- 动态更新数据

**Props:**
```javascript
{
  cuisineData: Array<{
    cuisine: String,
    count: Number
  }>
}
```

#### 4. DishTrendChart.vue
菜谱创建趋势图表组件。

**职责:**
- 使用折线图展示时间趋势
- 支持时间范围切换（日/周/月）
- 显示数据点详情

**Props:**
```javascript
{
  trendData: Array<{
    date: String,
    count: Number
  }>,
  timeRange: String // 'day' | 'week' | 'month'
}
```

#### 5. UserRankingList.vue
用户活跃度排行榜组件。

**职责:**
- 显示前10名活跃用户
- 计算活跃度分数
- 提供用户详情链接

**Props:**
```javascript
{
  users: Array<{
    userName: String,
    dishCount: Number,
    commentCount: Number,
    activityScore: Number
  }>
}
```

#### 6. FoodExpirationAlert.vue
食材过期预警组件。

**职责:**
- 显示即将过期的食材列表
- 使用颜色编码表示紧急程度
- 提供过期天数倒计时

**Props:**
```javascript
{
  expiringFoods: Array<{
    id: Number,
    foodName: String,
    userName: String,
    expirationDate: String,
    daysRemaining: Number
  }>
}
```

#### 7. CommentTimelineChart.vue
评论时间分布图表组件。

**职责:**
- 显示评论数量的时间分布
- 支持时间范围筛选
- 展示评论活跃时段

**Props:**
```javascript
{
  commentData: Array<{
    date: String,
    count: Number
  }>
}
```

#### 8. DifficultyDistributionChart.vue
菜谱难度分布图表组件。

**职责:**
- 使用环形图展示难度分布
- 显示百分比和数量
- 处理未分类数据

**Props:**
```javascript
{
  difficultyData: Array<{
    difficulty: String,
    count: Number,
    percentage: Number
  }>
}
```

#### 9. DataExportButton.vue
数据导出按钮组件。

**职责:**
- 提供CSV和JSON格式导出
- 收集当前页面所有数据
- 生成并下载文件

**Props:**
```javascript
{
  exportData: Object,
  format: String // 'csv' | 'json'
}
```

### Supabase服务层

#### supabaseService.js

提供统一的数据访问接口。

**接口方法:**

```javascript
// 获取统计数据
async getStatistics()

// 获取菜系分布数据
async getCuisineDistribution()

// 获取菜谱趋势数据
async getDishTrend(timeRange)

// 获取用户排行数据
async getUserRanking(limit = 10)

// 获取即将过期的食材
async getExpiringFoods()

// 获取评论时间分布
async getCommentTimeline(timeRange)

// 获取难度分布数据
async getDifficultyDistribution()

// 导出所有数据
async exportAllData()
```

## 数据模型

### 前端数据模型

#### StatisticsModel
```javascript
{
  totalUsers: Number,        // 用户总数
  totalDishes: Number,       // 菜谱总数
  totalComments: Number,     // 评论总数
  totalFoods: Number,        // 食材总数
  timestamp: Date            // 数据获取时间
}
```

#### CuisineDataModel
```javascript
{
  cuisine: String,           // 菜系名称
  count: Number,             // 菜谱数量
  percentage: Number         // 占比百分比
}
```

#### TrendDataModel
```javascript
{
  date: String,              // 日期（YYYY-MM-DD）
  count: Number,             // 数量
  label: String              // 显示标签
}
```

#### UserRankingModel
```javascript
{
  userName: String,          // 用户名
  dishCount: Number,         // 菜谱数量
  commentCount: Number,      // 评论数量
  activityScore: Number,     // 活跃度分数
  rank: Number               // 排名
}
```

#### ExpiringFoodModel
```javascript
{
  id: Number,                // 食材ID
  userId: String,            // 用户ID
  userName: String,          // 用户名
  foodName: String,          // 食材名称
  quantity: Number,          // 数量
  unit: String,              // 单位
  expirationDate: String,    // 过期日期
  daysRemaining: Number,     // 剩余天数
  urgencyLevel: String       // 紧急程度: 'high' | 'medium' | 'low'
}
```

### 数据库查询模式

#### 统计查询
```sql
-- 用户总数（从user_dishes表中去重）
SELECT COUNT(DISTINCT user_name) FROM user_dishes;

-- 菜谱总数
SELECT COUNT(*) FROM user_dishes;

-- 评论总数
SELECT COUNT(*) FROM user_comments;

-- 食材总数
SELECT COUNT(*) FROM foods;
```

#### 菜系分布查询
```sql
SELECT 
  cuisine, 
  COUNT(*) as count 
FROM user_dishes 
WHERE cuisine IS NOT NULL 
GROUP BY cuisine 
ORDER BY count DESC;
```

#### 趋势查询（按日）
```sql
SELECT 
  DATE(created_at) as date, 
  COUNT(*) as count 
FROM user_dishes 
GROUP BY DATE(created_at) 
ORDER BY date DESC 
LIMIT 30;
```

#### 用户排行查询
```sql
SELECT 
  user_name,
  COUNT(*) as dish_count,
  (SELECT COUNT(*) FROM user_comments WHERE user_name = ud.user_name) as comment_count
FROM user_dishes ud
GROUP BY user_name
ORDER BY (dish_count + comment_count) DESC
LIMIT 10;
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性反思

在编写正确性属性之前，我需要识别并消除冗余：

- 属性4.2（活跃度计算）和4.3（排行榜排序）可以合并为一个综合属性，因为排序隐含了正确的计算
- 属性5.4和5.5（紧急程度分类）可以合并为一个属性，涵盖所有天数范围
- 多个响应式更新属性（3.5、4.4、6.5）描述的是相同的响应式行为模式，可以作为一个通用属性
- 属性2.2（菜系统计）和7.2（难度统计）是相同的聚合模式，可以抽象为一个通用的分组计数属性

### 正确性属性列表

**属性 1: 数据获取完整性**
*对于任意*的数据库状态，当系统获取统计数据时，返回的对象应该包含所有必需的字段（totalUsers、totalDishes、totalComments、totalFoods）且值为非负整数
**验证: 需求 1.2, 1.4**

**属性 2: 分组聚合正确性**
*对于任意*的数据集和分组字段（如菜系、难度），聚合后每个分组的计数应该等于原始数据中该分组值出现的次数，且所有分组计数之和应该等于原始数据总数
**验证: 需求 2.2, 7.2**

**属性 3: 时间范围数据查询正确性**
*对于任意*的时间范围选择（日/周/月），返回的数据点应该按照选择的粒度正确分组，且每个数据点的日期应该在查询范围内
**验证: 需求 3.2, 3.5**

**属性 4: 图表轴配置正确性**
*对于任意*的趋势数据，生成的图表配置应该将时间字段映射到X轴，数值字段映射到Y轴
**验证: 需求 3.3**

**属性 5: 用户排行计算和排序正确性**
*对于任意*的用户数据集，计算的活跃度分数应该等于（菜谱数量 + 评论数量），且返回的排行榜应该按活跃度分数降序排列，最多包含10个用户
**验证: 需求 4.2, 4.3**

**属性 6: 过期食材查询正确性**
*对于任意*的当前日期，查询返回的食材列表中，每个食材的过期日期应该在当前日期后的7天内（包含当天）
**验证: 需求 5.2**

**属性 7: 紧急程度分类正确性**
*对于任意*的剩余天数，当天数 <= 3时紧急级别应为'high'，当3 < 天数 <= 7时应为'medium'，当天数 > 7时应为'low'
**验证: 需求 5.4, 5.5**

**属性 8: 评论列表排序和限制正确性**
*对于任意*的评论数据集，返回的列表应该按创建时间降序排列（最新的在前），且最多包含20条评论
**验证: 需求 6.3**

**属性 9: 文本截断正确性**
*对于任意*的文本字符串和截断长度阈值，当文本长度超过阈值时，截断后的文本长度应该等于阈值，且应该添加省略号标识
**验证: 需求 6.4**

**属性 10: 百分比计算正确性**
*对于任意*的分布数据，每个类别的百分比应该等于（该类别数量 / 总数量 × 100），且所有类别的百分比之和应该等于100%（允许±0.1%的浮点误差）
**验证: 需求 7.5**

**属性 11: 数据加载状态转换正确性**
*对于任意*的数据加载操作，当加载开始时loading状态应为true，当加载完成（成功或失败）时loading状态应为false
**验证: 需求 9.2**

**属性 12: 数据导出格式正确性**
*对于任意*的数据对象，导出为JSON格式时应该能够被JSON.parse解析，导出为CSV格式时应该包含表头行和数据行，且列数一致
**验证: 需求 10.2**

**属性 13: 导出数据完整性**
*对于任意*的导出操作，导出的数据应该包含所有当前可见图表的原始数据字段，不应该丢失任何必需字段
**验证: 需求 10.3**

## 错误处理

### 错误类型和处理策略

#### 1. 网络错误
**场景:** Supabase连接失败、请求超时

**处理策略:**
- 显示用户友好的错误消息
- 提供重试按钮
- 记录错误日志到控制台
- 设置10秒超时限制

**实现:**
```javascript
try {
  const data = await supabaseService.getData();
} catch (error) {
  if (error.message.includes('timeout')) {
    this.error = '请求超时，请检查网络连接';
  } else {
    this.error = '数据加载失败，请稍后重试';
  }
  console.error('Network error:', error);
}
```

#### 2. 数据验证错误
**场景:** 返回的数据格式不符合预期

**处理策略:**
- 使用默认值填充缺失字段
- 过滤无效数据
- 显示部分可用数据
- 记录验证失败的详细信息

**实现:**
```javascript
function validateStatistics(data) {
  return {
    totalUsers: Number(data.totalUsers) || 0,
    totalDishes: Number(data.totalDishes) || 0,
    totalComments: Number(data.totalComments) || 0,
    totalFoods: Number(data.totalFoods) || 0
  };
}
```

#### 3. 空数据处理
**场景:** 查询返回空结果

**处理策略:**
- 显示"暂无数据"占位符
- 提供数据刷新选项
- 不显示空图表，改为显示提示信息

**实现:**
```javascript
if (!data || data.length === 0) {
  return {
    isEmpty: true,
    message: '暂无数据'
  };
}
```

#### 4. 图表渲染错误
**场景:** Chart.js渲染失败

**处理策略:**
- 捕获渲染异常
- 显示降级UI（表格形式）
- 记录错误详情
- 不阻塞其他组件

**实现:**
```javascript
mounted() {
  try {
    this.renderChart();
  } catch (error) {
    console.error('Chart render error:', error);
    this.showFallbackTable = true;
  }
}
```

#### 5. 导出错误
**场景:** 数据导出失败

**处理策略:**
- 显示具体错误原因
- 提供重试选项
- 检查浏览器兼容性
- 提供备选方案（复制到剪贴板）

## 测试策略

### 单元测试

使用Jest + Vue Test Utils进行组件单元测试。

**测试范围:**
- 组件渲染测试
- Props验证测试
- 事件触发测试
- 边缘情况测试（空数据、错误状态）

**示例测试:**
```javascript
// StatisticsCards.vue 测试
describe('StatisticsCards', () => {
  it('应该渲染所有统计卡片', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: {
        stats: {
          totalUsers: 100,
          totalDishes: 500,
          totalComments: 200,
          totalFoods: 300
        }
      }
    });
    expect(wrapper.findAll('.stat-card')).toHaveLength(4);
  });

  it('应该处理空数据', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: { stats: null }
    });
    expect(wrapper.text()).toContain('暂无数据');
  });
});
```

### 属性测试

使用fast-check进行属性测试，验证通用正确性属性。

**配置:**
- 每个属性测试运行100次迭代
- 使用自定义生成器生成测试数据
- 每个测试必须标注对应的设计文档属性编号

**示例属性测试:**
```javascript
// 测试属性 2: 分组聚合正确性
// **Feature: ai-food-master-dashboard, Property 2: 分组聚合正确性**
describe('Property 2: 分组聚合正确性', () => {
  it('聚合后的计数应该等于原始数据中的出现次数', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          cuisine: fc.string(),
          name: fc.string()
        })),
        (dishes) => {
          const result = aggregateByCuisine(dishes);
          const totalCount = result.reduce((sum, item) => sum + item.count, 0);
          return totalCount === dishes.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 测试属性 5: 用户排行计算和排序正确性
// **Feature: ai-food-master-dashboard, Property 5: 用户排行计算和排序正确性**
describe('Property 5: 用户排行计算和排序正确性', () => {
  it('活跃度分数应该正确计算且排序正确', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          userName: fc.string(),
          dishCount: fc.nat(100),
          commentCount: fc.nat(100)
        })),
        (users) => {
          const ranking = calculateUserRanking(users);
          
          // 验证分数计算
          const scoresCorrect = ranking.every(user => 
            user.activityScore === user.dishCount + user.commentCount
          );
          
          // 验证排序
          const sortedCorrectly = ranking.every((user, i) => 
            i === 0 || ranking[i-1].activityScore >= user.activityScore
          );
          
          // 验证限制
          const limitCorrect = ranking.length <= 10;
          
          return scoresCorrect && sortedCorrectly && limitCorrect;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 测试属性 7: 紧急程度分类正确性
// **Feature: ai-food-master-dashboard, Property 7: 紧急程度分类正确性**
describe('Property 7: 紧急程度分类正确性', () => {
  it('应该根据剩余天数正确分类紧急程度', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }),
        (daysRemaining) => {
          const urgency = calculateUrgencyLevel(daysRemaining);
          
          if (daysRemaining <= 3) {
            return urgency === 'high';
          } else if (daysRemaining <= 7) {
            return urgency === 'medium';
          } else {
            return urgency === 'low';
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 测试属性 10: 百分比计算正确性
// **Feature: ai-food-master-dashboard, Property 10: 百分比计算正确性**
describe('Property 10: 百分比计算正确性', () => {
  it('所有类别的百分比之和应该等于100%', () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat(100), { minLength: 1 }),
        (counts) => {
          const distribution = calculatePercentages(counts);
          const sum = distribution.reduce((acc, item) => acc + item.percentage, 0);
          return Math.abs(sum - 100) <= 0.1; // 允许0.1%的浮点误差
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

测试组件与Supabase服务层的集成。

**测试范围:**
- 数据获取流程
- 错误处理流程
- 状态管理流程

**方法:**
- 使用Mock Supabase客户端
- 模拟各种响应场景（成功、失败、超时）
- 验证组件状态变化

### 端到端测试

使用Cypress进行关键用户流程测试。

**测试场景:**
- 仪表板加载和数据显示
- 图表交互
- 数据导出功能
- 响应式布局切换

## 性能考虑

### 数据缓存策略

**实现方案:**
- 使用Vue组件内部缓存，避免重复请求
- 设置5分钟缓存过期时间
- 提供手动刷新功能

```javascript
data() {
  return {
    cachedData: null,
    cacheTimestamp: null,
    CACHE_DURATION: 5 * 60 * 1000 // 5分钟
  };
},
methods: {
  async fetchData(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cachedData && 
        (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedData;
    }
    
    const data = await supabaseService.getData();
    this.cachedData = data;
    this.cacheTimestamp = now;
    return data;
  }
}
```

### 图表渲染优化

**策略:**
- 使用Chart.js的响应式配置
- 限制数据点数量（最多显示30天数据）
- 使用防抖处理窗口resize事件

```javascript
methods: {
  handleResize: _.debounce(function() {
    if (this.chart) {
      this.chart.resize();
    }
  }, 300)
}
```

### 懒加载

**实现:**
- 图表组件按需加载
- 使用Vue的异步组件
- 减少初始加载时间

```javascript
components: {
  CuisineDistributionChart: () => import('./CuisineDistributionChart.vue'),
  DishTrendChart: () => import('./DishTrendChart.vue')
}
```

## 安全考虑

### Supabase安全

**措施:**
- 使用环境变量存储敏感信息
- 仅使用anon key，不暴露service key
- 依赖Supabase RLS策略控制数据访问
- 所有查询使用参数化，防止SQL注入

### XSS防护

**措施:**
- Vue自动转义模板中的内容
- 避免使用v-html
- 对用户输入进行清理（如评论内容）

### CORS配置

**措施:**
- Supabase自动处理CORS
- 确保只允许授权域名访问

## 部署考虑

### 构建配置

**环境变量:**
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**构建命令:**
```bash
npm run build
```

### 静态托管

**推荐平台:**
- Vercel
- Netlify
- GitHub Pages

**配置要点:**
- 设置环境变量
- 配置SPA路由回退
- 启用HTTPS

### 监控和日志

**实现:**
- 使用console.error记录错误
- 考虑集成Sentry进行错误追踪
- 监控Supabase使用量和性能

## 未来扩展

### 可能的功能增强

1. **实时数据更新**
   - 使用Supabase实时订阅
   - 自动刷新图表数据

2. **高级筛选**
   - 按时间范围筛选
   - 按用户筛选
   - 多维度组合筛选

3. **数据对比**
   - 同比/环比分析
   - 多时间段对比

4. **用户权限管理**
   - 集成Supabase Auth
   - 角色权限控制

5. **自定义仪表板**
   - 拖拽式布局
   - 保存个性化配置

6. **移动应用**
   - 使用Vue Native或Capacitor
   - 推送通知功能
