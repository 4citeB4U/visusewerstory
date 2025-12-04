# Agent Lee – Build & Deploy Protocol for visusewerstory

## 0. Scope & Identity
- You are responsible for keeping the Visu-Sewer Story app building and deploying correctly to GitHub Pages.
- **Repository**: 4citeB4U/visusewerstory
- **Tech stack**: Vite + React + TypeScript
- **Hosting**: GitHub Pages, using GitHub Actions
- **Frontend only**. No backend. No external APIs required for build/deploy.

## 1. Vite Configuration – Required Shape

### 1.1. Base Path (GitHub Pages)
```typescript
// vite.config.ts
export default defineConfig({
  base: "/visusewerstory/",
  // ...
});
```

### 1.2. Output Directory
```typescript
build: {
  outDir: "docs",
  emptyOutDir: true,
  sourcemap: true,
  chunkSizeWarningLimit: 2000,
}
```

### 1.3. ONNX / Transformers / Chunking Configuration
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/visusewerstory/",
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (
          warning.code === "EVAL" &&
          warning.id &&
          warning.id.includes("onnxruntime-web")
        ) {
          return;
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-transformers": ["@xenova/transformers"],
          "vendor-onnx": ["onnxruntime-web"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
});
```

## 2. Local Build & Sanity Check

### 2.1. Install Dependencies
```bash
npm install
```

### 2.2. Build for Production
```bash
npm run build
```

### 2.3. Local Preview
```bash
npm run preview
```
Open the printed URL (e.g., http://localhost:4173/visusewerstory/)

## 3. GitHub Actions – Deployment Pipeline

### 3.1. Workflow File (`.github/workflows/deploy.yml`)
```yaml
name: Deploy Vite app to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./docs

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## 4. GitHub Pages Settings
1. Go to Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
   - Custom domain: (leave empty unless you have one)

## 5. Troubleshooting

### Black Screen / 404 Issues
1. Check the URL is exactly: https://4citeb4u.github.io/visusewerstory/
2. Open DevTools → Console and look for:
   - 404s for `/assets/index-*.js` → Check `base` in `vite.config.ts`
   - JS errors → Fix in source code
3. Verify locally:
   ```bash
   npm run build
   npm run preview
   ```
4. Check GitHub Actions for failed deployments

### Warnings
- Chunk size warnings: Expected due to AI models, already configured in `vite.config.ts`
- ONNX eval warnings: Already handled by the `onwarn` filter

## 6. Git Workflow
```bash
git status -sb
git add -A
git commit -m "chore: update Vite config and GitHub Pages deployment"
git push origin main
```

## 7. Important Notes
- Never commit `node_modules/`
- The `docs/` directory should be committed (contains the built app)
- Always test with `npm run preview` before pushing changes
