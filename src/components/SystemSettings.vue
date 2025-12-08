<template>
  <div class="system-settings">
    <div class="settings-header">
      <h2 class="settings-title">⚙️ 系统设置</h2>
      <p class="settings-subtitle">配置系统参数和偏好设置</p>
    </div>

    <div class="settings-container">
      <!-- 外观设置 -->
      <div class="settings-section">
        <h3 class="section-title">🎨 外观设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">主题颜色</label>
            <p class="setting-description">选择系统主题颜色方案</p>
          </div>
          <select v-model="settings.theme" class="setting-control" @change="saveSettings">
            <option value="blue">蓝色（默认）</option>
            <option value="green">绿色</option>
            <option value="purple">紫色</option>
            <option value="orange">橙色</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">侧边栏默认状态</label>
            <p class="setting-description">设置侧边栏初始展开或收起</p>
          </div>
          <select v-model="settings.sidebarDefault" class="setting-control" @change="saveSettings">
            <option value="expanded">展开</option>
            <option value="collapsed">收起</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">动画效果</label>
            <p class="setting-description">启用或禁用界面动画效果</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.animations" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 数据设置 -->
      <div class="settings-section">
        <h3 class="section-title">📊 数据设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">数据刷新间隔</label>
            <p class="setting-description">自动刷新数据的时间间隔（分钟）</p>
          </div>
          <select v-model.number="settings.refreshInterval" class="setting-control" @change="saveSettings">
            <option :value="0">手动刷新</option>
            <option :value="1">1分钟</option>
            <option :value="5">5分钟</option>
            <option :value="10">10分钟</option>
            <option :value="30">30分钟</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">每页显示数量</label>
            <p class="setting-description">列表和表格每页显示的数据条数</p>
          </div>
          <select v-model.number="settings.pageSize" class="setting-control" @change="saveSettings">
            <option :value="10">10条</option>
            <option :value="20">20条</option>
            <option :value="50">50条</option>
            <option :value="100">100条</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">数据缓存</label>
            <p class="setting-description">启用数据缓存以提高加载速度</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.cacheEnabled" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <h3 class="section-title">🔔 通知设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">桌面通知</label>
            <p class="setting-description">允许系统发送桌面通知</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.desktopNotifications" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">声音提示</label>
            <p class="setting-description">操作完成时播放提示音</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.soundEffects" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">新评论提醒</label>
            <p class="setting-description">有新评论时发送通知</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.commentNotifications" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="settings-section">
        <h3 class="section-title">🔒 安全设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">自动登出</label>
            <p class="setting-description">无操作后自动登出的时间（分钟）</p>
          </div>
          <select v-model.number="settings.autoLogout" class="setting-control" @change="saveSettings">
            <option :value="0">禁用</option>
            <option :value="15">15分钟</option>
            <option :value="30">30分钟</option>
            <option :value="60">60分钟</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">操作确认</label>
            <p class="setting-description">删除等危险操作需要二次确认</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.confirmDangerousActions" @change="saveSettings" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="settings-section">
        <h3 class="section-title">ℹ️ 系统信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">系统版本</span>
            <span class="info-value">v2.0.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据库状态</span>
            <span class="info-value status-online">● 在线</span>
          </div>
          <div class="info-item">
            <span class="info-label">最后更新</span>
            <span class="info-value">{{ lastUpdate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总用户数</span>
            <span class="info-value">{{ systemStats.totalUsers }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总菜谱数</span>
            <span class="info-value">{{ systemStats.totalDishes }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总评论数</span>
            <span class="info-value">{{ systemStats.totalComments }}</span>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <h3 class="section-title">🗄️ 数据管理</h3>
        <div class="action-buttons">
          <button class="action-btn action-btn--primary" @click="clearCache">
            🗑️ 清除缓存
          </button>
          <button class="action-btn action-btn--secondary" @click="exportSettings">
            📥 导出设置
          </button>
          <button class="action-btn action-btn--secondary" @click="importSettings">
            📤 导入设置
          </button>
          <button class="action-btn action-btn--danger" @click="resetSettings">
            🔄 恢复默认
          </button>
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <h3 class="section-title">📖 关于</h3>
        <div class="about-content">
          <p class="about-text">
            <strong>AI美食大师管理系统</strong> 是一个功能强大的美食社区管理平台，
            提供数据可视化、用户管理、菜谱管理等全方位的管理功能。
          </p>
          <p class="about-text">
            © 2024 AI美食大师. All rights reserved.
          </p>
          <div class="about-links">
            <a href="#" class="about-link">使用文档</a>
            <a href="#" class="about-link">隐私政策</a>
            <a href="#" class="about-link">服务条款</a>
            <a href="#" class="about-link">联系我们</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <transition name="fade">
      <div v-if="showSaveNotification" class="save-notification">
        ✓ 设置已保存
      </div>
    </transition>
  </div>
</template>

<script>
import supabase from '../services/supabaseClient';
import themeManager from '../utils/themeManager';

export default {
  name: 'SystemSettings',
  data() {
    return {
      settings: {
        theme: 'blue',
        sidebarDefault: 'expanded',
        animations: true,
        refreshInterval: 5,
        pageSize: 20,
        cacheEnabled: true,
        desktopNotifications: false,
        soundEffects: true,
        commentNotifications: true,
        autoLogout: 30,
        confirmDangerousActions: true
      },
      systemStats: {
        totalUsers: 0,
        totalDishes: 0,
        totalComments: 0
      },
      lastUpdate: new Date().toLocaleString('zh-CN'),
      showSaveNotification: false
    };
  },
  mounted() {
    this.loadSettings();
    this.loadSystemStats();
    this.applyTheme();
  },

  watch: {
    'settings.theme': {
      handler() {
        this.applyTheme();
      },
      immediate: true
    }
  },
  methods: {
    loadSettings() {
      const saved = localStorage.getItem('systemSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    },

    saveSettings() {
      localStorage.setItem('systemSettings', JSON.stringify(this.settings));
      this.applyTheme(); // 保存时应用主题
      this.showSaveNotification = true;
      setTimeout(() => {
        this.showSaveNotification = false;
      }, 2000);
    },

    applyTheme() {
      // 使用主题管理器应用主题
      themeManager.applyTheme(this.settings.theme);
    },

    async loadSystemStats() {
      try {
        // 获取用户数
        const { data: dishes } = await supabase
          .from('user_dishes')
          .select('user_name');
        const uniqueUsers = new Set(dishes?.map(d => d.user_name) || []);
        this.systemStats.totalUsers = uniqueUsers.size;

        // 获取菜谱数
        const { count: dishCount } = await supabase
          .from('user_dishes')
          .select('*', { count: 'exact', head: true });
        this.systemStats.totalDishes = dishCount || 0;

        // 获取评论数
        const { count: commentCount } = await supabase
          .from('user_comments')
          .select('*', { count: 'exact', head: true });
        this.systemStats.totalComments = commentCount || 0;
      } catch (err) {
        console.error('Failed to load system stats:', err);
      }
    },

    clearCache() {
      if (confirm('确定要清除所有缓存数据吗？')) {
        localStorage.removeItem('dataCache');
        alert('缓存已清除！');
      }
    },

    exportSettings() {
      const dataStr = JSON.stringify(this.settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'system-settings.json';
      link.click();
      URL.revokeObjectURL(url);
    },

    importSettings() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            this.settings = { ...this.settings, ...imported };
            this.saveSettings();
            alert('设置导入成功！');
          } catch (err) {
            alert('导入失败：文件格式错误');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    resetSettings() {
      if (confirm('确定要恢复所有设置到默认值吗？')) {
        this.settings = {
          theme: 'blue',
          sidebarDefault: 'expanded',
          animations: true,
          refreshInterval: 5,
          pageSize: 20,
          cacheEnabled: true,
          desktopNotifications: false,
          soundEffects: true,
          commentNotifications: true,
          autoLogout: 30,
          confirmDangerousActions: true
        };
        this.saveSettings();
        alert('设置已恢复默认！');
      }
    }
  }
};
</script>

<style>
/* 全局主题变量 */
:root {
  --theme-primary: #667eea;
  --theme-secondary: #764ba2;
  --theme-primary-dark: #1e3c72;
  --theme-secondary-dark: #2a5298;
  --theme-accent: #3498db;
}

/* 主题类 */
.theme-blue {
  --theme-primary: #667eea;
  --theme-secondary: #764ba2;
  --theme-primary-dark: #1e3c72;
  --theme-secondary-dark: #2a5298;
  --theme-accent: #3498db;
}

.theme-green {
  --theme-primary: #2ecc71;
  --theme-secondary: #27ae60;
  --theme-primary-dark: #27ae60;
  --theme-secondary-dark: #229954;
  --theme-accent: #27ae60;
}

.theme-purple {
  --theme-primary: #9b59b6;
  --theme-secondary: #8e44ad;
  --theme-primary-dark: #8e44ad;
  --theme-secondary-dark: #7d3c98;
  --theme-accent: #9b59b6;
}

.theme-orange {
  --theme-primary: #f39c12;
  --theme-secondary: #e67e22;
  --theme-primary-dark: #e67e22;
  --theme-secondary-dark: #d35400;
  --theme-accent: #f39c12;
}
</style>

<style scoped>
.system-settings {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  margin: 0 0 0.5rem 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-primary-dark);
}

.settings-subtitle {
  margin: 0;
  font-size: 15px;
  color: #666;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--theme-primary-dark);
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.75rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.setting-description {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.setting-control {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.setting-control:focus {
  outline: none;
  border-color: var(--theme-secondary-dark);
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--theme-secondary-dark);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* 系统信息 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--theme-primary-dark);
}

.status-online {
  color: #2e7d32;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn--primary {
  background: linear-gradient(135deg, var(--theme-primary-dark) 0%, var(--theme-secondary-dark) 100%);
  color: white;
}

.action-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.action-btn--secondary {
  background: #f5f5f5;
  color: #666;
}

.action-btn--secondary:hover {
  background: #e0e0e0;
}

.action-btn--danger {
  background: #ffebee;
  color: #c62828;
}

.action-btn--danger:hover {
  background: #ffcdd2;
}

/* 关于部分 */
.about-content {
  line-height: 1.8;
}

.about-text {
  margin: 0 0 1rem 0;
  color: #666;
}

.about-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.about-link {
  color: var(--theme-secondary-dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.about-link:hover {
  color: var(--theme-primary-dark);
  text-decoration: underline;
}

/* 保存通知 */
.save-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  background: #2e7d32;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  z-index: 3000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .system-settings {
    padding: 1rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
