/**
 * DifficultyDistributionChart组件测试
 * 验证菜谱难度分布图表组件的基本功能
 */

import { mount } from '@vue/test-utils';
import DifficultyDistributionChart from '@/components/DifficultyDistributionChart.vue';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn()
  }));
});

describe('DifficultyDistributionChart.vue', () => {
  it('应该在有数据时渲染图表容器', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 45 },
          { difficulty: '中等', count: 78 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
  });

  it('应该在空数据时显示空状态', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: []
      }
    });
    
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.chart-container').exists()).toBe(false);
    expect(wrapper.find('.empty-message').text()).toBe('暂无数据');
  });

  it('应该显示图表标题', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 45 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-title').text()).toBe('菜谱难度分布');
  });

  it('应该正确计算百分比', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 50 },
          { difficulty: '中等', count: 30 },
          { difficulty: '困难', count: 20 }
        ]
      }
    });
    
    const chartDataWithPercentages = wrapper.vm.chartDataWithPercentages;
    expect(chartDataWithPercentages[0].percentage).toBe(50);
    expect(chartDataWithPercentages[1].percentage).toBe(30);
    expect(chartDataWithPercentages[2].percentage).toBe(20);
  });

  it('应该处理未分类数据', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 35 },
          { difficulty: '中等', count: 52 },
          { difficulty: '困难', count: 18 },
          { difficulty: '未分类', count: 12 }
        ]
      }
    });
    
    const chartDataWithPercentages = wrapper.vm.chartDataWithPercentages;
    const unclassified = chartDataWithPercentages.find(item => item.difficulty === '未分类');
    
    expect(unclassified).toBeTruthy();
    expect(unclassified.count).toBe(12);
    expect(unclassified.color).toBe('#9E9E9E');
  });

  it('应该为不同难度级别分配正确的颜色', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 45 },
          { difficulty: '中等', count: 78 },
          { difficulty: '困难', count: 23 }
        ]
      }
    });
    
    const chartDataWithPercentages = wrapper.vm.chartDataWithPercentages;
    
    expect(chartDataWithPercentages[0].color).toBe('#4CAF50'); // 简单 - 绿色
    expect(chartDataWithPercentages[1].color).toBe('#FF9800'); // 中等 - 橙色
    expect(chartDataWithPercentages[2].color).toBe('#F44336'); // 困难 - 红色
  });

  it('应该显示统计信息列表', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 45 },
          { difficulty: '中等', count: 78 }
        ]
      }
    });
    
    expect(wrapper.find('.stats-summary').exists()).toBe(true);
    expect(wrapper.findAll('.stat-item')).toHaveLength(2);
  });

  it('应该在统计列表中显示数量和百分比', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 50 },
          { difficulty: '中等', count: 50 }
        ]
      }
    });
    
    const statItems = wrapper.findAll('.stat-item');
    const firstItem = statItems.at(0);
    
    expect(firstItem.find('.difficulty-name').text()).toBe('简单');
    expect(firstItem.find('.count').text()).toBe('50');
    expect(firstItem.find('.percentage').text()).toBe('50%');
  });

  it('应该在空数据时不显示统计信息', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: []
      }
    });
    
    expect(wrapper.find('.stats-summary').exists()).toBe(false);
  });

  it('百分比总和应该等于100%', () => {
    const wrapper = mount(DifficultyDistributionChart, {
      propsData: {
        difficultyData: [
          { difficulty: '简单', count: 33 },
          { difficulty: '中等', count: 33 },
          { difficulty: '困难', count: 34 }
        ]
      }
    });
    
    const chartDataWithPercentages = wrapper.vm.chartDataWithPercentages;
    const totalPercentage = chartDataWithPercentages.reduce(
      (sum, item) => sum + item.percentage, 
      0
    );
    
    // 允许0.1%的浮点误差
    expect(Math.abs(totalPercentage - 100)).toBeLessThanOrEqual(0.1);
  });
});
