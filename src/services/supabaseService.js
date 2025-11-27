import supabase from './supabaseClient'

// 超时控制常量（10秒）
const TIMEOUT_MS = 10000

/**
 * 创建带超时控制的Promise
 * @param {Promise} promise - 原始Promise
 * @param {number} timeoutMs - 超时时间（毫秒）
 * @returns {Promise} 带超时控制的Promise
 */
function withTimeout(promise, timeoutMs = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}

/**
 * 统一错误处理包装器
 * @param {Function} fn - 异步函数
 * @returns {Function} 包装后的函数
 */
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await withTimeout(fn(...args))
    } catch (error) {
      console.error(`Supabase service error:`, error)
      throw error
    }
  }
}

/**
 * 获取统计数据
 * @returns {Promise<Object>} 包含totalUsers, totalDishes, totalComments, totalFoods的对象
 */
export const getStatistics = withErrorHandling(async () => {
  // 获取用户总数（从user_dishes表中去重）
  const { data: dishesData, error: dishesError } = await supabase
    .from('user_dishes')
    .select('user_name')
  
  if (dishesError) throw dishesError

  const uniqueUsers = new Set(dishesData?.map(d => d.user_name) || [])
  const totalUsers = uniqueUsers.size

  // 获取菜谱总数
  const { count: totalDishes, error: dishesCountError } = await supabase
    .from('user_dishes')
    .select('*', { count: 'exact', head: true })
  
  if (dishesCountError) throw dishesCountError

  // 获取评论总数
  const { count: totalComments, error: commentsError } = await supabase
    .from('user_comments')
    .select('*', { count: 'exact', head: true })
  
  if (commentsError) throw commentsError

  // 获取食材总数
  const { count: totalFoods, error: foodsError } = await supabase
    .from('foods')
    .select('*', { count: 'exact', head: true })
  
  if (foodsError) throw foodsError

  return {
    totalUsers: totalUsers || 0,
    totalDishes: totalDishes || 0,
    totalComments: totalComments || 0,
    totalFoods: totalFoods || 0
  }
})

/**
 * 获取菜系分布数据
 * @returns {Promise<Array>} 菜系分布数组
 */
export const getCuisineDistribution = withErrorHandling(async () => {
  const { data, error } = await supabase
    .from('user_dishes')
    .select('cuisine')
  
  if (error) throw error

  // 手动聚合数据
  const cuisineMap = {}
  data?.forEach(dish => {
    if (dish.cuisine) {
      cuisineMap[dish.cuisine] = (cuisineMap[dish.cuisine] || 0) + 1
    }
  })

  // 转换为数组并排序
  const result = Object.entries(cuisineMap)
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count)

  return result
})

/**
 * 获取菜谱趋势数据
 * @param {string} timeRange - 时间范围: 'day', 'week', 'month'
 * @returns {Promise<Array>} 趋势数据数组
 */
export const getDishTrend = withErrorHandling(async (timeRange = 'month') => {
  // 计算查询的天数
  const daysMap = {
    day: 7,
    week: 30,
    month: 30
  }
  const days = daysMap[timeRange] || 30

  const { data, error } = await supabase
    .from('user_dishes')
    .select('created_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error

  // 手动按日期分组
  const dateMap = {}
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  data?.forEach(dish => {
    const createdDate = new Date(dish.created_at)
    if (createdDate >= cutoffDate) {
      const dateStr = createdDate.toISOString().split('T')[0]
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
    }
  })

  // 转换为数组并排序
  const result = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return result
})

/**
 * 获取用户排行数据
 * @param {number} limit - 返回的用户数量限制
 * @returns {Promise<Array>} 用户排行数组
 */
export const getUserRanking = withErrorHandling(async (limit = 10) => {
  // 获取所有菜谱数据
  const { data: dishesData, error: dishesError } = await supabase
    .from('user_dishes')
    .select('user_name')
  
  if (dishesError) throw dishesError

  // 获取所有评论数据
  const { data: commentsData, error: commentsError } = await supabase
    .from('user_comments')
    .select('user_name')
  
  if (commentsError) throw commentsError

  // 统计每个用户的菜谱数和评论数
  const userStats = {}

  dishesData?.forEach(dish => {
    if (dish.user_name) {
      if (!userStats[dish.user_name]) {
        userStats[dish.user_name] = { dishCount: 0, commentCount: 0 }
      }
      userStats[dish.user_name].dishCount++
    }
  })

  commentsData?.forEach(comment => {
    if (comment.user_name) {
      if (!userStats[comment.user_name]) {
        userStats[comment.user_name] = { dishCount: 0, commentCount: 0 }
      }
      userStats[comment.user_name].commentCount++
    }
  })

  // 转换为数组并计算活跃度分数
  const result = Object.entries(userStats)
    .map(([userName, stats]) => ({
      userName,
      dishCount: stats.dishCount,
      commentCount: stats.commentCount,
      activityScore: stats.dishCount + stats.commentCount
    }))
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, limit)

  return result
})

