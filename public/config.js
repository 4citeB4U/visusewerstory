/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.CONFIG.RUNTIME.ENV
REGION: 🟢 CORE

STACK: LANG=js; FW=none; UI=none; BUILD=node
RUNTIME: browser
TARGET: config

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=n/a;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Public Runtime Configuration",
  "programmingLanguage": "JavaScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "Configuration", "Runtime", "Environment"],
  "identifier": "CORE.CONFIG.RUNTIME.ENV",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Public runtime configuration; WHY=Browser environment setup with URL sanitization; WHO=Agent Lee System; WHERE=/public/config.js; WHEN=2025-12-09; HOW=IIFE + localStorage + URL validation
SPDX-License-Identifier: MIT
============================================================================ */

(function () {
  function sanitize(base) {
    if (!base || typeof base !== 'string') return null;
    var trimmed = base.trim();
    if (!trimmed) return null;
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  function readStoredBase() {
    try {
      return window.localStorage ? sanitize(window.localStorage.getItem('agentlee_model_base_url')) : null;
    } catch (err) {
      return null;
    }
  }

  function inferLoopbackBase() {
    try {
      var host = window.location && window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
        return 'http://127.0.0.1:8000';
      }
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  try {
    var runtime = window.AGENTLEE_RUNTIME || { LOCAL_ONLY: true };
    window.AGENTLEE_RUNTIME = runtime;

    var configuredBase = sanitize(window.AGENTLEE_MODEL_BASE_URL) || sanitize(runtime.MODEL_BASE_URL);
    if (!configuredBase) configuredBase = readStoredBase();
    if (!configuredBase) configuredBase = inferLoopbackBase();

    if (configuredBase) {
      window.AGENTLEE_MODEL_BASE_URL = configuredBase;
      runtime.MODEL_BASE_URL = configuredBase;
      try {
        window.localStorage && window.localStorage.setItem('agentlee_model_base_url', configuredBase);
      } catch (err) {
        /* ignore */
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('config.js failed to initialize', e);
  }
})();
