<template>
  <div class="comment-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">💬 评论管理中心</h1>
        <p class="page-subtitle">审核、编辑和管理用户评论内容</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="loadComments">
          🔄 刷新
        </button>
        <button class="btn btn-primary" @click="showAddDialog = true">
          ➕ 添加评论
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
          placeholder="🔍 搜索用户名或评论内容..."
          @input="handleSearch"
        />
        <select v-model="filterStatus" class="filter-select" @change="handleFilter">
          <option value="all">全部评论</option>
          <option value="flagged">已标记</option>
          <option value="normal">正常</option>
        </select>
      </div>
      <div class="toolbar-right">
        <span class="info-badge">总计: {{ comments.length }}</span>
        <span class="info-badge">显示: {{ filteredComments.length }}</span>
        <span class="info-badge warning">已标记: {{ flaggedCount }}</span>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedComments.length > 0" class="batch-bar">
      <div class="batch-info">
        <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="checkbox" />
        <span>已选择 <strong>{{ selectedComments.length }}</strong> 条评论</span>
      </div>
      <div class="batch-actions">
        <button class="btn-batch btn-batch-flag" @click="batchFlag">🚩 批量标记</button>
        <button class="btn-batch btn-batch-delete" @click="batchDelete">🗑️ 批量删除</button>
        <button class="btn-batch btn-batch-export" @click="exportComments">📥 导出</button>
        <button class="btn-batch btn-batch-cancel" @click="clearSelection">✕ 取消</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载评论数据..." />

    <!-- 错误状态 -->
    <ErrorMessage
      v-else-if="error"
      :message="error"
      title="加载失败"
      :retryable="true"
      @retry="loadComments"
    />

    <!-- 评论列表 -->
    <div v-else class="comment-list">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="comment-item"
        :class="{
          'comment-flagged': comment.flagged,
          'comment-selected': isSelected(comment.id)
        }"
      >
        <div class="comment-select">
          <input
            type="checkbox"
            :checked="isSelected(comment.id)"
            @change="toggleSelection(comment.id)"
            class="checkbox"
          />
        </div>

        <div class="comment-body">
          <div v-if="comment.flagged" class="flag-indicator">
            ⚠️ 已标记: {{ comment.flagReason }}
          </div>

          <div class="comment-header">
            <div class="user-info">
              <div class="avatar">{{ getUserInitial(comment.userName) }}</div>
              <div>
                <div class="user-name">{{ comment.userName }}</div>
                <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
              </div>
            </div>

            <div class="comment-actions">
              <button class="btn-icon" @click="handleEditComment(comment)" title="编辑">
                ✏️
              </button>
              <button
                v-if="!comment.flagged"
                class="btn-icon"
                @click="handleFlagComment(comment)"
                title="标记"
              >
                🚩
              </button>
              <button
                v-else
                class="btn-icon"
                @click="handleUnflagComment(comment)"
                title="取消标记"
              >
                ✓
              </button>
              <button class="btn-icon danger" @click="confirmDeleteComment(comment)" title="删除">
                🗑️
              </button>
            </div>
          </div>

          <div class="comment-content" :class="{ 'content-flagged': comment.flagged }">
            {{ comment.content }}
          </div>
        </div>
      </div>

      <div v-if="filteredComments.length === 0" class="empty-state">
        <div class="empty-icon">💭</div>
        <div class="empty-text">暂无评论数据</div>
      </div>
    </div>

    <!-- 对话框组件 -->
    <CommentDialog
      v-if="showAddDialog"
      title="添加新评论"
      :comment="newComment"
      @close="showAddDialog = false"
      @submit="handleAddComment"
    />

    <CommentDialog
      v-if="showEditDialog"
      title="编辑评论"
      :comment="editingComment"
      @close="showEditDialog = false"
      @submit="handleUpdateComment"
    />

    <ConfirmDialog
      v-if="showDeleteDialog"
      title="确认删除"
      :message="`确定要删除 ${commentToDelete?.userName} 的评论吗？此操作无法撤销。`"
      @close="showDeleteDialog = false"
      @confirm="handleDeleteComment"
    />

    <FlagDialog
      v-if="showFlagDialog"
      :reasons="flagReasons"
      @close="cancelFlag"
      @confirm="confirmFlag"
    />
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import { getRecentComments, deleteComment, flagComment, unflagComment } from '../services/supabaseService';
import supabase from '../services/supabaseClient';

