<template>
  <div class="food-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">🥬 食材管理中心</h1>
        <p class="page-subtitle">按用户管理食材库存，发送过期预警提醒</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="loadFoods">
          🔄 刷新
        </button>
        <button class="btn btn-primary" @click="showAddDialog = true">
          ➕ 添加食材
        </button>
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="🔍 搜索用户名或食材名称..."
          @input="handleSearch"
        />
        <select v-model="filterStatus" class="filter-select" @change="handleFilter">
          <option value="all">全部食材</option>
          <option value="urgent">紧急(3天内)</option>
          <option value="warning">预警(7天内)</option>
          <option value="normal">正常</option>
        </select>
        <select v-model="selectedUser" class="filter-select" @change="handleUserFilter">
          <option value="all">全部用户</option>
          <option v-for="user in userList" :key="user" :value="user">{{ user }}</option>
        </select>
      </div>
      <div class="toolbar-right">
        <span class="info-badge">总计: {{ foods.length }}</span>
        <span class="info-badge warning">预警: {{ warningCount }}</span>
        <span class="info-badge danger">紧急: {{ urgentCount }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载食材数据..." />

    <!-- 错误状态 -->
    <ErrorMessage
      v-else-if="error"
      :message="error"
      title="加载失败"
      :retryable="true"
      @retry="loadFoods"
    />

    <!-- 按用户分组显示食材 -->
    <div v-else class="user-groups">
      <div v-for="(userFoods, userName) in groupedFoods" :key="userName" class="user-group">
        <div class="user-group-header">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitial(userName) }}</div>
            <div>
              <div class="user-name">{{ userName }}</div>
              <div class="user-stats">
                共 {{ userFoods.length }} 个食材
                <span v-if="getUserUrgentCount(userFoods) > 0" class="urgent-badge">
                  {{ getUserUrgentCount(userFoods) }} 个紧急
                </span>
              </div>
            </div>
          </div>
          <div class="user-actions">
            <button
              v-if="getUserUrgentCount(userFoods) > 0"
              class="btn btn-warning"
              @click="sendUserAlert(userName, userFoods)"
            >
              📢 发送预警
            </button>
            <button class="btn btn-secondary" @click="toggleUserGroup(userName)">
              {{ expandedUsers.includes(userName) ? '收起' : '展开' }}
            </button>
          </div>
        </div>

        <div v-if="expandedUsers.includes(userName)" class="food-list">
          <div
            v-for="food in userFoods"
            :key="food.id"
            class="food-item"
            :class="getFoodClass(food)"
          >
            <div class="food-info">
              <div class="food-name">{{ food.foodName }}</div>
              <div class="food-details">
                <span>数量: {{ food.quantity }} {{ food.unit }}</span>
                <span>过期: {{ formatDate(food.expirationDate) }}</span>
                <span :class="getDaysClass(food.daysRemaining)">
                  剩余: {{ food.daysRemaining }} 天
                </span>
              </div>
            </div>
            <div class="food-actions">
              <button class="btn-icon" @click="handleEditFood(food)" title="编辑">
                ✏️
              </button>
              <button
                v-if="food.daysRemaining <= 7"
                class="btn-icon"
                @click="sendSingleAlert(food)"
                title="发送提醒"
              >
                📢
              </button>
              <button class="btn-icon danger" @click="confirmDeleteFood(food)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(groupedFoods).length === 0" class="empty-state">
        <div class="empty-icon">🥬</div>
        <div class="empty-text">暂无食材数据</div>
      </div>
    </div>

    <!-- 添加食材对话框 -->
    <div v-if="showAddDialog" class="modal-overlay" @click="showAddDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">添加新食材</h3>
        <form @submit.prevent="handleAddFood">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <select v-model="newFood.userName" class="form-input" required>
              <option value="">请选择用户</option>
              <option v-for="user in availableUsers" :key="user" :value="user">
                {{ user }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">食材名称</label>
            <input v-model="newFood.foodName" type="text" class="form-input" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">数量</label>
              <input v-model.number="newFood.quantity" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">单位</label>
              <input v-model="newFood.unit" type="text" class="form-input" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">过期日期</label>
            <input v-model="newFood.expirationDate" type="date" class="form-input" required />
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

    <!-- 编辑食材对话框 -->
    <div v-if="showEditDialog" class="modal-overlay" @click="showEditDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">编辑食材</h3>
        <form @submit.prevent="handleUpdateFood">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <select v-model="editingFood.userName" class="form-input" required>
              <option value="">请选择用户</option>
              <option v-for="user in availableUsers" :key="user" :value="user">
                {{ user }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">食材名称</label>
            <input v-model="editingFood.foodName" type="text" class="form-input" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">数量</label>
              <input v-model.number="editingFood.quantity" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">单位</label>
              <input v-model="editingFood.unit" type="text" class="form-input" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">过期日期</label>
            <input v-model="editingFood.expirationDate" type="date" class="form-input" required />
          </div>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn--cancel" @click="showEditDialog = false">
              取消
            </button>
            <button type="submit" class="modal-btn modal-btn--confirm">
              确认修改
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
          确定要删除食材 <strong>{{ foodToDelete?.foodName }}</strong> 吗？此操作无法撤销。
        </p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="showDeleteDialog = false">
            取消
          </button>
          <button class="modal-btn modal-btn--confirm" @click="handleDeleteFood">
            确认删除
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
  name: 'FoodManagement',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      foods: [],
      filteredFoods: [],
      loading: false,
      error: null,
      searchQuery: '',
      filterStatus: 'all',
      selectedUser: 'all',
      expandedUsers: [],
      showAddDialog: false,
      showEditDialog: false,
      showDeleteDialog: false,
      availableUsers: [], // 可用用户列表
      newFood: {
        userName: '',
        foodName: '',
        quantity: 1,
        unit: 'kg',
        expirationDate: ''
      },
      editingFood: {
        id: null,
        userName: '',
        foodName: '',
        quantity: 1,
        unit: 'kg',
        expirationDate: ''
      },
      foodToDelete: null
    };
  },
  computed: {
    userList() {
      return [...new Set(this.foods.map(f => f.userName))].sort();
    },
    groupedFoods() {
      const groups = {};
      this.filteredFoods.forEach(food => {
        if (!groups[food.userName]) {
          groups[food.userName] = [];
        }
        groups[food.userName].push(food);
      });
      // 按剩余天数排序
      Object.keys(groups).forEach(user => {
        groups[user].sort((a, b) => a.daysRemaining - b.daysRemaining);
      });
      return groups;
    },
    warningCount() {
      return this.foods.filter(f => f.daysRemaining <= 7 && f.daysRemaining > 3).length;
    },
    urgentCount() {
      return this.foods.filter(f => f.daysRemaining <= 3).length;
    }
  },
  mounted() {
    this.loadFoods();
    this.loadAvailableUsers();
  },
  methods: {
    async loadAvailableUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_name')
          .order('user_name');
        
        if (error) throw error;
        this.availableUsers = (data || []).map(u => u.user_name);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    },

    async loadFoods() {
      this.loading = true;
      this.error = null;
      try {
        // 使用 JOIN 查询获取用户名
        const { data, error } = await supabase
          .from('foods')
          .select(`
            id,
            user_id,
            food_name,
            quantity,
            unit,
            expiration_date,
            storage_suggestion,
            created_at,
            users!fk_user (
              user_name
            )
          `)
          .order('expiration_date', { ascending: true });
        
        if (error) throw error;
        
        this.foods = (data || []).map(food => {
          const expirationDate = new Date(food.expiration_date);
          const today = new Date();
          const diffTime = expirationDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            id: food.id,
            userId: food.user_id,
            userName: food.users?.user_name || '未知用户',
            foodName: food.food_name,
            quantity: food.quantity,
            unit: food.unit,
            expirationDate: food.expiration_date,
            daysRemaining: diffDays
          };
        });
        this.applyFilters();
        // 默认展开有紧急食材的用户
        this.expandedUsers = Object.keys(this.groupedFoods).filter(user => 
          this.getUserUrgentCount(this.groupedFoods[user]) > 0
        );
      } catch (err) {
        console.error('Failed to load foods:', err);
        this.error = '加载食材数据失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.applyFilters();
    },

    handleFilter() {
      this.applyFilters();
    },

    handleUserFilter() {
      this.applyFilters();
    },

    applyFilters() {
      let result = [...this.foods];
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(f =>
          f.foodName.toLowerCase().includes(query) ||
          f.userName.toLowerCase().includes(query)
        );
      }
      if (this.filterStatus === 'urgent') {
        result = result.filter(f => f.daysRemaining <= 3);
      } else if (this.filterStatus === 'warning') {
        result = result.filter(f => f.daysRemaining <= 7 && f.daysRemaining > 3);
      } else if (this.filterStatus === 'normal') {
        result = result.filter(f => f.daysRemaining > 7);
      }
      if (this.selectedUser !== 'all') {
        result = result.filter(f => f.userName === this.selectedUser);
      }
      this.filteredFoods = result;
    },

    getUserInitial(userName) {
      return userName ? userName.charAt(0).toUpperCase() : '?';
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('zh-CN');
    },

    getFoodClass(food) {
      if (food.daysRemaining <= 0) return 'food-expired';
      if (food.daysRemaining <= 3) return 'food-urgent';
      if (food.daysRemaining <= 7) return 'food-warning';
      return '';
    },

    getDaysClass(days) {
      if (days <= 0) return 'days-expired';
      if (days <= 3) return 'days-urgent';
      if (days <= 7) return 'days-warning';
      return 'days-normal';
    },

    getUserUrgentCount(userFoods) {
      return userFoods.filter(f => f.daysRemaining <= 7).length;
    },

    toggleUserGroup(userName) {
      const index = this.expandedUsers.indexOf(userName);
      if (index > -1) {
        this.expandedUsers.splice(index, 1);
      } else {
        this.expandedUsers.push(userName);
      }
    },

    sendUserAlert(userName, userFoods) {
      const urgentFoods = userFoods.filter(f => f.daysRemaining <= 7);
      let message = `📢 过期预警通知\n\n用户：${userName}\n\n`;
      urgentFoods.forEach(food => {
        const status = food.daysRemaining <= 0 ? '已过期' : 
                      food.daysRemaining <= 3 ? '紧急' : '预警';
        message += `【${status}】${food.foodName} - 剩余${food.daysRemaining}天\n`;
      });
      message += `\n请及时处理以上食材！`;
      alert(message);
    },

    sendSingleAlert(food) {
      const status = food.daysRemaining <= 0 ? '已过期' : 
                    food.daysRemaining <= 3 ? '紧急' : '预警';
      alert(`📢 过期预警\n\n用户：${food.userName}\n食材：${food.foodName}\n状态：【${status}】\n剩余：${food.daysRemaining}天\n\n请及时处理！`);
    },

    async handleAddFood() {
      try {
        // 先根据用户名查找 user_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('user_name', this.newFood.userName)
          .single();
        
        if (userError || !userData) {
          alert('未找到该用户，请确认用户名是否正确');
          return;
        }
        
        const { error } = await supabase.from('foods').insert({
          user_id: userData.id,
          food_name: this.newFood.foodName,
          quantity: this.newFood.quantity,
          unit: this.newFood.unit,
          expiration_date: this.newFood.expirationDate
        });
        
        if (error) throw error;
        alert('食材添加成功！');
        this.showAddDialog = false;
        this.newFood = { userName: '', foodName: '', quantity: 1, unit: 'kg', expirationDate: '' };
        this.loadFoods();
      } catch (err) {
        alert('添加食材失败：' + err.message);
      }
    },

    handleEditFood(food) {
      this.editingFood = {
        id: food.id,
        userName: food.userName,
        foodName: food.foodName,
        quantity: food.quantity,
        unit: food.unit,
        expirationDate: food.expirationDate
      };
      this.showEditDialog = true;
    },

    async handleUpdateFood() {
      try {
        // 先根据用户名查找 user_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('user_name', this.editingFood.userName)
          .single();
        
        if (userError || !userData) {
          alert('未找到该用户，请确认用户名是否正确');
          return;
        }
        
        const { error } = await supabase.from('foods').update({
          user_id: userData.id,
          food_name: this.editingFood.foodName,
          quantity: this.editingFood.quantity,
          unit: this.editingFood.unit,
          expiration_date: this.editingFood.expirationDate
        }).eq('id', this.editingFood.id);
        
        if (error) throw error;
        alert('食材修改成功！');
        this.showEditDialog = false;
        this.loadFoods();
      } catch (err) {
        alert('修改食材失败：' + err.message);
      }
    },

    confirmDeleteFood(food) {
      this.foodToDelete = food;
      this.showDeleteDialog = true;
    },

    async handleDeleteFood() {
      try {
        const { error } = await supabase.from('foods').delete().eq('id', this.foodToDelete.id);
        if (error) throw error;
        alert('食材删除成功！');
        this.showDeleteDialog = false;
        this.loadFoods();
      } catch (err) {
        alert('删除食材失败：' + err.message);
      }
    }
  }
};
</script>

