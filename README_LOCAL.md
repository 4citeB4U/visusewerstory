# Local Development Notes (README_LOCAL)

This file supplements the existing `README.md` with explicit instructions for running the local Models server and debugging Agent Lee.

Overview
- Frontend: React + TypeScript, Vite. Slides and visuals live in `components/`.
- Local LLM integration: `services/leewayIndustriesService.ts` dynamically imports modules under `Models/` (e.g. `gemma.js`, `llama.js`).
- Local model static server: `Models/server.js` serves model artifacts and sets COOP/COEP headers required for browser WASM.

Quick start (development)
1. Install dependencies

```powershell
npm install
```

2. Start the local Models server (separate terminal)

```powershell
npm run models
# or
node Models/server.js
```

This serves `Models/dist` (if present) and exposes `/healthz` and `/config.js`.

3. Start the dev server

```powershell
npm run dev
```

Open `http://localhost:3001/` (vite may pick an alternative port if 3000 is busy).

Agent Lee troubleshooting
- If Agent Lee is offline, open DevTools and check `window.AGENT_STATUS` for `initialized`, `online`, and `lastError`.
- Check the Network tab for failed model artifact requests; failing requests returning HTML mean the SPA fallback served `index.html` instead of the model asset. Ensure `Models/server.js` is running and the requested paths exist under `Models/dist`.
- The entire stack is front-end only. There is no remote API fallback, so make sure the local Transformers models have fully downloaded.

Local in-browser model usage
- To enable local narration from in-browser models (SmolLM2, GPT-2 small, BlenderBot-400M distill), start the app and on the Intro screen toggle **Allow local in-browser narration**.
- Pick your preferred local model from the dropdown (this reorders Gemma's fallback list so the selected model is attempted first) and click **Start Presentation**.
- The app will try to pre-warm the selected local model via Xenova's Transformers (if supported in the browser environment). This may be slow and memory intensive for larger models.
- There is no OpenRouter/Gemini fallback; every narration is produced with the bundled local models, evidence index, and TTS.

If you'd like, I can try again to update the main `README.md` directly or create a clean merged README once you confirm it's safe to overwrite the existing file.