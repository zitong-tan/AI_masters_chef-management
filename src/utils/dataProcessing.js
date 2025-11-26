/**
 * 数据处理工具函数
 * 用于处理和转换仪表板数据
 */

/**
 * 通用分组聚合函数
 * @param {Array} data - 原始数据数组
 * @param {String} field - 用于分组的字段名
 * @returns {Array} 聚合后的数据，格式: [{[field]: value, count: number}]
 */
export function aggregateByField(data, field) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const aggregated = {};
  
  data.forEach(item => {
    const value = item[field];
    // 跳过null或undefined值
    if (value !== null && value !== undefined) {
      if (!aggregated[value]) {
        aggregated[value] = 0;
      }
      aggregated[value]++;
    }
  });

  // 转换为数组格式并排序
  return Object.entries(aggregated)
    .map(([key, count]) => ({
      [field]: key,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 百分比计算函数
 * @param {Array} data - 包含count字段的数据数组
 * @returns {Array} 添加了percentage字段的数据数组
 */
export function calculatePercentages(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  
  if (total === 0) {
    return data.map(item => ({
      ...item,
      percentage: 0
    }));
  }

  return data.map(item => ({
    ...item,
    percentage: parseFloat(((item.count / total) * 100).toFixed(2))
  }));
}

/**
 * 用户排行计算函数
 * @param {Array} users - 用户数据数组
 * @returns {Array} 排序后的用户排行榜（最多10个）
 */
export function calculateUserRanking(users) {
  if (!Array.isArray(users) || users.length === 0) {
    return [];
  }

  // 计算活跃度分数并排序
  const rankedUsers = users
    .map(user => ({
      ...user,
      activityScore: (user.dishCount || 0) + (user.commentCount || 0)
    }))
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 10) // 限制前10名
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));

  return rankedUsers;
}

/**
 * 紧急程度分类函数
 * @param {Number} daysRemaining - 剩余天数
 * @returns {String} 紧急程度: 'high' | 'medium' | 'low'
 */
export function calculateUrgencyLevel(daysRemaining) {
  if (typeof daysRemaining !== 'number') {
    return 'low';
  }

  if (daysRemaining <= 3) {
    return 'high';
  } else if (daysRemaining <= 7) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * 文本截断函数
 * @param {String} text - 原始文本
 * @param {Number} maxLength - 最大长度
 * @returns {String} 截断后的文本
 */
export function truncateText(text, maxLength = 50) {
  if (typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
}

/**
 * 日期格式化函数
 * @param {String|Date} date - 日期对象或字符串
 * @param {String} format - 格式类型: 'date' | 'datetime' | 'time'
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = 'date') {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'date':
    default:
      return `${year}-${month}-${day}`;
  }
}
