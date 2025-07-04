import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  // build: {
  //   rollupOptions: {
  //     input: path.resolve(__dirname, 'src/app/index.tsx'),
  //   },
  // },
  server: {
    open: true,
    proxy: {
      '/api': 'http://localhost:5005',
    },
    watch: {
      usePolling: true,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
    hmr: {
      overlay: true,
      clientPort: 5173,
    },
    // Disable middleware for better performance
    middlewareMode: false,
    // Disable pre-bundling
    preTransformRequests: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            '@tanstack/react-query',
            '@tanstack/react-router',
          ],
          utils: [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],
        },
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    sourcemap: false,
  },
});
