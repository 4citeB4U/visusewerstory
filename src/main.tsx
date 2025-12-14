/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.BOOT.SEQUENCE.INIT
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
  "name": "Application Boot Sequence",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "Bootstrap", "Initialization"],
  "identifier": "CORE.BOOT.SEQUENCE.INIT",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Application main entry point; WHY=Initialize and mount React app; WHO=Agent Lee System; WHERE=/src/main.tsx; WHEN=2025-12-09; HOW=React 19 + DOM mounting + Doc store initialization
SPDX-License-Identifier: MIT
============================================================================ */

import React from "react";
import ReactDOM from "react-dom/client";
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
      <App />
    </DomAgentProvider>
  </React.StrictMode>
);

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
