<template>
  <div id="app">
    <Sidebar :currentView="currentView" @view-change="handleViewChange" @collapse-change="handleCollapseChange" />
    <div class="app-content" :class="{ 'app-content--collapsed': sidebarCollapsed }">
      <header class="app-header">
        <h1 class="app-title">{{ currentViewTitle }}</h1>
        <p class="app-subtitle">{{ currentViewSubtitle }}</p>
      </header>
      <main class="app-main">
        <component :is="currentComponent" :key="componentKey" />
      </main>
      <footer class="app-footer">
        <p>&copy; 2024 AI美食大师. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import DashboardContainer from './components/DashboardContainer.vue'
import UserManagement from './components/UserManagement.vue'
import DishManagement from './components/DishManagement.vue'
import CommentManagement from './components/CommentManagement.vue'
import FoodManagement from './components/FoodManagement.vue'
import SystemSettings from './components/SystemSettings.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    DashboardContainer,
    UserManagement,
    DishManagement,
    CommentManagement,
    FoodManagement,
    SystemSettings
  },
  data() {
    return {
      currentView: 'dashboard',
      sidebarCollapsed: false,
      componentKey: 0,
      views: {
        dashboard: {
          component: 'DashboardContainer',
          title: '数据概览',
          subtitle: '实时监控平台运营数据'
        },
        users: {
          component: 'UserManagement',
          title: '用户管理',
          subtitle: '管理平台用户信息'
        },
        dishes: {
          component: 'DishManagement',
          title: '菜谱管理',
          subtitle: '管理平台菜谱内容'
        },
        comments: {
          component: 'CommentManagement',
          title: '评论管理',
          subtitle: '审核、编辑和管理用户评论内容'
        },
        foods: {
          component: 'FoodManagement',
          title: '食材管理',
          subtitle: '按用户管理食材库存，发送过期预警提醒'
        },
        settings: {
          component: 'SystemSettings',
          title: '系统设置',
          subtitle: '配置系统参数和偏好设置'
        }
      }
    }
  },
  computed: {
    currentComponent() {
      return this.views[this.currentView]?.component || 'DashboardContainer'
    },
    currentViewTitle() {
      return this.views[this.currentView]?.title || '数据概览'
    },
    currentViewSubtitle() {
      return this.views[this.currentView]?.subtitle || ''
    }
  },
  methods: {
    handleViewChange(viewId) {
      // 如果切换到 dashboard，更新 key 以强制重新加载组件
      if (viewId === 'dashboard') {
        this.componentKey++
      }
      this.currentView = viewId
    },
    handleCollapseChange(collapsed) {
      this.sidebarCollapsed = collapsed
    }
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
  background: #f5f7fa;
}

/* 内容区域 */
.app-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.app-content--collapsed {
  margin-left: 70px;
}

/* 应用头部 */
.app-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 0.95rem;
  font-weight: 300;
  opacity: 0.9;
  margin: 0;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 0;
  overflow-y: auto;
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
  .app-content {
    margin-left: 70px;
  }

  .app-header {
    padding: 1rem;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .app-subtitle {
    font-size: 0.85rem;
  }
}

/* 响应式设计 - 移动设备 */
@media (max-width: 480px) {
  .app-content {
    margin-left: 70px;
  }

  .app-header {
    padding: 0.75rem;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .app-subtitle {
    font-size: 0.8rem;
  }

  .app-footer {
    padding: 0.75rem;
    font-size: 0.75rem;
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
