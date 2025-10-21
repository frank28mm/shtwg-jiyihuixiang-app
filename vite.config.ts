import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import Inspector from 'unplugin-vue-dev-locator/vite'
// import traeBadgePlugin from 'vite-plugin-trae-solo-badge'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    vue(),
    // Inspector(), // 暂时禁用以减少频繁刷新
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 定义 @ = src
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      '.replit.dev',
      '.replit.co',
      'localhost'
    ],
    hmr: {
      port: 5000,
      host: '0.0.0.0',
      overlay: false
    },
    watch: {
      usePolling: false, // 禁用轮询以减少频繁刷新
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      }
    }
  }
})