<style scoped>
.food-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-warning:hover {
  background: #f57c00;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-input {
  flex: 1;
  max-width: 300px;
  padding: 0.75rem 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.toolbar-right {
  display: flex;
  gap: 0.75rem;
}

.info-badge {
  padding: 0.5rem 1rem;
  background: #ecf0f1;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.info-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.info-badge.danger {
  background: #ffebee;
  color: #c62828;
}

.user-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-group {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.user-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.user-stats {
  font-size: 13px;
  opacity: 0.9;
}

.urgent-badge {
  background: rgba(255,152,0,0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: 600;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
}

.food-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
  transition: all 0.2s;
}

.food-item:hover {
  background: #ecf0f1;
  transform: translateX(4px);
}

.food-warning {
  border-left-color: #ff9800;
  background: #fff3e0;
}

.food-urgent {
  border-left-color: #f44336;
  background: #ffebee;
}

.food-expired {
  border-left-color: #9e9e9e;
  background: #f5f5f5;
  opacity: 0.7;
}

.food-info {
  flex: 1;
}

.food-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.food-details {
  display: flex;
  gap: 1.5rem;
  font-size: 13px;
  color: #7f8c8d;
}

.days-normal { color: #4caf50; font-weight: 600; }
.days-warning { color: #ff9800; font-weight: 700; }
.days-urgent { color: #f44336; font-weight: 700; }
.days-expired { color: #9e9e9e; font-weight: 700; }

.food-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid #ecf0f1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #ecf0f1;
  transform: translateY(-2px);
}

.btn-icon.danger:hover {
  background: #ffebee;
  border-color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 16px;
  color: #95a5a6;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-title {
  margin: 0 0 1.5rem 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.modal-message {
  margin: 0 0 1.5rem 0;
  font-size: 15px;
  color: #7f8c8d;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn--cancel {
  background: #ecf0f1;
  color: #7f8c8d;
}

.modal-btn--cancel:hover {
  background: #bdc3c7;
}

.modal-btn--confirm {
  background: #3498db;
  color: white;
}

.modal-btn--confirm:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .food-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-direction: column;
  }
  
  .search-input {
    max-width: none;
  }
  
  .user-group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .food-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .food-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
