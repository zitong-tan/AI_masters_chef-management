<template>
  <button 
    class="refresh-button" 
    :class="{ 'refresh-button--loading': loading, 'refresh-button--small': size === 'small' }"
    :disabled="loading"
    @click="handleClick"
    :aria-label="loading ? '正在刷新' : '刷新数据'"
  >
    <span class="refresh-icon" :class="{ 'refresh-icon--spinning': loading }">
      🔄
    </span>
    <span v-if="showLabel" class="refresh-label">
      {{ loading ? loadingText : label }}
    </span>
  </button>
</template>

<script>
export default {
  name: 'RefreshButton',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: '刷新'
    },
    loadingText: {
      type: String,
      default: '刷新中...'
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['small', 'normal'].includes(value)
    }
  },
  methods: {
    handleClick() {
      if (!this.loading) {
        this.$emit('refresh');
      }
    }
  }
};
</script>

<style scoped>
.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-button:hover:not(:disabled) {
  background-color: #2980b9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.refresh-button:active:not(:disabled) {
  background-color: #21618c;
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-button--small {
  padding: 0.5rem 0.75rem;
  font-size: 13px;
}

.refresh-icon {
  display: inline-block;
  font-size: 16px;
  transition: transform 0.3s;
}

.refresh-button--small .refresh-icon {
  font-size: 14px;
}

.refresh-icon--spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-label {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .refresh-button {
    padding: 0.5rem 0.875rem;
    font-size: 13px;
  }
  
  .refresh-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .refresh-button {
    padding: 0.5rem 0.75rem;
  }
  
  /* 在小屏幕上可以隐藏标签，只显示图标 */
  .refresh-button.icon-only .refresh-label {
    display: none;
  }
}
</style>
