/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.BOOT.SEQUENCE.INIT
REGION: 🟢 CORE

STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=vite
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
  "name": "Application Boot Sequence",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "Bootstrap", "Initialization", "Routing"],
  "identifier": "CORE.BOOT.SEQUENCE.INIT",
  "license": "MIT",
  "dateModified": "2025-12-16"
}

5WH: WHAT=Application main entry point; WHY=Initialize React, Router, and Agent Brain; WHO=Agent Lee System; WHERE=/src/main.tsx; WHEN=2025-12-16; HOW=React 19 + HashRouter + Doc store initialization
SPDX-License-Identifier: MIT
============================================================================ */

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom"; // Fix for GitHub Pages & Office Networks
import "../index.css";
import { docStore, DomAgentProvider, initDocStore } from "../Models/AgentLeeBrainMonolith";
import { sendMessageToAgentLee } from "../services/leewayIndustriesService";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DomAgentProvider>
      {/* 
         HashRouter is critical here. 
         It ensures the app works on GitHub Pages and prevents 
         "White Screen" errors on corporate networks/iPhones 
         by using the #/ hash fragment for routing.
      */}
      <HashRouter>
        <App />
      </HashRouter>
    </DomAgentProvider>
  </React.StrictMode>
);

// --- AGENT LEE BOOTSTRAPPING & DIAGNOSTICS BELOW ---

const scheduleBootstrapRag = () => {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    try {
      // Prefer the richer init routine which indexes core CSVs and references
      if (typeof initDocStore === "function") {
        initDocStore();
      } else {
        const bs = Reflect.get(docStore, "bootstrapRag");
        if (typeof bs === "function") {
          bs.call(docStore);
        } else if (typeof window !== "undefined") {
          const wbs = Reflect.get(window, "bootstrapRag");
          if (typeof wbs === "function") {
            wbs.call(window);
          }
        }
      }
    } catch (error) {
      console.warn("bootstrapRag failed", error);
    }
  }, 1000);
};

const installDiagnostics = () => {
  if (typeof window === "undefined") return;

  // 1. Install Probe for debugging
  try {
    window.probeAgent = async (msg = "Are you online?") => {
      try {
        const response = await sendMessageToAgentLee(msg);
        return { ok: true, response };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
  } catch (error) {
    // ignore diagnostics hook failure
  }

  // 2. Install Image Fallback Handler
  try {
    const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial,Helvetica,sans-serif" font-size="18">Image Not Found</text></svg>'
    )}`;

    const appliedPlaceholders = new WeakSet();

    window.addEventListener(
      "error",
      (event) => {
        try {
          const targetAny = event && event.target ? event.target : null;
          if (targetAny && "tagName" in targetAny && targetAny.tagName === "IMG" && !appliedPlaceholders.has(targetAny)) {
            appliedPlaceholders.add(targetAny);
            if ("src" in targetAny) {
              targetAny.src = placeholder;
            }
          }
        } catch (error) {
          // ignore placeholder fallback errors
        }
      },
      true
    );
  } catch (error) {
    // ignore global image handler issues
  }
};

scheduleBootstrapRag();
installDiagnostics();
