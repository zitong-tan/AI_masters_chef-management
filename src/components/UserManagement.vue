<template>
  <div class="user-management">
    <div class="management-header">
      <h2 class="management-title">👥 用户管理</h2>
      <button class="add-btn" @click="showAddDialog = true">
        <span class="btn-icon">➕</span>
        <span class="btn-text">添加用户</span>
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索用户名..."
        @input="handleSearch"
      />
      <button class="search-btn" @click="loadUsers">
        🔍 搜索
      </button>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载用户数据..." />

    <!-- 错误状态 -->
    <ErrorMessage
      v-else-if="error"
      :message="error"
      title="加载失败"
      :retryable="true"
      @retry="loadUsers"
    />

    <!-- 用户列表 -->
    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>菜谱数量</th>
            <th>评论数量</th>
            <th>活跃度</th>
            <th>最后活动</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.userName" class="user-row">
            <td class="user-name-cell">
              <div class="user-avatar">{{ getUserInitial(user.userName) }}</div>
              <span class="user-name">{{ user.userName }}</span>
            </td>
            <td>{{ user.dishCount }}</td>
            <td>{{ user.commentCount }}</td>
            <td>
              <span class="activity-badge" :class="getActivityClass(user.activityScore)">
                {{ user.activityScore }}
              </span>
            </td>
            <td>{{ formatDate(user.lastActivity) }}</td>
            <td class="actions-cell">
              <button class="action-btn action-btn--view" @click="viewUser(user)" title="查看详情">
                👁️
              </button>
              <button class="action-btn action-btn--delete" @click="confirmDeleteUser(user)" title="删除用户">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="empty-state">
        <p class="empty-icon">👤</p>
        <p class="empty-text">暂无用户数据</p>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <div v-if="showAddDialog" class="modal-overlay" @click="showAddDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">添加新用户</h3>
        <form @submit.prevent="handleAddUser">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="newUser.userName"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn--cancel" @click="showAddDialog = false">
              取消
            </button>
            <button type="submit" class="modal-btn modal-btn--confirm">
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-message">
          确定要删除用户 <strong>{{ userToDelete?.userName }}</strong> 吗？
          <br />
          这将删除该用户的所有菜谱和评论，此操作无法撤销。
        </p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="showDeleteDialog = false">
            取消
          </button>
          <button class="modal-btn modal-btn--confirm" @click="handleDeleteUser">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <div v-if="showDetailDialog" class="modal-overlay" @click="showDetailDialog = false">
      <div class="modal-content modal-content--large" @click.stop>
        <h3 class="modal-title">用户详情</h3>
        <div v-if="selectedUser" class="user-detail">
          <div class="detail-row">
            <span class="detail-label">用户名:</span>
            <span class="detail-value">{{ selectedUser.userName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">菜谱数量:</span>
            <span class="detail-value">{{ selectedUser.dishCount }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">评论数量:</span>
            <span class="detail-value">{{ selectedUser.commentCount }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">活跃度分数:</span>
            <span class="detail-value">{{ selectedUser.activityScore }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">最后活动:</span>
            <span class="detail-value">{{ formatDate(selectedUser.lastActivity) }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="showDetailDialog = false">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import supabase from '../services/supabaseClient';

export default {
  name: 'UserManagement',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      users: [],
      filteredUsers: [],
      loading: false,
      error: null,
      searchQuery: '',
      showAddDialog: false,
      showDeleteDialog: false,
      showDetailDialog: false,
      newUser: {
        userName: ''
      },
      userToDelete: null,
      selectedUser: null
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;

      try {
        // 获取所有用户的菜谱数据
        const { data: dishesData, error: dishesError } = await supabase
          .from('user_dishes')
          .select('user_name, created_at');

        if (dishesError) throw dishesError;

        // 获取所有用户的评论数据
        const { data: commentsData, error: commentsError } = await supabase
          .from('user_comments')
          .select('user_name, created_at');

        if (commentsError) throw commentsError;

        // 聚合用户数据
        const userMap = {};

        dishesData?.forEach(dish => {
          if (!userMap[dish.user_name]) {
            userMap[dish.user_name] = {
              userName: dish.user_name,
              dishCount: 0,
              commentCount: 0,
              lastActivity: dish.created_at
            };
          }
          userMap[dish.user_name].dishCount++;
          if (new Date(dish.created_at) > new Date(userMap[dish.user_name].lastActivity)) {
            userMap[dish.user_name].lastActivity = dish.created_at;
          }
        });

        commentsData?.forEach(comment => {
          if (!userMap[comment.user_name]) {
            userMap[comment.user_name] = {
              userName: comment.user_name,
              dishCount: 0,
              commentCount: 0,
              lastActivity: comment.created_at
            };
          }
          userMap[comment.user_name].commentCount++;
          if (new Date(comment.created_at) > new Date(userMap[comment.user_name].lastActivity)) {
            userMap[comment.user_name].lastActivity = comment.created_at;
          }
        });

        // 转换为数组并计算活跃度
        this.users = Object.values(userMap).map(user => ({
          ...user,
          activityScore: user.dishCount + user.commentCount
        })).sort((a, b) => b.activityScore - a.activityScore);

        this.filteredUsers = [...this.users];
      } catch (err) {
        console.error('Failed to load users:', err);
        this.error = '加载用户数据失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredUsers = [...this.users];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.userName.toLowerCase().includes(query)
      );
    },

    getUserInitial(userName) {
      return userName ? userName.charAt(0).toUpperCase() : '?';
    },

    getActivityClass(score) {
      if (score >= 10) return 'activity-badge--high';
      if (score >= 5) return 'activity-badge--medium';
      return 'activity-badge--low';
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
      return date.toLocaleDateString('zh-CN');
    },

    async handleAddUser() {
      if (!this.newUser.userName.trim()) {
        alert('请输入用户名');
        return;
      }

      try {
        // 检查用户是否已存在
        const existingUser = this.users.find(u => u.userName === this.newUser.userName);
        if (existingUser) {
          alert('该用户名已存在');
          return;
        }

        // 创建一个初始菜谱来添加用户
        const { error } = await supabase
          .from('user_dishes')
          .insert({
            recipe_id: `user_${Date.now()}`,
            recipe_name: '欢迎使用AI美食大师',
            cuisine: '其他',
            ingredients: [],
            steps: [],
            user_name: this.newUser.userName
          });

        if (error) throw error;

        alert('用户添加成功！');
        this.showAddDialog = false;
        this.newUser.userName = '';
        this.loadUsers();
      } catch (err) {
        console.error('Failed to add user:', err);
        alert('添加用户失败：' + err.message);
      }
    },

    confirmDeleteUser(user) {
      this.userToDelete = user;
      this.showDeleteDialog = true;
    },

    async handleDeleteUser() {
      if (!this.userToDelete) return;

      try {
        // 删除用户的所有菜谱
        const { error: dishesError } = await supabase
          .from('user_dishes')
          .delete()
          .eq('user_name', this.userToDelete.userName);

        if (dishesError) throw dishesError;

        // 删除用户的所有评论
        const { error: commentsError } = await supabase
          .from('user_comments')
          .delete()
          .eq('user_name', this.userToDelete.userName);

        if (commentsError) throw commentsError;

        alert('用户删除成功！');
        this.showDeleteDialog = false;
        this.userToDelete = null;
        this.loadUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('删除用户失败：' + err.message);
      }
    },

    viewUser(user) {
      this.selectedUser = user;
      this.showDetailDialog = true;
    }
  }
};
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.management-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e3c72;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
}

.btn-icon {
  font-size: 18px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2a5298;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: #2a5298;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background: #1e3c72;
}

/* 用户表格 */
.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.users-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.users-table tbody tr:hover {
  background: #f8f9fa;
}

.users-table td {
  padding: 1rem;
  font-size: 14px;
}

.user-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.activity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.activity-badge--high {
  background: #e8f5e9;
  color: #2e7d32;
}

.activity-badge--medium {
  background: #fff3e0;
  color: #f57c00;
}

.activity-badge--low {
  background: #f5f5f5;
  color: #757575;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn--view:hover {
  background: #e3f2fd;
}

.action-btn--delete:hover {
  background: #ffebee;
}

/* 空状态 */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 18px;
  color: #999;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-content--large {
  max-width: 600px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  margin: 0 0 1.5rem 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e3c72;
}

.modal-message {
  margin: 0 0 1.5rem 0;
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2a5298;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn--cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn--cancel:hover {
  background: #e0e0e0;
}

.modal-btn--confirm {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.modal-btn--confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 60, 114, 0.3);
}

/* 用户详情 */
.user-detail {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #333;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }

  .management-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 800px;
  }
}
</style>
