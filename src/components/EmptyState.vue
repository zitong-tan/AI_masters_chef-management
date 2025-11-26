<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📭'
    },
    title: {
      type: String,
      default: '暂无数据'
    },
    description: {
      type: String,
      default: '当前没有可显示的内容'
    }
  }
};
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-title {
  margin: 0 0 0.5rem 0;
  font-size: 18px;
  font-weight: 600;
  color: #666;
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: #999;
  max-width: 400px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 48px;
  }
  
  .empty-title {
    font-size: 16px;
  }
  
  .empty-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 1.5rem 0.75rem;
  }
  
  .empty-icon {
    font-size: 40px;
  }
}
</style>
