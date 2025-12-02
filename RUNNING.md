Run locally (Windows PowerShell)

From the project root, run these commands in PowerShell:

```powershell
# install dependencies
npm install

# start dev server (HTTP at http://localhost:3000)
npm run dev

# build for production
npm run build

# preview the production build on http://localhost:3000
npm start
```

Environment:
- No API keys required; everything runs locally in the browser.

Notes:
- Dev server runs on port 3000 (see `vite.config.ts`).
- Do not commit your `.env.local` with real secrets.