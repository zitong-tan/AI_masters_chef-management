# 测试环境配置说明

## 已安装的依赖

### 生产依赖
- **chart.js** (^4.5.1) - 数据可视化图表库
- **vue-chartjs** (^3.5.1) - Chart.js的Vue 2封装
- **@supabase/supabase-js** (^2.84.0) - Supabase JavaScript客户端

### 开发依赖
- **jest** (^30.2.0) - JavaScript测试框架
- **@vue/test-utils** (^1.3.6) - Vue 2组件测试工具
- **vue-jest** (^3.0.7) - Jest的Vue文件转换器
- **babel-jest** (^30.2.0) - Jest的Babel转换器
- **jest-environment-jsdom** (^30.2.0) - Jest的DOM环境
- **fast-check** (^4.3.0) - 属性测试库

## 测试脚本

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## Jest配置

Jest配置文件位于项目根目录的 `jest.config.js`，包含以下配置：

- **testEnvironment**: jsdom - 提供浏览器环境
- **transform**: 配置Vue和JavaScript文件的转换器
- **moduleNameMapper**: 支持@别名映射到src目录
- **testMatch**: 测试文件匹配模式
- **collectCoverageFrom**: 覆盖率收集配置

## 测试文件组织

- 单元测试：`tests/**/*.spec.js` 或 `**/*.test.js`
- 属性测试：使用fast-check库，每个测试运行100次迭代
- 测试文件应与被测试的组件/模块对应

## 属性测试标注格式

每个属性测试必须包含以下注释标注：

```javascript
// **Feature: ai-food-master-dashboard, Property X: 属性描述**
describe('Property X: 属性描述', () => {
  it('测试描述', () => {
    fc.assert(
      fc.property(
        // 生成器
        (data) => {
          // 测试逻辑
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## 验证测试环境

运行 `npm test` 应该看到以下测试通过：
- ✓ Jest应该正常工作
- ✓ fast-check应该可用
- ✓ Vue Test Utils应该可用

## 下一步

测试环境已配置完成，可以开始编写：
1. 组件单元测试
2. 服务层测试
3. 工具函数测试
4. 属性测试（使用fast-check）