export default {
  name: 'CommentManagement',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      comments: [],
      filteredComments: [],
      loading: false,
      error: null,
      searchQuery: '',
      filterStatus: 'all',
      selectedComments: [],
      showAddDialog: false,
      showEditDialog: false,
      showDeleteDialog: false,
      showFlagDialog: false,
      newComment: { userName: '', content: '' },
      editingComment: { id: null, userName: '', content: '' },
      commentToDelete: null,
      commentToFlag: null,
      flagReason: '',
      flagReasons: ['垃圾广告', '不当言论', '恶意攻击', '虚假信息', '违反规定']
    };
  },
  computed: {
    flaggedCount() {
      return this.comments.filter(c => c.flagged).length;
    },
    isAllSelected() {
      return this.filteredComments.length > 0 && 
             this.selectedComments.length === this.filteredComments.length;
    }
  },
  mounted() {
    this.loadComments();
  },
  methods: {
    async loadComments() {
      this.loading = true;
      this.error = null;
      try {
        const data = await getRecentComments(100);
        this.comments = data;
        this.applyFilters();
      } catch (err) {
        console.error('Failed to load comments:', err);
        this.error = '加载评论数据失败，请稍后重试';
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
      let result = [...this.comments];
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(c =>
          c.userName.toLowerCase().includes(query) ||
          c.content.toLowerCase().includes(query)
        );
      }
      if (this.filterStatus === 'flagged') {
        result = result.filter(c => c.flagged);
      } else if (this.filterStatus === 'normal') {
        result = result.filter(c => !c.flagged);
      }
      this.filteredComments = result;
    },

    getUserInitial(userName) {
      return userName ? userName.charAt(0).toUpperCase() : '?';
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('zh-CN');
    },

    isSelected(id) {
      return this.selectedComments.includes(id);
    },

    toggleSelection(id) {
      const index = this.selectedComments.indexOf(id);
      if (index > -1) {
        this.selectedComments.splice(index, 1);
      } else {
        this.selectedComments.push(id);
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedComments = [];
      } else {
        this.selectedComments = this.filteredComments.map(c => c.id);
      }
    },

    clearSelection() {
      this.selectedComments = [];
    },

    async handleAddComment() {
      if (!this.newComment.userName.trim() || !this.newComment.content.trim()) {
        alert('请填写完整信息');
        return;
      }
      try {
        const { error } = await supabase.from('user_comments').insert({
          user_name: this.newComment.userName,
          comment_text: this.newComment.content
        });
        if (error) throw error;
        alert('评论添加成功！');
        this.showAddDialog = false;
        this.newComment = { userName: '', content: '' };
        this.loadComments();
      } catch (err) {
        console.error('Failed to add comment:', err);
        alert('添加评论失败：' + err.message);
      }
    },

    handleEditComment(comment) {
      this.editingComment = {
        id: comment.id,
        userName: comment.userName,
        content: comment.content
      };
      this.showEditDialog = true;
    },

    async handleUpdateComment() {
      try {
        const { error } = await supabase.from('user_comments').update({
          user_name: this.editingComment.userName,
          comment_text: this.editingComment.content
        }).eq('id', this.editingComment.id);
        if (error) throw error;
        alert('评论修改成功！');
        this.showEditDialog = false;
        this.loadComments();
      } catch (err) {
        alert('修改评论失败：' + err.message);
      }
    },

    confirmDeleteComment(comment) {
      this.commentToDelete = comment;
      this.showDeleteDialog = true;
    },

    async handleDeleteComment() {
      try {
        await deleteComment(this.commentToDelete.id);
        alert('评论删除成功！');
        this.showDeleteDialog = false;
        this.loadComments();
      } catch (err) {
        alert('删除评论失败：' + err.message);
      }
    },

    handleFlagComment(comment) {
      this.commentToFlag = comment;
      this.showFlagDialog = true;
    },

    async confirmFlag(reason) {
      try {
        await flagComment(this.commentToFlag.id, reason);
        const comment = this.comments.find(c => c.id === this.commentToFlag.id);
        if (comment) {
          comment.flagged = true;
          comment.flagReason = reason;
        }
        alert('评论已标记');
        this.showFlagDialog = false;
        this.applyFilters();
      } catch (err) {
        alert('标记失败：' + err.message);
      }
    },

    cancelFlag() {
      this.showFlagDialog = false;
      this.commentToFlag = null;
    },

    async handleUnflagComment(comment) {
      try {
        await unflagComment(comment.id);
        const localComment = this.comments.find(c => c.id === comment.id);
        if (localComment) {
          localComment.flagged = false;
          localComment.flagReason = null;
        }
        alert('已取消标记');
        this.applyFilters();
      } catch (err) {
        alert('取消标记失败：' + err.message);
      }
    },

    async batchDelete() {
      if (!confirm(`确定要删除选中的 ${this.selectedComments.length} 条评论吗？`)) return;
      try {
        const { error } = await supabase.from('user_comments').delete().in('id', this.selectedComments);
        if (error) throw error;
        alert(`成功删除 ${this.selectedComments.length} 条评论！`);
        this.clearSelection();
        this.loadComments();
      } catch (err) {
        alert('批量删除失败：' + err.message);
      }
    },

    async batchFlag() {
      const reason = prompt('请输入标记原因：', '批量标记为不当内容');
      if (!reason) return;
      this.selectedComments.forEach(id => {
        const comment = this.comments.find(c => c.id === id);
        if (comment) {
          comment.flagged = true;
          comment.flagReason = reason;
        }
      });
      alert(`成功标记 ${this.selectedComments.length} 条评论！`);
      this.clearSelection();
      this.applyFilters();
    },

    exportComments() {
      const data = this.selectedComments.length > 0
        ? this.comments.filter(c => this.selectedComments.includes(c.id))
        : this.filteredComments;
      const csv = this.convertToCSV(data);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `评论数据_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      alert('评论数据导出成功！');
    },

    convertToCSV(data) {
      const headers = ['ID', '用户名', '评论内容', '创建时间', '标记状态', '标记原因'];
      const rows = data.map(c => [
        c.id,
        c.userName,
        `"${c.content.replace(/"/g, '""')}"`,
        this.formatDate(c.createdAt),
        c.flagged ? '已标记' : '正常',
        c.flagReason || '-'
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }
};
</script>

<style scoped>
.comment-management {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-input {
  flex: 1;
  max-width: 400px;
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

.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 14px;
  color: #1565c0;
}

.batch-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-batch {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-batch-flag { background: #ff9800; }
.btn-batch-flag:hover { background: #f57c00; }
.btn-batch-delete { background: #f44336; }
.btn-batch-delete:hover { background: #d32f2f; }
.btn-batch-export { background: #4caf50; }
.btn-batch-export:hover { background: #388e3c; }
.btn-batch-cancel { background: #757575; }
.btn-batch-cancel:hover { background: #616161; }

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.comment-flagged {
  background: #fffbf0;
  border-left: 4px solid #ff9800;
}

.comment-selected {
  border: 2px solid #3498db;
  background: #f0f8ff;
}

.comment-select {
  display: flex;
  align-items: flex-start;
  padding-top: 0.5rem;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.comment-body {
  flex: 1;
}

.flag-indicator {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 1rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.comment-time {
  font-size: 12px;
  color: #95a5a6;
}

.comment-actions {
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

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #34495e;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.content-flagged {
  opacity: 0.6;
  text-decoration: line-through;
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

@media (max-width: 768px) {
  .comment-management {
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
}
</style>
