/**
 * 测试环境验证
 * 验证Jest和fast-check是否正确配置
 */

describe('测试环境配置', () => {
  it('Jest应该正常工作', () => {
    expect(true).toBe(true);
  });

  it('fast-check应该可用', () => {
    const fc = require('fast-check');
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });

  it('Vue Test Utils应该可用', () => {
    const { mount } = require('@vue/test-utils');
    expect(mount).toBeDefined();
    expect(typeof mount).toBe('function');
  });
});
