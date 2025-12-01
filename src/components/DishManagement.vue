<template>
  <div class="dish-management">
    <div class="management-header">
      <h2 class="management-title">🍽️ 菜谱管理</h2>
      <div class="header-actions">
        <button class="action-btn action-btn--export" @click="exportDishes">
          📥 导出数据
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索菜谱名称或用户..."
        @input="handleSearch"
      />
      <select v-model="cuisineFilter" class="filter-select" @change="handleFilter">
        <option value="">全部菜系</option>
        <option v-for="cuisine in cuisineList" :key="cuisine" :value="cuisine">
          {{ cuisine }}
        </option>
      </select>
      <select v-model="difficultyFilter" class="filter-select" @change="handleFilter">
        <option value="">全部难度</option>
        <option value="简单">简单</option>
        <option value="中等">中等</option>
        <option value="困难">困难</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载菜谱数据..." />

    <!-- 错误状态 -->
    <ErrorMessage
      v-else-if="error"
      :message="error"
      title="加载失败"
      :retryable="true"
      @retry="loadDishes"
    />

    <!-- 菜谱网格 -->
    <div v-else class="dishes-grid">
      <div v-for="dish in filteredDishes" :key="dish.id" class="dish-card">
        <div class="dish-header">
          <h3 class="dish-name">{{ dish.recipe_name }}</h3>
          <div class="dish-badges">
            <span v-if="dish.cuisine" class="badge badge--cuisine">{{ dish.cuisine }}</span>
            <span v-if="dish.difficulty" class="badge badge--difficulty" :class="getDifficultyClass(dish.difficulty)">
              {{ dish.difficulty }}
            </span>
          </div>
        </div>

        <div class="dish-info">
          <div class="info-row">
            <span class="info-label">👤 作者:</span>
            <span class="info-value">{{ dish.user_name }}</span>
          </div>
          <div class="info-row" v-if="dish.cooking_time">
            <span class="info-label">⏱️ 时间:</span>
            <span class="info-value">{{ dish.cooking_time }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 创建:</span>
            <span class="info-value">{{ formatDate(dish.created_at) }}</span>
          </div>
        </div>

        <div v-if="dish.cooking_tips" class="dish-tips">
          <p class="tips-text">💡 {{ truncateText(dish.cooking_tips, 80) }}</p>
        </div>

        <div class="dish-actions">
          <button class="action-btn action-btn--view" @click="viewDish(dish)" title="查看详情">
            👁️ 查看
          </button>
          <button class="action-btn action-btn--edit" @click="editDish(dish)" title="编辑">
            ✏️ 编辑
          </button>
          <button class="action-btn action-btn--delete" @click="confirmDeleteDish(dish)" title="删除">
            🗑️ 删除
          </button>
        </div>
      </div>

      <div v-if="filteredDishes.length === 0" class="empty-state">
        <p class="empty-icon">🍽️</p>
        <p class="empty-text">暂无菜谱数据</p>
      </div>
    </div>

    <!-- 菜谱详情对话框 -->
    <div v-if="showDetailDialog" class="modal-overlay" @click="showDetailDialog = false">
      <div class="modal-content modal-content--large" @click.stop>
        <h3 class="modal-title">{{ selectedDish?.recipe_name }}</h3>
        <div v-if="selectedDish" class="dish-detail">
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="detail-row">
              <span class="detail-label">菜系:</span>
              <span class="detail-value">{{ selectedDish.cuisine || '未分类' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">难度:</span>
              <span class="detail-value">{{ selectedDish.difficulty || '未设置' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">烹饪时间:</span>
              <span class="detail-value">{{ selectedDish.cooking_time || '未设置' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">作者:</span>
              <span class="detail-value">{{ selectedDish.user_name }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedDish.ingredients && selectedDish.ingredients.length > 0">
            <h4 class="section-title">食材清单</h4>
            <ul class="ingredients-list">
              <li v-for="(ingredient, index) in selectedDish.ingredients" :key="index">
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <div class="detail-section" v-if="selectedDish.steps && selectedDish.steps.length > 0">
            <h4 class="section-title">制作步骤</h4>
            <ol class="steps-list">
              <li v-for="(step, index) in selectedDish.steps" :key="index">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="detail-section" v-if="selectedDish.cooking_tips">
            <h4 class="section-title">烹饪技巧</h4>
            <p class="tips-content">{{ selectedDish.cooking_tips }}</p>
          </div>

          <div class="detail-section" v-if="selectedDish.user_notes">
            <h4 class="section-title">用户笔记</h4>
            <p class="notes-content">{{ selectedDish.user_notes }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="showDetailDialog = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-message">
          确定要删除菜谱 <strong>{{ dishToDelete?.recipe_name }}</strong> 吗？
          <br />
          此操作无法撤销。
        </p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="showDeleteDialog = false">
            取消
          </button>
          <button class="modal-btn modal-btn--confirm" @click="handleDeleteDish">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="showEditDialog" class="modal-overlay" @click="showEditDialog = false">
      <div class="modal-content modal-content--large" @click.stop>
        <h3 class="modal-title">编辑菜谱</h3>
        <form @submit.prevent="handleEditDish">
          <div class="form-group">
            <label class="form-label">菜谱名称</label>
            <input v-model="editForm.recipe_name" type="text" class="form-input" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">菜系</label>
              <input v-model="editForm.cuisine" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">难度</label>
              <select v-model="editForm.difficulty" class="form-input">
                <option value="">未设置</option>
                <option value="简单">简单</option>
                <option value="中等">中等</option>
                <option value="困难">困难</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">烹饪时间</label>
            <input v-model="editForm.cooking_time" type="text" class="form-input" placeholder="例如: 30分钟" />
          </div>
          <div class="form-group">
            <label class="form-label">烹饪技巧</label>
            <textarea v-model="editForm.cooking_tips" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn--cancel" @click="showEditDialog = false">
              取消
            </button>
            <button type="submit" class="modal-btn modal-btn--confirm">
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import supabase from '../services/supabaseClient';

export default {
  name: 'DishManagement',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      dishes: [],
      filteredDishes: [],
      cuisineList: [],
      loading: false,
      error: null,
      searchQuery: '',
      cuisineFilter: '',
      difficultyFilter: '',
      showDetailDialog: false,
      showDeleteDialog: false,
      showEditDialog: false,
      selectedDish: null,
      dishToDelete: null,
      editForm: {
        recipe_name: '',
        cuisine: '',
        difficulty: '',
        cooking_time: '',
        cooking_tips: ''
      }
    };
  },
  mounted() {
    this.loadDishes();
  },
  methods: {
    async loadDishes() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from('user_dishes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        this.dishes = data || [];
        this.filteredDishes = [...this.dishes];

        // 提取菜系列表
        const cuisines = new Set(this.dishes.map(d => d.cuisine).filter(Boolean));
        this.cuisineList = Array.from(cuisines).sort();
      } catch (err) {
        console.error('Failed to load dishes:', err);
        this.error = '加载菜谱数据失败，请稍后重试';
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

    applyFilters() {
      let result = [...this.dishes];

      // 搜索过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(dish =>
          dish.recipe_name.toLowerCase().includes(query) ||
          dish.user_name.toLowerCase().includes(query)
        );
      }

      // 菜系过滤
      if (this.cuisineFilter) {
        result = result.filter(dish => dish.cuisine === this.cuisineFilter);
      }

      // 难度过滤
      if (this.difficultyFilter) {
        result = result.filter(dish => dish.difficulty === this.difficultyFilter);
      }

      this.filteredDishes = result;
    },

    getDifficultyClass(difficulty) {
      const map = {
        '简单': 'badge--easy',
        '中等': 'badge--medium',
        '困难': 'badge--hard'
      };
      return map[difficulty] || '';
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    viewDish(dish) {
      this.selectedDish = dish;
      this.showDetailDialog = true;
    },

    editDish(dish) {
      this.selectedDish = dish;
      this.editForm = {
        recipe_name: dish.recipe_name,
        cuisine: dish.cuisine || '',
        difficulty: dish.difficulty || '',
        cooking_time: dish.cooking_time || '',
        cooking_tips: dish.cooking_tips || ''
      };
      this.showEditDialog = true;
    },

    async handleEditDish() {
      try {
        const { error } = await supabase
          .from('user_dishes')
          .update(this.editForm)
          .eq('id', this.selectedDish.id);

        if (error) throw error;

        alert('菜谱更新成功！');
        this.showEditDialog = false;
        this.loadDishes();
      } catch (err) {
        console.error('Failed to update dish:', err);
        alert('更新菜谱失败：' + err.message);
      }
    },

    confirmDeleteDish(dish) {
      this.dishToDelete = dish;
      this.showDeleteDialog = true;
    },

    async handleDeleteDish() {
      if (!this.dishToDelete) return;

      try {
        const { error } = await supabase
          .from('user_dishes')
          .delete()
          .eq('id', this.dishToDelete.id);

        if (error) throw error;

        alert('菜谱删除成功！');
        this.showDeleteDialog = false;
        this.dishToDelete = null;
        this.loadDishes();
      } catch (err) {
        console.error('Failed to delete dish:', err);
        alert('删除菜谱失败：' + err.message);
      }
    },

    async exportDishes() {
      try {
        const dataStr = JSON.stringify(this.filteredDishes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dishes_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to export dishes:', err);
        alert('导出失败：' + err.message);
      }
    }
  }
};
</script>

<style scoped>
.dish-management {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn--export {
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

.action-btn--export:hover {
  background: #1e3c72;
  transform: translateY(-2px);
}

/* 过滤栏 */
.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
}

.search-input:focus {
  outline: none;
  border-color: #2a5298;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #2a5298;
}

/* 菜谱网格 */
.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.dish-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.dish-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dish-header {
  margin-bottom: 1rem;
}

.dish-name {
  margin: 0 0 0.5rem 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e3c72;
}

.dish-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge--cuisine {
  background: #e3f2fd;
  color: #1976d2;
}

.badge--difficulty {
  background: #f5f5f5;
  color: #757575;
}

.badge--easy {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge--medium {
  background: #fff3e0;
  color: #f57c00;
}

.badge--hard {
  background: #ffebee;
  color: #c62828;
}

.dish-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.dish-tips {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.tips-text {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.dish-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn--view {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn--view:hover {
  background: #bbdefb;
}

.action-btn--edit {
  background: #fff3e0;
  color: #f57c00;
}

.action-btn--edit:hover {
  background: #ffe0b2;
}

.action-btn--delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn--delete:hover {
  background: #ffcdd2;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
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

/* 模态框样式 */
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content--large {
  max-width: 700px;
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

/* 详情部分 */
.dish-detail {
  margin-bottom: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e3c72;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #333;
}

.ingredients-list,
.steps-list {
  margin: 0;
  padding-left: 1.5rem;
}

.ingredients-list li,
.steps-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.tips-content,
.notes-content {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

/* 表单样式 */
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
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
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

/* 响应式 */
@media (max-width: 768px) {
  .dish-management {
    padding: 1rem;
  }

  .dishes-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
