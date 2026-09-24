import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // 部署 base 路径：默认 '/'（根路径部署）；
  // GitHub Pages 等子路径部署时，通过环境变量 VITE_BASE 覆盖，
  // 例如项目仓库页需设置为 '/<仓库名>/'（部署工作流中已自动处理）
  base: process.env.VITE_BASE || '/',
  plugins: [
    vue(),
    // Tailwind CSS v4 官方 Vite 插件（零配置，无需 postcss/tailwind.config）
    tailwindcss(),
  ],
  server: {
    // host: true 等价于监听 0.0.0.0，局域网内其他设备可通过本机 IP 访问
    host: true,
  },
  resolve: {
    alias: {
      // 统一使用 @ 指向 src 目录，简化导入路径
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
