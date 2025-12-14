/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.APP.ENTRY.MAIN
REGION: 🟢 CORE

STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=node
RUNTIME: browser
TARGET: web-app

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=in-app;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Application Entry Point",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "React", "Bootstrap"],
  "identifier": "CORE.APP.ENTRY.MAIN",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Main application entry point; WHY=Bootstrap React app with Agent Lee system; WHO=Agent Lee System; WHERE=/index.tsx; WHEN=2025-12-09; HOW=React 19 + Vite + DOM Agent Provider
SPDX-License-Identifier: MIT
============================================================================ */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { docStore, DomAgentProvider } from './Models/AgentLeeBrainMonolith';
import { sendMessageToAgentLee } from './services/leewayIndustriesService';
import App from './src/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DomAgentProvider>
      <App />
    </DomAgentProvider>
  </React.StrictMode>
);

// Initialize RAG after app loads
setTimeout(() => {
  try {
    if (docStore && typeof docStore.bootstrapRag === 'function') {
      docStore.bootstrapRag();
    } else if (typeof window !== 'undefined' && typeof (window as any).bootstrapRag === 'function') {
      // Fallback if somehow exported onto window
      (window as any).bootstrapRag();
    }
  } catch (e) {
    // don't crash startup if indexing fails
    // eslint-disable-next-line no-console
    console.warn('bootstrapRag failed', e);
  }
}, 1000);

try {
  // Expose a simple probe helper so you can call `window.probeAgent('ping')` in the console
  // to test the agent and see connectivity/errors.
  try {
    (window as any).probeAgent = async (msg = 'Are you online?') => {
      try {
        const r = await sendMessageToAgentLee(msg);
        return { ok: true, response: r };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
  } catch (e) {
    // ignore
  }

  // Install a global image onerror handler to show a small placeholder for
  // any missing images so the UI doesn't display broken image icons.
  try {
    const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial,Helvetica,sans-serif" font-size="18">Image Not Found</text></svg>'
    )}`;

    window.addEventListener('error', (ev) => {
      try {
        const target = ev?.target as any;
        if (target && target.tagName === 'IMG' && !target.__placeholderApplied) {
          target.__placeholderApplied = true;
          target.src = placeholder;
        }
      } catch (e) {
        // ignore
      }
    }, true);
  } catch (e) {
    // ignore
  }
} catch (e) {
  // ignore diagnostics failures
}
