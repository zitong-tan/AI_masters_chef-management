// 测试Supabase连接和评论功能
const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL || 'https://lsffqvdzwnvtrmweqkwu.supabase.co';
const supabaseKey = process.env.VUE_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZmZxdmR6d252dHJtd2Vxa3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDg4OTksImV4cCI6MjA3NzE4NDg5OX0.Q1FIHwidSIBtTft-tmpIHe_hWXxx_ll1EX4tubud8Ts';

console.log('=== Supabase 连接测试 ===\n');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
console.log('\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('1. 测试基本连接...');
  try {
    const { data, error } = await supabase
      .from('user_comments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      console.error('错误详情:', error);
      return false;
    }
    
    console.log('✅ 基本连接成功\n');
    return true;
  } catch (err) {
    console.error('❌ 连接异常:', err.message);
    return false;
  }
}

async function testTableExists() {
  console.log('2. 测试 user_comments 表是否存在...');
  try {
    const { data, error } = await supabase
      .from('user_comments')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ user_comments 表不存在');
        console.log('请运行 src/supabase-init.sql 创建表\n');
        return false;
      }
      console.error('❌ 查询失败:', error.message);
      return false;
    }
    
    console.log('✅ user_comments 表存在');
    console.log('示例数据:', data);
    console.log('\n');
    return true;
  } catch (err) {
    console.error('❌ 查询异常:', err.message);
    return false;
  }
}

async function testGetComments() {
  console.log('3. 测试获取评论列表...');
  try {
    const { data, error } = await supabase
      .from('user_comments')
      .select('id, user_name, comment_text, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ 获取评论失败:', error.message);
      console.error('错误详情:', error);
      return false;
    }
    
    console.log('✅ 成功获取评论');
    console.log('评论数量:', data.length);
    
    if (data.length === 0) {
      console.log('⚠️  数据库中没有评论数据');
      console.log('可以运行 src/migrations/insert-test-comments.sql 插入测试数据\n');
    } else {
      console.log('\n最新评论:');
      data.forEach((comment, index) => {
        console.log(`\n${index + 1}. ${comment.user_name}`);
        console.log(`   内容: ${comment.comment_text.substring(0, 50)}${comment.comment_text.length > 50 ? '...' : ''}`);
        console.log(`   时间: ${comment.created_at}`);
      });
      console.log('\n');
    }
    
    return true;
  } catch (err) {
    console.error('❌ 获取评论异常:', err.message);
    return false;
  }
}

async function testFieldsExist() {
  console.log('4. 测试必需字段是否存在...');
  try {
    const { data, error} = await supabase
      .from('user_comments')
      .select('id, user_name, comment_text, created_at')
      .limit(1);
    
    if (error) {
      console.error('❌ 字段检查失败:', error.message);
      return false;
    }
    
    console.log('✅ 所有基础字段都存在');
    console.log('注意: 数据库不包含标记功能字段(flagged, flag_reason)，标记功能将仅在前端维护\n');
    return true;
  } catch (err) {
    console.error('❌ 字段检查异常:', err.message);
    return false;
  }
}

async function testUserRanking() {
  console.log('5. 测试用户排行榜数据...');
  try {
    // 获取用户菜谱数据
    const { data: dishesData, error: dishesError } = await supabase
      .from('user_dishes')
      .select('user_name');
    
    if (dishesError) {
      console.error('❌ 获取菜谱数据失败:', dishesError.message);
      return false;
    }
    
    // 获取评论数据
    const { data: commentsData, error: commentsError } = await supabase
      .from('user_comments')
      .select('user_name');
    
    if (commentsError) {
      console.error('❌ 获取评论数据失败:', commentsError.message);
      return false;
    }
    
    console.log('✅ 用户数据获取成功');
    console.log('菜谱数量:', dishesData?.length || 0);
    console.log('评论数量:', commentsData?.length || 0);
    
    if (!dishesData || dishesData.length === 0) {
      console.log('⚠️  user_dishes 表中没有数据');
    }
    
    if (!commentsData || commentsData.length === 0) {
      console.log('⚠️  user_comments 表中没有数据');
    }
    
    console.log('\n');
    return true;
  } catch (err) {
    console.error('❌ 用户排行测试异常:', err.message);
    return false;
  }
}

async function runAllTests() {
  console.log('开始测试...\n');
  
  const results = {
    connection: await testConnection(),
    tableExists: await testTableExists(),
    fieldsExist: await testFieldsExist(),
    getComments: await testGetComments(),
    userRanking: await testUserRanking()
  };
  
  console.log('=== 测试结果汇总 ===\n');
  console.log('基本连接:', results.connection ? '✅ 通过' : '❌ 失败');
  console.log('表存在性:', results.tableExists ? '✅ 通过' : '❌ 失败');
  console.log('字段完整:', results.fieldsExist ? '✅ 通过' : '❌ 失败');
  console.log('获取评论:', results.getComments ? '✅ 通过' : '❌ 失败');
  console.log('用户排行:', results.userRanking ? '✅ 通过' : '❌ 失败');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  console.log('\n总体状态:', allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败');
  
  if (!allPassed) {
    console.log('\n=== 修复建议 ===\n');
    
    if (!results.connection) {
      console.log('1. 检查 .env.local 文件中的 Supabase 配置');
      console.log('2. 确认 Supabase 项目是否正常运行');
      console.log('3. 检查网络连接');
    }
    
    if (!results.tableExists) {
      console.log('1. 在 Supabase SQL 编辑器中运行 src/supabase-init.sql');
      console.log('2. 确认表创建成功');
    }
    
    if (!results.fieldsExist) {
      console.log('1. 在 Supabase SQL 编辑器中运行 src/migrations/add-comment-flags.sql');
      console.log('2. 确认字段添加成功');
    }
    
    if (results.getComments && results.tableExists) {
      console.log('1. 运行 src/migrations/insert-test-comments.sql 插入测试数据');
    }
  }
  
  console.log('\n');
}

runAllTests().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
});
