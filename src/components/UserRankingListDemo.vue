<template>
  <div class="user-ranking-demo">
    <h1>用户排行榜组件演示</h1>
    
    <div class="demo-section">
      <h2>实时数据（从Supabase加载）</h2>
      <UserRankingList 
        ref="rankingList"
        :limit="10"
        @user-click="handleUserClick"
        @data-loaded="handleDataLoaded"
        @error="handleError"
      />
    </div>

    <div class="demo-section">
      <h2>模拟数据演示</h2>
      <UserRankingList 
        :auto-load="false"
        ref="mockRankingList"
      />
      <button @click="loadMockData" class="demo-button">加载模拟数据</button>
    </div>

    <!-- 用户详情弹窗 -->
    <div v-if="selectedUser" class="user-detail-modal" @click="selectedUser = null">
      <div class="modal-content" @click.stop>
        <h3>用户详情</h3>
        <p><strong>用户名:</strong> {{ selectedUser.userName }}</p>
        <p><strong>排名:</strong> 第 {{ selectedUser.rank }} 名</p>
        <p><strong>菜谱数:</strong> {{ selectedUser.dishCount }}</p>
        <p><strong>评论数:</strong> {{ selectedUser.commentCount }}</p>
        <p><strong>活跃度分数:</strong> {{ selectedUser.activityScore }}</p>
        <button @click="selectedUser = null" class="close-button">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import UserRankingList from './UserRankingList.vue';

export default {
  name: 'UserRankingListDemo',
  components: {
    UserRankingList
  },
  data() {
    return {
      selectedUser: null
    };
  },
  methods: {
    handleUserClick(user) {
      console.log('User clicked:', user);
      this.selectedUser = user;
    },
    handleDataLoaded(users) {
      console.log('Data loaded:', users);
    },
    handleError(error) {
      console.error('Error loading data:', error);
    },
    loadMockData() {
      // 模拟数据
      const mockUsers = [
        { userName: '美食达人小王', dishCount: 45, commentCount: 120, activityScore: 165, rank: 1 },
        { userName: '厨艺大师李师傅', dishCount: 38, commentCount: 95, activityScore: 133, rank: 2 },
        { userName: '家常菜爱好者', dishCount: 30, commentCount: 88, activityScore: 118, rank: 3 },
        { userName: '烘焙小能手', dishCount: 25, commentCount: 70, activityScore: 95, rank: 4 },
        { userName: '川菜专家', dishCount: 22, commentCount: 65, activityScore: 87, rank: 5 },
        { userName: '粤菜传人', dishCount: 20, commentCount: 60, activityScore: 80, rank: 6 },
        { userName: '素食主义者', dishCount: 18, commentCount: 55, activityScore: 73, rank: 7 },
        { userName: '快手料理王', dishCount: 15, commentCount: 50, activityScore: 65, rank: 8 },
        { userName: '甜品制作师', dishCount: 12, commentCount: 45, activityScore: 57, rank: 9 },
        { userName: '营养搭配师', dishCount: 10, commentCount: 40, activityScore: 50, rank: 10 }
      ];

      // 直接设置模拟数据到组件
      this.$refs.mockRankingList.users = mockUsers;
      this.$refs.mockRankingList.loading = false;
      this.$refs.mockRankingList.error = null;
    }
  }
};
</script>

<style scoped>
.user-ranking-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.demo-section h2 {
  margin-top: 0;
  color: #666;
  font-size: 18px;
}

.demo-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.demo-button:hover {
  background: #2980b9;
}

/* 用户详情弹窗 */
.user-detail-modal {
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-content p {
  margin: 0.75rem 0;
  color: #666;
}

.close-button {
  margin-top: 1.5rem;
  padding: 0.5rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
}

.close-button:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .user-ranking-demo {
    padding: 1rem;
  }

  .demo-section {
    padding: 1rem;
  }
}
</style>
