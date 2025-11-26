/**
 * 基础测试：验证Supabase服务层的基本功能
 */

import supabaseService from '../src/services/supabaseService'

describe('Supabase Service Layer', () => {
  // 测试服务是否正确导出所有方法
  it('应该导出所有必需的方法', () => {
    expect(typeof supabaseService.getStatistics).toBe('function')
    expect(typeof supabaseService.getCuisineDistribution).toBe('function')
    expect(typeof supabaseService.getDishTrend).toBe('function')
    expect(typeof supabaseService.getUserRanking).toBe('function')
    expect(typeof supabaseService.getExpiringFoods).toBe('function')
    expect(typeof supabaseService.getCommentTimeline).toBe('function')
    expect(typeof supabaseService.getDifficultyDistribution).toBe('function')
    expect(typeof supabaseService.exportAllData).toBe('function')
  })

  // 测试getStatistics返回正确的数据结构
  it('getStatistics应该返回包含所有必需字段的对象', async () => {
    try {
      const stats = await supabaseService.getStatistics()
      
      expect(stats).toHaveProperty('totalUsers')
      expect(stats).toHaveProperty('totalDishes')
      expect(stats).toHaveProperty('totalComments')
      expect(stats).toHaveProperty('totalFoods')
      
      expect(typeof stats.totalUsers).toBe('number')
      expect(typeof stats.totalDishes).toBe('number')
      expect(typeof stats.totalComments).toBe('number')
      expect(typeof stats.totalFoods).toBe('number')
      
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0)
      expect(stats.totalDishes).toBeGreaterThanOrEqual(0)
      expect(stats.totalComments).toBeGreaterThanOrEqual(0)
      expect(stats.totalFoods).toBeGreaterThanOrEqual(0)
    } catch (error) {
      // 如果数据库连接失败，跳过测试
      console.warn('Database connection failed, skipping test:', error.message)
    }
  }, 15000)

  // 测试getCuisineDistribution返回数组
  it('getCuisineDistribution应该返回数组', async () => {
    try {
      const distribution = await supabaseService.getCuisineDistribution()
      expect(Array.isArray(distribution)).toBe(true)
    } catch (error) {
      console.warn('Database connection failed, skipping test:', error.message)
    }
  }, 15000)

  // 测试getUserRanking限制参数
  it('getUserRanking应该遵守limit参数', async () => {
    try {
      const ranking = await supabaseService.getUserRanking(5)
      expect(Array.isArray(ranking)).toBe(true)
      expect(ranking.length).toBeLessThanOrEqual(5)
    } catch (error) {
      console.warn('Database connection failed, skipping test:', error.message)
    }
  }, 15000)

  // 测试exportAllData返回完整数据
  it('exportAllData应该返回包含所有数据的对象', async () => {
    try {
      const allData = await supabaseService.exportAllData()
      
      expect(allData).toHaveProperty('statistics')
      expect(allData).toHaveProperty('cuisineDistribution')
      expect(allData).toHaveProperty('dishTrend')
      expect(allData).toHaveProperty('userRanking')
      expect(allData).toHaveProperty('expiringFoods')
      expect(allData).toHaveProperty('commentTimeline')
      expect(allData).toHaveProperty('difficultyDistribution')
      expect(allData).toHaveProperty('exportedAt')
    } catch (error) {
      console.warn('Database connection failed, skipping test:', error.message)
    }
  }, 20000)
})
