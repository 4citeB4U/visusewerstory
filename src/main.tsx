// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import { docStore, DomAgentProvider } from "../Models/agentlee-local-bundle.js";
import { sendMessageToAgentLee } from "../services/leewayIndustriesService";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
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
      if (docStore && typeof docStore.bootstrapRag === "function") {
        docStore.bootstrapRag();
      } else if (typeof (window as any).bootstrapRag === "function") {
        (window as any).bootstrapRag();
      }
    } catch (error) {
      console.warn("bootstrapRag failed", error);
    }
  }, 1000);
};

const installDiagnostics = () => {
  if (typeof window === "undefined") return;

  try {
    (window as any).probeAgent = async (msg = "Are you online?") => {
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

    window.addEventListener(
      "error",
      (event) => {
        try {
          const target = event?.target as any;
          if (target && target.tagName === "IMG" && !target.__placeholderApplied) {
            target.__placeholderApplied = true;
            target.src = placeholder;
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
