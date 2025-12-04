import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => ({
  // Base URL must match the GitHub Pages subpath
  base: "/visusewerstory/",
  
  plugins: [
    react(),
    svgr()
  ] as PluginOption[],

  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'docs',
    // Clear output directory before building
    emptyOutDir: true,
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Increase chunk size warning limit (for large AI models)
    chunkSizeWarningLimit: 2000,
    
    // Rollup configuration for module bundling
    rollupOptions: {
      // Custom warning handler to suppress ONNX eval warnings
      onwarn(warning, defaultHandler) {
        // Suppress eval warnings from onnxruntime-web
        if (
          warning.code === 'EVAL' &&
          warning.id &&
          typeof warning.id === 'string' &&
          warning.id.includes('onnxruntime-web')
        ) {
          return;
        }
        defaultHandler(warning);
      },
      
      // Manual code splitting configuration
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-dom/client'],
          'vendor-transformers': ['@xenova/transformers'],
          'vendor-onnx': ['onnxruntime-web'],
          'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
          'vendor-ui': ['@heroicons/react', 'classnames', 'tailwind-merge'],
        },
      },
    },
  },

  // Module resolution
  resolve: {
    alias: {
      // Path alias for src directory
      '@': '/src',
    },
  },

  // Global variable definitions
  define: {
    // Polyfill for Node.js process.env
    'process.env': {},
    // Global variable for browser/Node.js compatibility
    global: 'globalThis',
  },

  // Dependency optimization
  optimizeDeps: {
    // Always include tslib in optimized deps
    include: ['tslib'],
    esbuildOptions: {
      // Global variable for browser/Node.js compatibility
      define: {
        global: 'globalThis',
      },
      // Target modern browsers
      target: 'es2020',
    },
  },

  // Development server configuration
  server: {
    // Enable CORS for development
    cors: true,
    // Open browser automatically
    open: mode !== 'production',
  },
}));