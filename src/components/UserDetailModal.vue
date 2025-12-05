<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="user-info-header">
            <h2 class="modal-title">{{ userDetail.userName || '加载中...' }} 的详细信息</h2>
            <div v-if="userDetail.currentRank" class="rank-badge">
              <span class="rank-icon">🏆</span>
              <span class="rank-text">第 {{ userDetail.currentRank }} 名</span>
            </div>
          </div>
          <button class="close-button" @click="closeModal">
            <span class="close-icon">×</span>
          </button>
        </div>

        <div class="modal-content">
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon">🍳</div>
              <div class="stat-content">
                <div class="stat-value">{{ userDetail.dishCount || 0 }}</div>
                <div class="stat-label">菜谱数量</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💬</div>
              <div class="stat-content">
                <div class="stat-value">{{ userDetail.commentCount || 0 }}</div>
                <div class="stat-label">评论数量</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-value">{{ userDetail.activityScore || 0 }}</div>
                <div class="stat-label">活跃度分数</div>
              </div>
            </div>
          </div>

          <div class="tabs">
            <button 
              class="tab-button" 
              :class="{ 'tab-button--active': activeTab === 'dishes', 'tab-button--disabled': loading }"
              @click="!loading && (activeTab = 'dishes')"
              :disabled="loading"
            >
              🍳 菜谱 ({{ userDetail.dishCount || 0 }})
            </button>
            <button 
              class="tab-button" 
              :class="{ 'tab-button--active': activeTab === 'comments', 'tab-button--disabled': loading }"
              @click="!loading && (activeTab = 'comments')"
              :disabled="loading"
            >
              💬 评论 ({{ userDetail.commentCount || 0 }})
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'dishes'" class="content-panel">
              <LoadingSpinner v-if="loading" message="加载菜谱数据..." size="small" />
              <div v-else-if="!userDetail.dishes || userDetail.dishes.length === 0" class="empty-state">
                <span class="empty-icon">🍳</span>
                <p class="empty-text">暂无菜谱</p>
              </div>
              <div v-else class="dishes-list">
                <div v-for="dish in userDetail.dishes" :key="dish.id" class="dish-item">
                  <div class="dish-info">
                    <h4 class="dish-name">{{ dish.name }}</h4>
                    <div class="dish-meta">
                      <span class="meta-item">{{ dish.cuisine || '未知菜系' }}</span>
                      <span class="meta-item">{{ dish.difficulty || '未设置难度' }}</span>
                    </div>
                  </div>
                  <div class="dish-date">{{ formatDate(dish.createdAt) }}</div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'comments'" class="content-panel">
              <LoadingSpinner v-if="loading" message="加载评论数据..." size="small" />
              <div v-else-if="!userDetail.comments || userDetail.comments.length === 0" class="empty-state">
                <span class="empty-icon">💬</span>
                <p class="empty-text">暂无评论</p>
              </div>
              <div v-else class="comments-list">
                <div v-for="comment in userDetail.comments" :key="comment.id" class="comment-item">
                  <div class="comment-content">
                    <p class="comment-text">{{ comment.content }}</p>
                    <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  name: 'UserDetailModal',
  components: {
    LoadingSpinner
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userDetail: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: 'dishes'
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },

    handleOverlayClick() {
      this.closeModal();
    },

    formatDate(dateStr) {
      if (!dateStr) return 'Unknown';
      
      try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return diffMinutes === 0 ? 'Just now' : `${diffMinutes} min ago`;
          }
          return `${diffHours} hours ago`;
        } else if (diffDays === 1) {
          return 'Yesterday';
        } else if (diffDays < 7) {
          return `${diffDays} days ago`;
        } else {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
      } catch (error) {
        return 'Error';
      }
    }
  }
};
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-info-header {
  flex: 1;
}

.modal-title {
  margin: 0 0 0.5rem 0;
  font-size: 20px;
  font-weight: 700;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.rank-icon {
  font-size: 16px;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-icon {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.tab-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tab-button--active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: white;
}

.content-panel {
  padding: 1.5rem;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.dish-info {
  flex: 1;
}

.dish-name {
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dish-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  font-size: 12px;
  color: #666;
  background: rgba(52, 152, 219, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.dish-date {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.comment-content {
  flex: 1;
}

.comment-text {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  word-wrap: break-word;
}

.comment-date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.modal-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-enter-from .modal-container {
  transform: scale(0.7) translateY(-20px);
  opacity: 0;
}

.modal-fade-enter-to {
  opacity: 1;
}

.modal-fade-enter-to .modal-container {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-leave-to .modal-container {
  transform: scale(0.9) translateY(10px);
  opacity: 0;
}

.modal-container {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: 90vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 18px;
  }

  .stats-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-icon {
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .tab-button {
    padding: 0.875rem;
    font-size: 13px;
  }

  .content-panel {
    padding: 1rem;
  }

  .dish-item,
  .comment-item {
    padding: 0.875rem;
  }

  .dish-name {
    font-size: 15px;
  }

  .comment-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
    padding: 0.875rem;
  }

  .stat-icon {
    font-size: 24px;
    margin-bottom: 0;
    margin-right: 0.75rem;
  }

  .tab-button {
    padding: 0.75rem;
    font-size: 12px;
  }

  .dish-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>