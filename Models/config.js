// Runtime configuration stub for browser. Put any local-only flags here.
(function () {
  try {
    window.AGENTLEE_RUNTIME = window.AGENTLEE_RUNTIME || { LOCAL_ONLY: true };
  } catch (e) {
    // ignore in constrained environments
    // eslint-disable-next-line no-console
    console.warn('config.js failed to initialize', e);
  }
})();