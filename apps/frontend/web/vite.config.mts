import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '1pd-types': path.resolve(__dirname, '../1pd-types/src'),
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
    include: ['@1pd/types'],
    exclude: [
      '@aws-amplify/backend',
      '@aws-amplify/backend-cli',
      '@aws-amplify/backend-deployer',
      '@aws-amplify/ui-react',
      'aws-amplify',
    ],
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
            'react-router-dom',
            '@tanstack/react-query',
            '@tanstack/react-router',
          ],
          ui: [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
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
