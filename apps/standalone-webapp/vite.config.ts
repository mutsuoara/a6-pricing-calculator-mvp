import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pricing-calculator/types': path.resolve(__dirname, '../../packages/calculator-types/src'),
      '@pricing-calculator/core': path.resolve(__dirname, '../../packages/calculator-core/src'),
      '@pricing-calculator/ui': path.resolve(__dirname, '../../packages/calculator-ui/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
