# SAT Prep

Self-hosted SAT prep webapp. Vite + React.

## Setup

```
npm install
npm run dev
```

Dev server runs at the URL Vite prints (usually `http://localhost:5173`).

## Scripts

- `npm run dev` — start dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

## Project layout

See [CLAUDE.md](./CLAUDE.md) for the full file-structure map and state model.

The original single-file artifact lives at `reference/artifact-ui-template.jsx` for historical reference only — it is not imported by the app.

## Status

This is the structural scaffold. AI question generation and Supabase persistence are not yet wired — today, questions are placeholders and answers are randomized so the UI can be exercised end-to-end. Persistence uses `localStorage` via `src/lib/storage.js`.
