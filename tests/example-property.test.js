/**
 * 属性测试示例
 * 演示如何使用fast-check进行属性测试
 */

const fc = require('fast-check');

describe('属性测试示例', () => {
  // 示例：数组反转两次应该得到原数组
  it('数组反转两次应该返回原数组', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const reversed = arr.slice().reverse();
          const doubleReversed = reversed.slice().reverse();
          return JSON.stringify(doubleReversed) === JSON.stringify(arr);
        }
      ),
      { numRuns: 100 }
    );
  });

  // 示例：加法交换律
  it('加法应该满足交换律', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          return a + b === b + a;
        }
      ),
      { numRuns: 100 }
    );
  });

  // 示例：字符串长度属性
  it('连接两个字符串的长度应该等于两个字符串长度之和', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (str1, str2) => {
          const combined = str1 + str2;
          return combined.length === str1.length + str2.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
