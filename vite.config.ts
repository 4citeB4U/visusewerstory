import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// Vite config for: visusewerstory
// - Builds to ./docs for GitHub Pages
// - Uses /visusewerstory/ as the base URL (required for GH Pages)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // IMPORTANT: this must match your GitHub repo name exactly
    // Repo: https://github.com/4citeB4U/visusewerstory
    base: '/visusewerstory/',

    plugins: [react()],

    server: {
      host: '0.0.0.0',
      port: 3000,
    },

    build: {
      outDir: 'docs',      // GitHub Pages will serve from /docs
      assetsDir: 'assets', // explicit
      sourcemap: false,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        // Suppress noisy eval warnings from third-party libs (onnxruntime-web)
        // which use `eval` internally for wasm glue code. We only silence
        // the specific message so other rollup warnings still surface.
        onwarn(warning, warn) {
          try {
            const msg = String(warning && (warning.message || warning));
            if (/onnxruntime-web|Use of eval/.test(msg)) return;
          } catch (e) { /* ignore */ }
          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'recharts'],
            transformers: ['@xenova/transformers'],
          },
        },
      },
    },

    esbuild: {
      // Silence eval warning from onnxruntime-web
      logOverride: {
        'eval': 'silent',
      },
    },

    optimizeDeps: {
      esbuildOptions: {
        logOverride: {
          'eval': 'silent',
        },
      },
      include: [
        '@xenova/transformers',
      ],
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    define: {},
  };
});
