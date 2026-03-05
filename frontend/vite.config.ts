import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Add JSX runtime for production builds
        jsxRuntime: 'automatic',
        // Enable TypeScript support
        typescript: true,
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@store': path.resolve(__dirname, './src/store'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@api': path.resolve(__dirname, './src/api'),
      },
    },

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxy for Socket.IO
        },
      },
    },

    build: {
      // Output directory
      outDir: 'dist',
      
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-query',
          'zustand',
          '@mui/material',
          'recharts',
          'socket.io-client',
          'date-fns',
          'react-grid-layout'
        ],
      },

      // Code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-query',
              'zustand'
            ],
            ui: [
              '@mui/material',
              'recharts',
              'react-grid-layout'
            ],
          },
        },
      },

      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      
      // Source maps in production
      sourcemap: false,
    },

    // TypeScript configuration
    esbuild: {
      jsxInject: `import React from 'react'`,
      target: 'es2020',
    },

    // CSS configuration
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
  };
});