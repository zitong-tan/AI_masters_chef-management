<template>
  <div class="recent-comments-list">
    <div class="comments-header">
      <h2 class="comments-title">💬 最新评论</h2>
      <p class="comments-subtitle">最近{{ limit }}条用户评论</p>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" message="加载评论数据..." size="small" />

    <!-- 错误状态 -->
    <ErrorMessage 
      v-else-if="error" 
      :message="error" 
      title="加载失败"
      :retryable="true"
      @retry="loadComments"
    />

    <!-- 空数据状态 -->
    <EmptyState 
      v-else-if="!comments || comments.length === 0"
      icon="💭"
      title="暂无评论"
      description="当前没有评论数据"
    />

    <!-- 评论列表 -->
    <div v-else class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-item"
        :class="{ 'comment-item--flagged': comment.flagged }"
      >
        <!-- 不当内容标记 -->
        <div v-if="comment.flagged" class="flag-badge">
          ⚠️ 已标记为不当内容
          <span v-if="comment.flagReason" class="flag-reason">（{{ comment.flagReason }}）</span>
        </div>

        <!-- 用户信息 -->
        <div class="comment-header">
          <div class="user-avatar">{{ getUserInitial(comment.userName) }}</div>
          <div class="user-meta">
            <h3 class="user-name">{{ comment.userName }}</h3>
            <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
          </div>
          
          <!-- 管理员操作按钮 -->
          <div class="admin-actions">
            <button 
              v-if="!comment.flagged"
              class="action-btn action-btn--flag"
              @click="handleFlagComment(comment)"
              title="标记为不当内容"
            >
              🚩 标记
            </button>
            <button 
              v-else
              class="action-btn action-btn--unflag"
              @click="handleUnflagComment(comment)"
              title="取消标记"
            >
              ✓ 取消标记
            </button>
            <button 
              class="action-btn action-btn--delete"
              @click="handleDeleteComment(comment)"
              title="删除评论"
            >
              🗑️ 删除
            </button>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content">
          <p 
            class="comment-text"
            :class="{ 
              'comment-text--truncated': !comment.expanded && isLongText(comment.content),
              'comment-text--flagged': comment.flagged
            }"
          >
            {{ getDisplayText(comment) }}
          </p>
          
          <!-- 展开/收起按钮 -->
          <button 
            v-if="isLongText(comment.content)"
            class="expand-btn"
            @click="toggleExpand(comment.id)"
          >
            {{ comment.expanded ? '收起' : '展开' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-message">确定要删除这条评论吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="cancelDelete">取消</button>
          <button class="modal-btn modal-btn--confirm" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 标记原因对话框 -->
    <div v-if="showFlagDialog" class="modal-overlay" @click="cancelFlag">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">标记不当内容</h3>
        <p class="modal-message">请选择或输入标记原因：</p>
        <div class="flag-reasons">
          <button 
            v-for="reason in flagReasons" 
            :key="reason"
            class="reason-btn"
            :class="{ 'reason-btn--selected': flagReason === reason }"
            @click="flagReason = reason"
          >
            {{ reason }}
          </button>
        </div>
        <input 
          v-model="flagReason" 
          type="text" 
          class="flag-input"
          placeholder="或输入自定义原因"
          maxlength="50"
        />
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="cancelFlag">取消</button>
          <button class="modal-btn modal-btn--confirm" @click="confirmFlag" :disabled="!flagReason">确认标记</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRecentComments, deleteComment, flagComment, unflagComment } from '../services/supabaseService';
import { truncateText, formatDate } from '../utils/dataProcessing';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';
import EmptyState from './EmptyState.vue';

export default {
  name: 'RecentCommentsList',
  components: {
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  },
  props: {
    limit: {
      type: Number,
      default: 20,
      validator: (value) => value > 0 && value <= 100
    },
    maxLength: {
      type: Number,
      default: 100,
      validator: (value) => value > 0
    },
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      comments: [],
      loading: false,
      error: null,
      expandedComments: new Set(),
      // 删除确认对话框
      showDeleteConfirm: false,
      commentToDelete: null,
      // 标记对话框
      showFlagDialog: false,
      commentToFlag: null,
      flagReason: '',
      flagReasons: [
        '垃圾广告',
        '不当言论',
        '恶意攻击',
        '虚假信息',
        '违反规定'
      ]
    };
  },
  mounted() {
    if (this.autoLoad) {
      this.loadComments();
    }
  },
  methods: {
    /**
     * 加载评论数据
     */
    async loadComments() {
      this.loading = true;
      this.error = null;

      try {
        const data = await getRecentComments(this.limit);
        
        // 添加展开状态
        this.comments = data.map(comment => ({
          ...comment,
          expanded: false
        }));

        this.$emit('data-loaded', this.comments);
      } catch (err) {
        console.error('Failed to load recent comments:', err);
        this.error = err.message.includes('timeout') 
          ? '请求超时，请检查网络连接' 
          : '数据加载失败，请稍后重试';
        this.$emit('error', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取用户名首字母
     */
    getUserInitial(userName) {
      if (!userName) return '?';
      return userName.charAt(0).toUpperCase();
    },

    /**
     * 格式化评论时间
     */
    formatCommentTime(createdAt) {
      if (!createdAt) return '';
      
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // 相对时间显示
      if (diffMins < 1) {
        return '刚刚';
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        // 超过7天显示具体日期
        return formatDate(date, 'datetime');
      }
    },

    /**
     * 判断是否为长文本
     */
    isLongText(text) {
      return text && text.length > this.maxLength;
    },

    /**
     * 获取显示文本
     */
    getDisplayText(comment) {
      if (!comment.content) return '';
      
      if (comment.expanded || !this.isLongText(comment.content)) {
        return comment.content;
      }
      
      return truncateText(comment.content, this.maxLength);
    },

    /**
     * 切换展开/收起状态
     */
    toggleExpand(commentId) {
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        comment.expanded = !comment.expanded;
        this.$forceUpdate(); // 强制更新视图
      }
    },

    /**
     * 刷新数据（公开方法）
     */
    refresh() {
      this.loadComments();
    },

    /**
     * 处理删除评论
     */
    handleDeleteComment(comment) {
      this.commentToDelete = comment;
      this.showDeleteConfirm = true;
    },

    /**
     * 确认删除评论
     */
    async confirmDelete() {
      if (!this.commentToDelete) return;

      try {
        await deleteComment(this.commentToDelete.id);
        
        // 从列表中移除
        this.comments = this.comments.filter(c => c.id !== this.commentToDelete.id);
        
        this.$emit('comment-deleted', this.commentToDelete);
        
        // 显示成功提示（可以使用toast组件）
        console.log('评论删除成功');
      } catch (err) {
        console.error('Failed to delete comment:', err);
        this.error = '删除评论失败，请稍后重试';
      } finally {
        this.showDeleteConfirm = false;
        this.commentToDelete = null;
      }
    },

    /**
     * 取消删除
     */
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.commentToDelete = null;
    },

    /**
     * 处理标记评论
     */
    handleFlagComment(comment) {
      this.commentToFlag = comment;
      this.flagReason = '';
      this.showFlagDialog = true;
    },

    /**
     * 确认标记评论
     */
    async confirmFlag() {
      if (!this.commentToFlag || !this.flagReason) return;

      try {
        await flagComment(this.commentToFlag.id, this.flagReason);
        
        // 更新本地状态
        const comment = this.comments.find(c => c.id === this.commentToFlag.id);
        if (comment) {
          comment.flagged = true;
          comment.flagReason = this.flagReason;
        }
        
        this.$emit('comment-flagged', this.commentToFlag);
        
        console.log('评论已标记为不当内容');
      } catch (err) {
        console.error('Failed to flag comment:', err);
        this.error = '标记评论失败，请稍后重试';
      } finally {
        this.showFlagDialog = false;
        this.commentToFlag = null;
        this.flagReason = '';
      }
    },

    /**
     * 取消标记
     */
    cancelFlag() {
      this.showFlagDialog = false;
      this.commentToFlag = null;
      this.flagReason = '';
    },

    /**
     * 处理取消标记评论
     */
    async handleUnflagComment(comment) {
      try {
        await unflagComment(comment.id);
        
        // 更新本地状态
        const localComment = this.comments.find(c => c.id === comment.id);
        if (localComment) {
          localComment.flagged = false;
          localComment.flagReason = null;
        }
        
        this.$emit('comment-unflagged', comment);
        
        console.log('已取消标记');
      } catch (err) {
        console.error('Failed to unflag comment:', err);
        this.error = '取消标记失败，请稍后重试';
      }
    }
  }
};
</script>

<style scoped>
.recent-comments-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comments-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.comments-title {
  margin: 0 0 0.5rem 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.comments-subtitle {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.comment-item:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 不当内容标记 */
.flag-badge {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flag-reason {
  font-weight: 400;
  opacity: 0.8;
}

.comment-item--flagged {
  border-color: #ffc107;
  background: #fffbf0;
}

/* 评论头部 */
.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

/* 管理员操作按钮 */
.admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn--flag {
  color: #ff9800;
  border-color: #ff9800;
}

.action-btn--flag:hover {
  background: #fff3e0;
}

.action-btn--unflag {
  color: #4caf50;
  border-color: #4caf50;
}

.action-btn--unflag:hover {
  background: #e8f5e9;
}

.action-btn--delete {
  color: #f44336;
  border-color: #f44336;
}

.action-btn--delete:hover {
  background: #ffebee;
}

/* 评论内容 */
.comment-content {
  padding-left: 3.25rem;
}

.comment-text {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.comment-text--truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-text--flagged {
  opacity: 0.7;
  text-decoration: line-through;
}

.expand-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  background: #667eea;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.expand-btn:active {
  transform: translateY(0);
}

/* 平板端响应式 */
@media (max-width: 1024px) {
  .recent-comments-list {
    padding: 1.25rem;
  }

  .comments-title {
    font-size: 18px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .comment-content {
    padding-left: 2.75rem;
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .recent-comments-list {
    padding: 1rem;
  }

  .comments-header {
    margin-bottom: 1rem;
  }

  .comments-title {
    font-size: 17px;
  }

  .comments-subtitle {
    font-size: 12px;
  }

  .comments-list {
    gap: 0.875rem;
  }

  .comment-item {
    padding: 0.875rem;
  }

  .user-avatar {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }

  .user-name {
    font-size: 14px;
  }

  .comment-time {
    font-size: 11px;
  }

  .comment-content {
    padding-left: 2.5rem;
  }

  .comment-text {
    font-size: 13px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .recent-comments-list {
    padding: 0.875rem;
  }

  .comments-list {
    gap: 0.75rem;
  }

  .comment-item {
    padding: 0.75rem;
  }

  .comment-header {
    gap: 0.625rem;
    margin-bottom: 0.625rem;
    flex-wrap: wrap;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .user-name {
    font-size: 13px;
    margin-bottom: 0.125rem;
  }

  .comment-time {
    font-size: 10px;
  }

  .comment-content {
    padding-left: 0;
  }

  .comment-text {
    font-size: 12px;
    line-height: 1.5;
  }

  .expand-btn {
    font-size: 11px;
    padding: 0.25rem 0.625rem;
  }

  .admin-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-btn {
    font-size: 11px;
    padding: 0.25rem 0.5rem;
  }
}

/* 模态对话框 */
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
  z-index: 1000;
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
  margin: 0 0 1rem 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.modal-message {
  margin: 0 0 1.5rem 0;
  font-size: 15px;
  color: #666;
  line-height: 1.6;
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
  background: #f44336;
  color: white;
}

.modal-btn--confirm:hover {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.modal-btn--confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 标记原因选择 */
.flag-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reason-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.reason-btn:hover {
  border-color: #ff9800;
  background: #fff3e0;
}

.reason-btn--selected {
  border-color: #ff9800;
  background: #ff9800;
  color: white;
}

.flag-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
}

.flag-input:focus {
  outline: none;
  border-color: #ff9800;
}

/* 移动端模态框 */
@media (max-width: 480px) {
  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-message {
    font-size: 14px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-btn {
    width: 100%;
  }

  .reason-btn {
    font-size: 12px;
    padding: 0.375rem 0.75rem;
  }
}
</style>
