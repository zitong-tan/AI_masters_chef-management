import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

console.log('Vue app initializing...')
console.log('Environment variables:', {
  SUPABASE_URL: process.env.VUE_APP_SUPABASE_URL,
  HAS_SUPABASE_KEY: !!process.env.VUE_APP_SUPABASE_ANON_KEY
})

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
}

new Vue({
  render: h => h(App),
}).$mount('#app')

console.log('Vue app mounted')
