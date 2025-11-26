/**
 * DishTrendChart组件测试
 * 验证菜谱趋势图表组件的基本功能
 */

import { mount } from '@vue/test-utils';
import DishTrendChart from '@/components/DishTrendChart.vue';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn()
  }));
});

describe('DishTrendChart.vue', () => {
  it('应该在有数据时渲染图表容器', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 15 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
  });

  it('应该在空数据时显示空状态', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: []
      }
    });
    
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.chart-container').exists()).toBe(false);
    expect(wrapper.find('.empty-message').text()).toBe('暂无数据');
  });

  it('应该显示图表标题', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-title').text()).toBe('菜谱创建趋势');
  });

  it('应该显示时间范围选择器', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 }
        ]
      }
    });
    
    const rangeButtons = wrapper.findAll('.range-btn');
    expect(rangeButtons).toHaveLength(3);
    expect(rangeButtons.at(0).text()).toBe('日');
    expect(rangeButtons.at(1).text()).toBe('周');
    expect(rangeButtons.at(2).text()).toBe('月');
  });

  it('应该默认选中"日"时间范围', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 }
        ]
      }
    });
    
    expect(wrapper.vm.selectedRange).toBe('day');
    const activeButton = wrapper.find('.range-btn.active');
    expect(activeButton.text()).toBe('日');
  });

  it('应该能切换时间范围', async () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 }
        ]
      }
    });
    
    const rangeButtons = wrapper.findAll('.range-btn');
    await rangeButtons.at(1).trigger('click');
    
    expect(wrapper.vm.selectedRange).toBe('week');
    expect(wrapper.emitted('time-range-change')).toBeTruthy();
    expect(wrapper.emitted('time-range-change')[0]).toEqual(['week']);
  });

  it('应该正确格式化日期标签（日视图）', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-15', count: 10 }
        ],
        timeRange: 'day'
      }
    });
    
    const label = wrapper.vm.formatDateLabel('2024-01-15');
    expect(label).toBe('1/15');
  });

  it('应该正确格式化日期标签（月视图）', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-15', count: 10 }
        ],
        timeRange: 'month'
      }
    });
    
    wrapper.vm.selectedRange = 'month';
    const label = wrapper.vm.formatDateLabel('2024-01-15');
    expect(label).toBe('2024/01');
  });

  it('应该正确格式化工具提示日期', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-05', count: 10 }
        ]
      }
    });
    
    const formatted = wrapper.vm.formatTooltipDate('2024-01-05');
    expect(formatted).toBe('2024-01-05');
  });

  it('应该接受有效的timeRange prop', () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [],
        timeRange: 'week'
      }
    });
    
    expect(wrapper.vm.selectedRange).toBe('week');
  });

  it('应该验证trendData prop格式', () => {
    const validator = DishTrendChart.props.trendData.validator;
    
    expect(validator([
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 }
    ])).toBe(true);
    
    expect(validator([
      { date: '2024-01-01' } // 缺少count
    ])).toBe(false);
    
    expect(validator([
      { count: 10 } // 缺少date
    ])).toBe(false);
  });

  it('应该在数据更新时重新渲染图表', async () => {
    const wrapper = mount(DishTrendChart, {
      propsData: {
        trendData: [
          { date: '2024-01-01', count: 10 }
        ]
      }
    });
    
    const updateChartSpy = jest.spyOn(wrapper.vm, 'updateChart');
    
    await wrapper.setProps({
      trendData: [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 }
      ]
    });
    
    expect(updateChartSpy).toHaveBeenCalled();
  });
});
