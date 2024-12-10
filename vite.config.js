// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.0.15:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 80
  },
  // Cette configuration est importante pour le routing
  base: '/',
  root: process.cwd(),
});
