<template>
  <div class="recent-comments-list">
    <div class="comments-header">
      <h2 class="comments-title">💬 最新评论</h2>
      <p class="comments-subtitle">最近20条用户评论</p>
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
      >
        <!-- 用户信息 -->
        <div class="comment-header">
          <div class="user-avatar">{{ getUserInitial(comment.userName) }}</div>
          <div class="user-meta">
            <h3 class="user-name">{{ comment.userName }}</h3>
            <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content">
          <p 
            class="comment-text"
            :class="{ 'comment-text--truncated': !comment.expanded && isLongText(comment.content) }"
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
  </div>
</template>

<script>
import { getRecentComments } from '../services/supabaseService';
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
      expandedComments: new Set()
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
}
</style>
