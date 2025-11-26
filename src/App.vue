<template>
  <div id="app">
    <header class="app-header">
      <h1 class="app-title">AI美食大师管理系统</h1>
      <p class="app-subtitle">数据可视化管理平台</p>
    </header>
    <main class="app-main">
      <DashboardContainer />
    </main>
    <footer class="app-footer">
      <p>&copy; 2024 AI美食大师. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import DashboardContainer from './components/DashboardContainer.vue'

export default {
  name: 'App',
  components: {
    DashboardContainer
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

/* 应用主容器 */
#app {
  font-family: 'Avenir', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 应用头部 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.app-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.95;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 应用底部 */
.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem 1rem;
  font-size: 0.9rem;
  margin-top: auto;
}

.app-footer p {
  opacity: 0.8;
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem 1rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .app-main {
    padding: 1.5rem 1rem;
  }
}

/* 响应式设计 - 移动设备 */
@media (max-width: 480px) {
  .app-header {
    padding: 1rem 0.5rem;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .app-main {
    padding: 1rem 0.5rem;
  }

  .app-footer {
    padding: 1rem 0.5rem;
    font-size: 0.8rem;
  }
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 全局动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
