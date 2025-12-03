import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/visusewerstory/' : '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Increased chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          react: ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
          // Split onnxruntime into its own chunk
          onnx: ['onnxruntime-web'],
          // Split transformers into smaller chunks
          transformers: ['@xenova/transformers'],
          // Split other large dependencies
          vendors: ['@xenova/transformers/dist/xenova-utils', '@xenova/transformers/dist/xenova-transformers']
        },
        // Better chunk naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      // Suppress eval warnings from onnxruntime
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('onnxruntime-web')) {
          return;
        }
        warn(warning);
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  // Suppress sourcemap warnings for onnxruntime
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['@xenova/transformers'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  }
});