LEEWAY Industries

# Build to serve


This contains everything you need to run your app locally.
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
# A Visu-Sewer Story

This repository contains the interactive presentation "From Roots to Resilience: A Visu-Sewer Story" narrated by Agent Lee. The deck walks through who Visu-Sewer is, growth history, AI-enabled inspection and program outcomes, evidence, and closing remarks. Each slide pairs a concise narrative on the left with a visual or chart on the right.

## Story Overview
- Title: Innovation Below Ground → sets the stage and Q&A ground rules.
- Stewards of Sewers: footprint and markets served.
- Through the Tunnels: timeline of growth and acquisitions.
- Eye on the Underground: CCTV inspection, manual vs AI-assisted efficiency.
- Saving Cities Money: trenchless vs open-cut economics.
- Masters of the Main: crews, capacity, and schedule velocity.
- Wired for the Future: technology roadmap (speed, risk, optimization).
- Engineering Tomorrow: revenue bridge and growth thesis.
- Visionary Ecosystem (Page 9): people-first image and stacked Safety, Robotics, AI, Future metrics.
- Industry Evolution: future-state reveal and strategy.
- Evidence Locker: verifiable sources, charts, and case studies.
- Closing Chapter: Q&A and navigation.

## Vision

Visu-Sewer exists to make the unseen — underground infrastructure — visible, safe, and resilient through practical engineering and human-centered AI.

- Mission: turn inspection data into timely, actionable decisions that prevent failures, reduce cost, and extend asset life.
- Principles:
   - Preventive-first: favor prediction and early intervention over costly emergency repairs.
   - Human+AI: deliver clear, crew-ready guidance; amplify operator judgment rather than obscure it.
   - Minimize disruption: prioritize trenchless, low-impact solutions that lower carbon and community disturbance.
   - Verifiable evidence: every recommendation links back to source video, measurements, and a traceable audit trail.
   - Scalable impact: solutions that work for small utilities and large cities alike.

Goals (3-year): reduce emergency failures by ~40% where deployed; halve inspection-to-action time; demonstrate consistent trenchless savings across pilot cities.

How we deliver:
- Real-time video analysis and automated condition scoring.
- Prioritized, auditable worklists integrated with asset management and dispatch.
- Simple visual reports for stakeholders and engineers that connect findings to funding decisions.


## Agent Lee — Models and Runtime

Agent Lee orchestrates narration, chart explanations, and page navigation. The application supports two layers:

- Reasoning and Generation (Local Inference):
   - Text generation models: `Qwen/Qwen2.5-0.5B` (Planner, Brain, Voice Styler, Companion) loaded via `@xenova/transformers`.
   - Embeddings model: `Xenova/all-MiniLM-L6-v2` (Librarian) for feature extraction and similarity operations.
   - Configuration source: `services/localModelHub.ts`.
   - Local bundle detection: the app auto-detects `AGENTLEE_MODEL_BASE_URL` or a localhost server; otherwise weights stream from the Hub.

- Voice Synthesis (Browser):
   - Web Speech API (`window.speechSynthesis`) in `services/ttsService.ts`.
   - Preferred voices are auto-selected (see `services/voicePreferences.ts`), and rate/pitch are adjustable in-app.

When asked about the model Agent Lee uses, the assistant identifies as using GPT-5. Internally for this app, local inference is performed by Qwen 2.5 (0.5B) for text generation and MiniLM L6 v2 for embeddings.

## Interaction Model

- Auto mode narrates slide content sequentially and can navigate based on Agent Lee’s plan.
- Manual mode speaks the current slide’s scripted narration when you navigate or request an explanation.
- Data-point explain: clicking a chart point dispatches `agentlee:dataPointSelected` with `{ x, y, seriesKey, chartKind }`. Agent Lee generates and speaks a concise explanation for that specific point.
- Page-specific scroll control: containers with `data-agentlee-scroll` are discoverable for Agent Lee to scroll (e.g., acquisitions images on Page 2).

## Page 2 — Expanded Footprint (Scroll Behavior)

- The header remains fixed.
- Only the inner images container scrolls under the header.
- The outer visualization wrapper does not scroll when `chartKind === 'AcquisitionMap'`.
- The inner scrollable area is tagged `data-agentlee-scroll="acquisitions"` for automation.

## Page 9 — Ecosystem Layout

- Right-hand column stacks Safety, Robotics, AI, and Future vertically.
- The centerpiece image on the left (people-first) fits exactly within its container and can match the height of the right column.
- The container can be marked scrollable or non-scrollable depending on presentation needs; current code favors a non-scrolling outer wrapper with discoverable inner regions.

## Development

### Install and Run
```pwsh
npm install
npm run dev
```

### Build
```pwsh
npm run build
```

## CI & Deploy (GitHub)
- CI builds on push/PR to `main` using [.github/workflows/ci.yml](.github/workflows/ci.yml). It runs `npm ci` and `npm run build`, and uploads the `dist` artifact.
- GitHub Pages deploy uses [.github/workflows/pages.yml](.github/workflows/pages.yml). It builds and publishes from `dist`.
- Production site: https://4citeB4U.github.io/visusewerstory/

### Local resolver warnings (VS Code)
- You may see messages like "Unable to resolve action actions/checkout@v4" when viewing workflows locally. These are benign in local context; GitHub-hosted runners resolve official actions correctly.
- Causes: limited network, not signed into GitHub in VS Code, or enterprise host not configured in the extension.
- Verify correctness by pushing and checking the Actions tab.
- Optional hardening: pin actions to commit SHAs (e.g., `actions/checkout@<sha>`) for supply-chain security and to silence some resolvers.

### YAML linting on Windows
- Prefer per-project install and use `npx`:

```pwsh
npm install --save-dev yaml-lint
# If npx is blocked by execution policy, temporarily allow signed scripts:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
npx yaml-lint .github/workflows/ci.yml
npx yaml-lint .github/workflows/pages.yml
```

- Or use Python without admin:

```pwsh
py -m pip install --user yamllint
py -m yamllint .github/workflows/ci.yml
py -m yamllint .github/workflows/pages.yml
```

### Verify deployment
- Push to `main` or trigger the Pages workflow from Actions.
- Confirm logs show “Upload GitHub Pages artifact (dist)” and “Deploy to GitHub Pages”.
- Visit the site URL; assets should resolve under `/visusewerstory/`.

### Common issues
- 404 assets: ensure `base` in [vite.config.ts](vite.config.ts) is `/visusewerstory/` for build and `/` for dev.
- Wrong folder published: Pages workflow must upload `./dist`, not `./docs`.

### Models (Optional Local Hosting)
- To serve local models, set `window.AGENTLEE_MODEL_BASE_URL` or persist `agentlee_model_base_url` in `localStorage`.
- Default behavior streams weights from the Hub if no local base is detected.

## Conventions
- TailwindCSS for layout and styling.
- Recharts for data visualization.
- Data and slides are defined in `constants.ts` and routed via `components/ChartRouter.tsx`.
