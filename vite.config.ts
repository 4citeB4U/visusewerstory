/* ============================================================================
   Vite Build Configuration (Agent Lee Edition)
   Combined: Advanced Build + AI Security Headers + Models/.js Support
============================================================================ */

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Base URL must match the GitHub Pages subpath in production.
  // Use '/' in dev for local preview, and '/visusewerstory/' in build.
  const base = command === 'build' ? '/visusewerstory/' : '/';
    
  return {
    // Base URL must match the GitHub Pages subpath
    base: base,
    
    plugins: [
      react(),
      svgr()
    ] as PluginOption[],

    // Development server configuration
    server: {
      // port: Number(env.VITE_DEV_PORT ?? 3001),
      // strictPort: true,
      open: true,
      cors: true,
      // --- THE FIX FOR LOCAL AI MODELS ---
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },

    // Preview server configuration (for testing build locally)
    preview: {
      port: 4173,
      // --- THE FIX FOR LOCAL AI MODELS ---
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },

    // Build configuration
    build: {
      outDir: 'dist', // Output directory (matches CI/Pages workflows)
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 2000, // Increased for AI models
      
      rollupOptions: {
        // Suppress ONNX eval warnings
        onwarn(warning, defaultHandler) {
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
        
        // Manual code splitting
        output: {
          manualChunks: {
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
        '@': '/src',
      },
    },

    // Global variable definitions (Polyfills for Node dependencies)
    define: {
      'process.env': {},
      global: 'globalThis',
    },

    // Dependency optimization
    optimizeDeps: {
      include: ['tslib'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        // Ensure Models directory is also handled during dependency optimization if needed
        loader: {
          '.js': 'jsx',
        },
        target: 'es2020',
      },
    },
  };
});