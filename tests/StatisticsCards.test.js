/**
 * StatisticsCards组件测试
 * 验证统计卡片组件的基本功能
 */

import { mount } from '@vue/test-utils';
import StatisticsCards from '@/components/StatisticsCards.vue';

describe('StatisticsCards.vue', () => {
  it('应该渲染所有四个统计卡片', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: {
        stats: {
          totalUsers: 100,
          totalDishes: 500,
          totalComments: 200,
          totalFoods: 300
        }
      }
    });
    
    const cards = wrapper.findAll('.stat-card');
    expect(cards).toHaveLength(4);
  });

  it('应该正确显示统计数据', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: {
        stats: {
          totalUsers: 100,
          totalDishes: 500,
          totalComments: 200,
          totalFoods: 300
        }
      }
    });
    
    const values = wrapper.findAll('.stat-value');
    expect(values.at(0).text()).toBe('100');
    expect(values.at(1).text()).toBe('500');
    expect(values.at(2).text()).toBe('200');
    expect(values.at(3).text()).toBe('300');
  });

  it('应该使用默认值处理空数据', () => {
    const wrapper = mount(StatisticsCards);
    
    const values = wrapper.findAll('.stat-value');
    expect(values.at(0).text()).toBe('0');
    expect(values.at(1).text()).toBe('0');
    expect(values.at(2).text()).toBe('0');
    expect(values.at(3).text()).toBe('0');
  });

  it('应该处理无效数据并使用默认值', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: {
        stats: {
          totalUsers: 'invalid',
          totalDishes: -10,
          totalComments: null,
          totalFoods: undefined
        }
      }
    });
    
    const values = wrapper.findAll('.stat-value');
    // 无效值应该被转换为0
    expect(values.at(0).text()).toBe('0');
    expect(values.at(1).text()).toBe('0');
    expect(values.at(2).text()).toBe('0');
    expect(values.at(3).text()).toBe('0');
  });

  it('应该格式化大数字（添加千位分隔符）', () => {
    const wrapper = mount(StatisticsCards, {
      propsData: {
        stats: {
          totalUsers: 1000,
          totalDishes: 5000,
          totalComments: 10000,
          totalFoods: 50000
        }
      }
    });
    
    const values = wrapper.findAll('.stat-value');
    expect(values.at(0).text()).toBe('1,000');
    expect(values.at(1).text()).toBe('5,000');
    expect(values.at(2).text()).toBe('10,000');
    expect(values.at(3).text()).toBe('50,000');
  });

  it('应该显示正确的标签', () => {
    const wrapper = mount(StatisticsCards);
    
    const labels = wrapper.findAll('.stat-label');
    expect(labels.at(0).text()).toBe('用户总数');
    expect(labels.at(1).text()).toBe('菜谱总数');
    expect(labels.at(2).text()).toBe('评论总数');
    expect(labels.at(3).text()).toBe('食材总数');
  });

  it('应该包含图标', () => {
    const wrapper = mount(StatisticsCards);
    
    const icons = wrapper.findAll('.stat-icon');
    expect(icons).toHaveLength(4);
    expect(icons.at(0).text()).toBe('👥');
    expect(icons.at(1).text()).toBe('🍳');
    expect(icons.at(2).text()).toBe('💬');
    expect(icons.at(3).text()).toBe('🥗');
  });
});
