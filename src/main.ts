import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { loadRemoteConfig } from '@/config'

createApp(App).mount('#app')

// 若 .env 配置了 VITE_API_URL，启动后异步拉取远程配置覆盖本地数据；
// 不等待其完成，页面先以本地 config.json 渲染，数据到达后自动更新
void loadRemoteConfig()
