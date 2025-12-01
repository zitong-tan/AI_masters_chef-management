<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">{{ collapsed ? '🍳' : '🍳 AI美食大师' }}</h2>
      <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? '展开' : '收起'">
        {{ collapsed ? '»' : '«' }}
      </button>
    </div>

    <nav class="sidebar-nav">
      <a
        v-for="item in menuItems"
        :key="item.id"
        :class="['nav-item', { 'nav-item--active': currentView === item.id }]"
        @click="selectView(item.id)"
        :title="item.label"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div v-if="!collapsed" class="footer-info">
        <p class="footer-text">© 2024 AI美食大师</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarNav',
  props: {
    currentView: {
      type: String,
      default: 'dashboard'
    }
  },
  data() {
    return {
      collapsed: false,
      menuItems: [
        { id: 'dashboard', label: '数据概览', icon: '📊' },
        { id: 'users', label: '用户管理', icon: '👥' },
        { id: 'dishes', label: '菜谱管理', icon: '🍽️' },
        { id: 'comments', label: '评论管理', icon: '💬' },
        { id: 'foods', label: '食材管理', icon: '🥬' },
        { id: 'settings', label: '系统设置', icon: '⚙️' }
      ]
    };
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit('collapse-change', this.collapsed);
    },
    selectView(viewId) {
      this.$emit('view-change', viewId);
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar--collapsed {
  width: 70px;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.sidebar--collapsed .nav-item {
  padding: 1rem;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item--active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: #4fc3f7;
}

.nav-icon {
  font-size: 20px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  margin-left: 1rem;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-info {
  text-align: center;
}

.footer-text {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .sidebar-title {
    font-size: 20px;
  }

  .nav-label {
    display: none;
  }

  .collapse-btn {
    display: none;
  }
}
</style>
