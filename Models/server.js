/* ============================================================================
   Express Static File Server (Agent Lee Edition)
   - Serves built assets from 'docs' (Vite build output)
   - Enforces COOP/COEP headers for Local AI/WASM support (SharedArrayBuffer)
   - Includes Diagnostic endpoints for debugging
============================================================================ */

import express from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configuration: Point this to your Vite 'outDir' (usually 'dist' or 'docs')
const distPath = path.join(__dirname, 'docs');

// ==========================================
// 1. DIAGNOSTICS (Request Inspection)
// ==========================================
const recentRequests = [];
const MAX_INSPECT = 200;

// Middleware: Record request summaries for debugging
app.use((req, res, next) => {
  try {
    const entry = {
      ts: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      accept: req.headers.accept || '',
      referer: req.headers.referer || req.headers.referrer || '',
      ua: (req.headers['user-agent'] || '').slice(0, 200)
    };
    recentRequests.unshift(entry);
    if (recentRequests.length > MAX_INSPECT) recentRequests.length = MAX_INSPECT;
  } catch (e) { /* ignore errors in logging */ }
  next();
});

// Endpoint: View recent requests
app.get('/inspect-requests', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, count: recentRequests.length, recent: recentRequests.slice(0, 50) });
});

// Endpoint: Clear request log
app.post('/inspect-requests/clear', (req, res) => {
  recentRequests.length = 0;
  res.json({ ok: true, cleared: true });
});

// ==========================================
// 2. SECURITY HEADERS (CRITICAL FOR AI)
// ==========================================
// These headers enable SharedArrayBuffer, required by ONNX/Transformers.js
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ==========================================
// 3. STATIC FILES & APP ROUTES
// ==========================================

// Serve static files from the build directory
app.use(serveStatic(distPath, {
  maxAge: '1h'
}));

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Dynamic Runtime Config
app.get('/config.js', (req, res) => {
  const lines = [
    '/* runtime config */',
    '(function () {',
    '  try {',
    '    var current = (typeof window !== "undefined" && window.AGENTLEE_RUNTIME) || {};',
    '    var next = Object.assign({}, current, { LOCAL_ONLY: true });',
    '    if (typeof window !== "undefined") {',
    '      window.AGENTLEE_RUNTIME = next;',
    '    }',
    '  } catch (err) {',
    '    console.warn("config.js runtime init failed", err);',
    '  }',
    '})();'
  ].join('\n');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(lines);
});

// SPA Fallback: Serve index.html for any unknown GET request that accepts HTML
app.use((req, res, next) => {
  try {
    if (req.method === 'GET') {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
    }
  } catch (e) {
    // ignore
  }
  return next();
});

// ==========================================
// 4. SERVER START
// ==========================================

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

try {
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Serving static files from: ${distPath}`);
    console.log(`AI Security Headers (COOP/COEP) are ACTIVE.`);
    
    // Self-test
    fetch(`http://${HOST}:${PORT}/healthz`)
      .then(r => r.json())
      .then(() => console.log('Self-test: Health check passed.'))
      .catch(e => console.warn('Self-test: Health check failed (server might still be running).', e.message));
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
} catch (e) {
  console.error('Failed to start server:', e);
}

// Global error handlers to prevent crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});