/**
 * 获取即将过期的食材
 * @returns {Promise<Array>} 过期食材数组
 */
export const getExpiringFoods = withErrorHandling(async () => {
  const { data, error } = await supabase
    .from('expiring_foods')
    .select('*')
  
  if (error) throw error

  return data || []
})

/**
 * 获取评论时间分布
 * @param {string} timeRange - 时间范围: 'day', 'week', 'month'
 * @returns {Promise<Array>} 评论时间分布数组
 */
export const getCommentTimeline = withErrorHandling(async (timeRange = 'month') => {
  // 计算查询的天数
  const daysMap = {
    day: 7,
    week: 30,
    month: 30
  }
  const days = daysMap[timeRange] || 30

  const { data, error } = await supabase
    .from('user_comments')
    .select('created_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error

  // 手动按日期分组
  const dateMap = {}
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  data?.forEach(comment => {
    const createdDate = new Date(comment.created_at)
    if (createdDate >= cutoffDate) {
      const dateStr = createdDate.toISOString().split('T')[0]
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
    }
  })

  // 转换为数组并排序
  const result = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return result
})

/**
 * 获取难度分布数据
 * @returns {Promise<Array>} 难度分布数组
 */
export const getDifficultyDistribution = withErrorHandling(async () => {
  const { data, error } = await supabase
    .from('user_dishes')
    .select('difficulty')
  
  if (error) throw error

  // 手动聚合数据
  const difficultyMap = {}
  data?.forEach(dish => {
    const difficulty = dish.difficulty || '未分类'
    difficultyMap[difficulty] = (difficultyMap[difficulty] || 0) + 1
  })

  // 转换为数组
  const result = Object.entries(difficultyMap)
    .map(([difficulty, count]) => ({ difficulty, count }))

  return result
})

/**
 * 获取最新评论列表
 * @param {number} limit - 返回的评论数量限制（默认20条）
 * @returns {Promise<Array>} 最新评论数组
 */
export const getRecentComments = withErrorHandling(async (limit = 20) => {
  const { data, error } = await supabase
    .from('user_comments')
    .select('id, user_name, comment_text, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error

  // 转换字段名为驼峰命名
  const result = data?.map(comment => ({
    id: comment.id,
    userName: comment.user_name,
    content: comment.comment_text, // 数据库字段是comment_text
    createdAt: comment.created_at,
    flagged: false, // 数据库没有此字段，默认为false
    flagReason: null // 数据库没有此字段，默认为null
  })) || []

  return result
})

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 * @returns {Promise<boolean>} 删除是否成功
 */
export const deleteComment = withErrorHandling(async (commentId) => {
  const { error } = await supabase
    .from('user_comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
  
  return true
})

/**
 * 标记评论为不当内容
 * 注意：当前数据库表不支持标记功能，此方法仅用于前端状态管理
 * @param {number} commentId - 评论ID
 * @param {string} reason - 标记原因
 * @returns {Promise<boolean>} 标记是否成功
 */
export const flagComment = withErrorHandling(async (commentId, reason = '不当内容') => {
  // 数据库表没有flagged字段，这里只返回成功
  // 实际的标记状态将在前端内存中维护
  console.warn(`数据库不支持标记功能，标记状态仅在前端维护 (commentId: ${commentId}, reason: ${reason})`);
  return true
})

/**
 * 取消标记评论
 * 注意：当前数据库表不支持标记功能，此方法仅用于前端状态管理
 * @param {number} commentId - 评论ID
 * @returns {Promise<boolean>} 取消标记是否成功
 */
export const unflagComment = withErrorHandling(async (commentId) => {
  // 数据库表没有flagged字段，这里只返回成功
  // 实际的标记状态将在前端内存中维护
  console.warn(`数据库不支持标记功能，标记状态仅在前端维护 (commentId: ${commentId})`);
  return true
})

/**
 * 导出所有数据
 * @returns {Promise<Object>} 包含所有数据的对象
 */
export const exportAllData = withErrorHandling(async () => {
  // 并行获取所有数据
  const [
    statistics,
    cuisineDistribution,
    dishTrend,
    userRanking,
    expiringFoods,
    commentTimeline,
    difficultyDistribution
  ] = await Promise.all([
    getStatistics(),
    getCuisineDistribution(),
    getDishTrend('month'),
    getUserRanking(10),
    getExpiringFoods(),
    getCommentTimeline('month'),
    getDifficultyDistribution()
  ])

  return {
    statistics,
    cuisineDistribution,
    dishTrend,
    userRanking,
    expiringFoods,
    commentTimeline,
    difficultyDistribution,
    exportedAt: new Date().toISOString()
  }
})

// 默认导出所有方法
export default {
  getStatistics,
  getCuisineDistribution,
  getDishTrend,
  getUserRanking,
  getExpiringFoods,
  getCommentTimeline,
  getDifficultyDistribution,
  getRecentComments,
  exportAllData
}
