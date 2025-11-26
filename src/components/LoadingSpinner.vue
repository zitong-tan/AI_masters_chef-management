<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--small': size === 'small' }">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: '加载中...'
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner--small {
  padding: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner--small .spinner {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin-top: 1rem;
  color: #666;
  font-size: 14px;
}

.loading-spinner--small .loading-message {
  font-size: 12px;
  margin-top: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-spinner {
    padding: 1.5rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-message {
    font-size: 13px;
  }
}
</style>
