/**
 * CuisineDistributionChart组件测试
 * 验证菜系分布图表组件的基本功能
 */

import { mount } from '@vue/test-utils';
import CuisineDistributionChart from '@/components/CuisineDistributionChart.vue';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn()
  }));
});

describe('CuisineDistributionChart.vue', () => {
  it('应该在有数据时渲染图表容器', () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: [
          { cuisine: '川菜', count: 50 },
          { cuisine: '粤菜', count: 30 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
  });

  it('应该在空数据时显示空状态', () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: []
      }
    });
    
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.chart-container').exists()).toBe(false);
    expect(wrapper.find('.empty-message').text()).toBe('暂无数据');
  });

  it('应该显示图表标题', () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: [
          { cuisine: '川菜', count: 50 }
        ]
      }
    });
    
    expect(wrapper.find('.chart-title').text()).toBe('菜系分布');
  });

  it('应该在点击后显示详情弹窗', async () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: [
          { cuisine: '川菜', count: 50 },
          { cuisine: '粤菜', count: 30 }
        ]
      }
    });
    
    // 模拟显示详情
    wrapper.vm.showDetail(0);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.selectedCuisine).toBeTruthy();
    expect(wrapper.vm.selectedCuisine.cuisine).toBe('川菜');
    expect(wrapper.vm.selectedCuisine.count).toBe(50);
  });

  it('应该能关闭详情弹窗', async () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: [
          { cuisine: '川菜', count: 50 }
        ]
      }
    });
    
    wrapper.vm.showDetail(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedCuisine).toBeTruthy();
    
    wrapper.vm.closeDetail();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedCuisine).toBeNull();
  });

  it('应该正确计算百分比', () => {
    const wrapper = mount(CuisineDistributionChart, {
      propsData: {
        cuisineData: [
          { cuisine: '川菜', count: 50 },
          { cuisine: '粤菜', count: 30 },
          { cuisine: '湘菜', count: 20 }
        ]
      }
    });
    
    const chartData = wrapper.vm.chartData;
    expect(chartData.percentages).toEqual(['50.0', '30.0', '20.0']);
  });

  it('应该生成正确数量的颜色', () => {
    const wrapper = mount(CuisineDistributionChart);
    
    const colors = wrapper.vm.generateColors(5);
    expect(colors).toHaveLength(5);
  });
});
