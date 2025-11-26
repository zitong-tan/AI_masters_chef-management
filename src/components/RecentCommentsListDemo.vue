<template>
  <div class="demo-container">
    <h1 class="demo-title">最新评论列表组件演示</h1>
    
    <div class="demo-section">
      <h2>实时数据演示</h2>
      <RecentCommentsList 
        :limit="20"
        :maxLength="100"
        @data-loaded="handleDataLoaded"
        @error="handleError"
      />
    </div>

    <div class="demo-section">
      <h2>模拟数据演示（短评论）</h2>
      <RecentCommentsList 
        :limit="5"
        :maxLength="50"
        :autoLoad="false"
        ref="mockShortComments"
      />
      <button @click="loadMockShortData" class="demo-btn">加载模拟数据</button>
    </div>

    <div class="demo-section">
      <h2>模拟数据演示（长评论）</h2>
      <RecentCommentsList 
        :limit="5"
        :maxLength="80"
        :autoLoad="false"
        ref="mockLongComments"
      />
      <button @click="loadMockLongData" class="demo-btn">加载模拟数据</button>
    </div>

    <div class="demo-section">
      <h2>空数据状态演示</h2>
      <RecentCommentsList 
        :autoLoad="false"
        ref="emptyComments"
      />
      <button @click="loadEmptyData" class="demo-btn">显示空状态</button>
    </div>

    <div v-if="loadedData" class="demo-info">
      <h3>加载的数据信息</h3>
      <pre>{{ JSON.stringify(loadedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import RecentCommentsList from './RecentCommentsList.vue';

export default {
  name: 'RecentCommentsListDemo',
  components: {
    RecentCommentsList
  },
  data() {
    return {
      loadedData: null
    };
  },
  methods: {
    handleDataLoaded(data) {
      console.log('Comments loaded:', data);
      this.loadedData = {
        count: data.length,
        sample: data.slice(0, 3)
      };
    },
    handleError(error) {
      console.error('Error loading comments:', error);
    },
    loadMockShortData() {
      const mockData = [
        {
          id: 1,
          userName: '美食家小王',
          content: '这道菜真的太好吃了！',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: 2,
          userName: '厨艺达人',
          content: '做法简单，味道不错',
          createdAt: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
          id: 3,
          userName: '吃货小李',
          content: '已收藏，准备试试',
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
        },
        {
          id: 4,
          userName: '烹饪新手',
          content: '请问需要什么调料？',
          createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
        },
        {
          id: 5,
          userName: '美食博主',
          content: '非常棒的菜谱！',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      this.$refs.mockShortComments.comments = mockData.map(c => ({ ...c, expanded: false }));
      this.$refs.mockShortComments.loading = false;
      this.$refs.mockShortComments.error = null;
    },
    loadMockLongData() {
      const mockData = [
        {
          id: 6,
          userName: '资深厨师',
          content: '这道菜的做法非常讲究，首先要选用新鲜的食材，然后按照步骤一步步来。火候的掌握很重要，不能太大也不能太小。调料的配比也需要精确，这样才能做出最好的味道。我已经做了很多次了，每次都很成功。',
          createdAt: new Date(Date.now() - 10 * 60000).toISOString()
        },
        {
          id: 7,
          userName: '美食评论家',
          content: '从专业角度来看，这道菜的色香味俱全。色泽鲜艳，香气扑鼻，味道更是一绝。无论是食材的选择还是烹饪技巧的运用，都体现了作者深厚的厨艺功底。强烈推荐大家尝试！',
          createdAt: new Date(Date.now() - 45 * 60000).toISOString()
        },
        {
          id: 8,
          userName: '家庭主妇',
          content: '我按照这个菜谱做了，家人都说好吃。特别是孩子，平时不爱吃蔬菜，这次居然吃了好多。感谢分享这么好的菜谱，以后会经常做给家人吃。',
          createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
        },
        {
          id: 9,
          userName: '营养师',
          content: '这道菜不仅美味，而且营养均衡。富含蛋白质、维生素和矿物质，非常适合日常食用。建议大家可以根据自己的口味适当调整调料的用量。',
          createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
        },
        {
          id: 10,
          userName: '美食爱好者',
          content: '看起来很不错，我也想试试。不过我是新手，可能需要多练习几次才能做好。希望作者能多分享一些烹饪技巧和注意事项，这样对新手会更友好。',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ];

      this.$refs.mockLongComments.comments = mockData.map(c => ({ ...c, expanded: false }));
      this.$refs.mockLongComments.loading = false;
      this.$refs.mockLongComments.error = null;
    },
    loadEmptyData() {
      this.$refs.emptyComments.comments = [];
      this.$refs.emptyComments.loading = false;
      this.$refs.emptyComments.error = null;
    }
  }
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.demo-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #555;
  margin: 0 0 1.5rem 0;
}

.demo-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.demo-btn:active {
  transform: translateY(0);
}

.demo-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f0f0;
  border-radius: 8px;
}

.demo-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.demo-info pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 1rem;
  }

  .demo-title {
    font-size: 24px;
  }

  .demo-section {
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .demo-section h2 {
    font-size: 18px;
  }
}
</style>
