import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Base URL is '/visusewerstory/' for production, and '/' for development
  const base = command === 'build' 
    ? '/visusewerstory/' 
    : '/';
    
  return {
    // Base URL must match the GitHub Pages subpath
    base: base,
    
    plugins: [
      react(),
      svgr()
    ] as PluginOption[],

    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      open: true,
      cors: true,
    },

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
            'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
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
        // Polyfill global and target modern browsers
        define: {
          global: 'globalThis',
        },
        target: 'es2020',
      },
    },
  };
});