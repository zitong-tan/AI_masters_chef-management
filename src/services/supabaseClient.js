import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('URL:', supabaseUrl)
  console.error('Key exists:', !!supabaseAnonKey)
}

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'ai-food-master-dashboard'
    }
  }
})

export default supabase
