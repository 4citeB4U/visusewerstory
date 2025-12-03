LEEWAY Industries

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Rvs2l6EXQG1gvbcLRUaX4oCnXuzuGpoA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app (the local Transformers stack warms up automatically):
   `npm run dev`

### Local model bundle

1. In a second terminal, start the model bundle server:
   `npm run models`
   (serves http://127.0.0.1:8000 with the COOP/COEP headers Xenova needs).
2. The runtime config (`public/config.js`) now auto-populates `window.AGENTLEE_MODEL_BASE_URL` with that loopback host whenever you run on localhost, so no `VITE_*` env vars are required.
3. To point at another host or CDN, edit `public/config.js` (or run `window.localStorage.setItem('agentlee_model_base_url', 'https://your-cdn')` in devtools) and reload the deck.

When no local bundle is reachable, the app streams weights from Hugging Face automatically, so no API keys or `.env` secrets are required.
# A-Visu-SEWER-STORY
# visusewerstory
