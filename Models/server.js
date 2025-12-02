// Simple Express static server with proper headers for shared array buffer / WASM threading
import express from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const distPath = path.join(__dirname, 'dist');


// Simple in-memory request inspector (diagnostic)
const recentRequests = [];
const MAX_INSPECT = 200;

// Diagnostic middleware: record request summaries for debugging
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
  } catch (e) {
    // swallow errors from diagnostics
  }
  next();
});

// Security & performance headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(serveStatic(distPath, {
  maxAge: '1h'
}));

app.get('/healthz', (req, res) => res.json({ ok: true }));

// Diagnostic endpoints to inspect recent requests
app.get('/inspect-requests', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, count: recentRequests.length, recent: recentRequests.slice(0,50) });
});

app.post('/inspect-requests/clear', (req, res) => {
  recentRequests.length = 0;
  res.json({ ok: true, cleared: true });
});

// Dynamic client config: mirror the static public/config.js runtime flags
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
    '    console.warn("config.js runtime init failed", err && err.message ? err.message : err);',
    '  }',
    '})();'
  ].join('\n');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(lines);
});

// Single Page App fallback: serve index.html for any unknown GET that accepts HTML
app.use((req, res, next) => {
  try {
    if (req.method === 'GET') {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
    }
  } catch (e) {
    // ignore and continue
  }
  return next();
});

// Prefer 8080, but also respect PORT if provided; listen on both if they differ
const PORT = Number(process.env.PORT) || 8000;
console.log(`process.env.HOST: ${process.env.HOST}`);
const HOST = process.env.HOST || '127.0.0.1';
console.log(`Binding to HOST: ${HOST}, PORT: ${PORT}`);
try {
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    // Self-test fetch to confirm reachability
    fetch(`http://${HOST}:${PORT}/healthz`).then(r => r.text()).then(t => {
      console.log('[self-test] /healthz response:', t.slice(0,80));
    }).catch(e => console.warn('[self-test] healthz fetch failed', e.message));
  });
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
} catch (e) {
  console.error('Failed to start server:', e);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
// no export; script runs server when executed
