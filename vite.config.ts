import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // 添加 @ 别名
    }
  },
  server: {
    port: 8080,
    // 允许的主机列表
    allowedHosts: [
      'hqlpjh.ziyi-233.top',
      'oiapi.net',
      'uapis.cn',
      'moe.jitsu.top',
      't.2s.lol'
    ]
  }
})
