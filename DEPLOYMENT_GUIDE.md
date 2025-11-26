# AI美食大师管理系统 - 部署指南

## 开发环境运行

### 1. 确保环境变量配置正确

项目根目录下的 `.env.local` 文件应包含以下内容：

```
VUE_APP_SUPABASE_URL=https://lsffqvdzwnvtrmweqkwu.supabase.co
VUE_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**注意**: Vue CLI 项目中，环境变量必须以 `VUE_APP_` 开头才能在客户端代码中访问。

### 2. 启动开发服务器

```bash
npm run serve
```

服务器将在 http://localhost:8080 或 http://localhost:8081 启动（取决于端口是否被占用）。

### 3. 访问应用

在浏览器中打开显示的URL（通常是 http://localhost:8081）。

## 常见问题排查

### 白屏问题

如果遇到白屏，请检查：

1. **浏览器控制台** - 按 F12 打开开发者工具，查看 Console 标签页中的错误信息
2. **环境变量** - 确保 `.env.local` 文件在项目根目录，且变量名以 `VUE_APP_` 开头
3. **Supabase连接** - 检查控制台中是否有 Supabase 连接错误
4. **重启开发服务器** - 修改环境变量后需要重启服务器

### 数据加载失败

如果数据加载失败：

1. 检查 Supabase 数据库是否正常运行
2. 确认数据库表结构是否正确（参考 `src/supabase-init.sql`）
3. 检查网络连接
4. 查看浏览器控制台的详细错误信息

### 调试模式

应用已添加详细的控制台日志，打开浏览器控制台可以看到：

- Vue 应用初始化信息
- 环境变量加载状态
- 数据加载过程
- 错误详情

## 生产环境部署

### 1. 构建生产版本

```bash
npm run build
```

构建完成后，`dist` 目录包含可部署的静态文件。

### 2. 部署到静态托管平台

推荐平台：
- Vercel
- Netlify
- GitHub Pages

确保在部署平台配置环境变量：
- `VUE_APP_SUPABASE_URL`
- `VUE_APP_SUPABASE_ANON_KEY`

## 功能特性

- ✅ 统计卡片展示（用户、菜谱、评论、食材总数）
- ✅ 菜系分布图表
- ✅ 菜谱创建趋势图
- ✅ 用户活跃度排行榜
- ✅ 食材过期预警
- ✅ 评论时间分布图
- ✅ 最新评论列表
- ✅ 菜谱难度分布图
- ✅ 数据导出功能（CSV/JSON）
- ✅ 响应式设计（支持桌面、平板、移动设备）
- ✅ 优雅的错误处理和加载状态

## 技术栈

- Vue 2.6
- Chart.js 3.x
- Supabase
- Vue CLI
