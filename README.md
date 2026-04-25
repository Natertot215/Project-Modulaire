# SAT Prep

Self-hosted SAT prep webapp. Vite + React + TypeScript + Tailwind CSS, with a Supabase-backed shared question bank.

## Setup

```
npm install
npm run dev
```

Dev server runs at the URL Vite prints (usually `http://localhost:5173/`).

### Environment

The app reads two Vite env vars from `.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

See `.env.example` for the format. Both values are on the Supabase dashboard under Project Settings → API. The anon / publishable key is safe in the browser; row-level security restricts writes.

## Scripts

- `npm run dev` — start dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

## Status

Scaffold + database are done; client wiring to Supabase is the next milestone.

**Done:**
- Full session UI (Practice / Test with modules, phases, review, flagging, crossouts, highlighting).
- TypeScript migration to strict mode with Tailwind-mapped design tokens.
- Supabase project provisioned with a `questions` table (RLS public-read), indexes on `(section, skill, difficulty)` and `(skill)`, plus a `question-images` storage bucket.
- 8,000 placeholder question rows seeded and evenly distributed across 29 SAT skills × 3 difficulties (`easy` / `med` / `hard`).
- Local `.env.local` populated; `.mcp.json` registers the Supabase MCP server for Claude Code (local only, gitignored).

**In flight:**
- Client-side refactor to fetch questions from Supabase at session start with a loading phase, difficulty selection, and per-skill cooldown. Implementation plan at [docs/superpowers/plans/2026-04-24-supabase-question-bank.md](docs/superpowers/plans/2026-04-24-supabase-question-bank.md). Today the app still renders placeholder question content and randomized correct answers via `src/lib/api.ts`.

**Deferred:**
- Anthropic question generation pipeline that replaces the 8k placeholder rows with real content.
- KaTeX rendering for `$...$` math in stems / choices / explanations.
- User accounts (currently anonymous; history + session state live in `localStorage`).

## Project layout

See [CLAUDE.md](./CLAUDE.md) for the file-structure map, state model, and in-progress work.
