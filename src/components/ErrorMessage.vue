<template>
  <div class="error-message" :class="{ 'error-message--dismissible': dismissible }">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <h4 v-if="title" class="error-title">{{ title }}</h4>
        <p class="error-description">{{ message }}</p>
      </div>
      <button 
        v-if="dismissible" 
        class="error-dismiss" 
        @click="$emit('dismiss')"
        aria-label="关闭错误提示"
      >
        ✕
      </button>
    </div>
    <button 
      v-if="retryable" 
      class="error-retry-btn" 
      @click="$emit('retry')"
    >
      重试
    </button>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: '错误'
    },
    retryable: {
      type: Boolean,
      default: false
    },
    dismissible: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-title {
  margin: 0 0 0.25rem 0;
  color: #c33;
  font-size: 16px;
  font-weight: 600;
}

.error-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.error-dismiss {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.error-dismiss:hover {
  color: #666;
}

.error-retry-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.error-retry-btn:hover {
  background-color: #2980b9;
}

.error-retry-btn:active {
  background-color: #21618c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-message {
    padding: 0.875rem;
  }
  
  .error-icon {
    font-size: 20px;
  }
  
  .error-title {
    font-size: 15px;
  }
  
  .error-description {
    font-size: 13px;
  }
  
  .error-retry-btn {
    width: 100%;
  }
}
</style>
