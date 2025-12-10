import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    strictPort: false, // 如果端口被占用，自动尝试下一个可用端口
    proxy: {
      '/auth': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      // 只代理 review 下的 API 路径，不代理前端路由
      '/review/post': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      '/review/mark': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      '/review/comment': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      '/review/category': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      '/review/uploadPicture': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
      '/review/downLoadPicture': {
        target: 'http://49.235.97.26',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
})
