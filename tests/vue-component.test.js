/**
 * Vue组件测试示例
 * 演示如何使用@vue/test-utils测试Vue组件
 */

import { mount } from '@vue/test-utils';
import Vue from 'vue';

// 创建一个简单的测试组件
const TestComponent = Vue.extend({
  template: '<div class="test">{{ message }}</div>',
  props: {
    message: {
      type: String,
      default: 'Hello'
    }
  }
});

describe('Vue组件测试示例', () => {
  it('应该渲染组件', () => {
    const wrapper = mount(TestComponent);
    expect(wrapper.exists()).toBe(true);
  });

  it('应该显示默认消息', () => {
    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('Hello');
  });

  it('应该显示传入的props', () => {
    const wrapper = mount(TestComponent, {
      propsData: {
        message: 'Test Message'
      }
    });
    expect(wrapper.text()).toBe('Test Message');
  });

  it('应该有正确的class', () => {
    const wrapper = mount(TestComponent);
    expect(wrapper.classes()).toContain('test');
  });
});
