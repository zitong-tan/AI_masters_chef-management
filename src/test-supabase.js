// 简单的Supabase连接测试
import supabase from './services/supabaseClient'

console.log('Testing Supabase connection...')
console.log('Supabase URL:', process.env.VITE_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.VITE_SUPABASE_ANON_KEY)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_dishes')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
    } else {
      console.log('Supabase connection successful!', data)
    }
  } catch (err) {
    console.error('Connection test failed:', err)
  }
}

testConnection()
