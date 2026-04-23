# SAT Project

A self-contained SAT prep webapp for the digital SAT. Generates unlimited practice questions (via the Anthropic API, wiring deferred), supports full- and half-length tests that mirror the Bluebook testing environment, and tracks history with per-question review.

## Stack

- **Vite + React (JavaScript)**. No TypeScript, no CSS framework.
- **Styling**: inline style objects driven by a theme constant `C` in `src/styles/theme.js`. A Figma-driven visual pass will come later; keep the current structure cheap to restyle. All new additions to this project must adhere to the existing design principles in `reference/artifact-ui-template.jsx` unless requested otherwise.
- **Deferred**:
  - Anthropic API (question + explanation generation) — currently stubbed; correct answers are randomized inside `SessionView.buildInitialState`.
  - Supabase (persistence) — `src/lib/storage.js` is a thin localStorage wrapper; swap its implementation when Supabase is wired.

## State model

- `App.jsx` holds `view`, `history`, `savedSession`, and `sessionInit`. Nothing else.
- Each view is a child component receiving callbacks (`onBack`, `onStart`, `onNavigate`, etc.).
- `SessionView` owns every piece of in-session state: `sessionType`, `modules`, `questions`, `questionSkills`, `correctMap`, `currentMod`, `qIdx`, `answers`, `flags`, `crossouts`, `highlighting`, `phase`, `confirmHome`. The four phase components are pure and props-driven.
- New session: `App` passes `{ type, n, skills }` to `SessionView` via `init`. Resume: passes `{ resume: savedSession }`. `SessionView` computes its initial state once from `init` via `buildInitialState`.

## Persistence

`App.jsx` keeps `history` and `savedSession` in sync with localStorage on every change (`useEffect`). Keys are prefixed `sat:` inside `storage.js`. Practice sessions are transient — they never write to `history`.

When Supabase replaces localStorage: change only `src/lib/storage.js`. Call sites in `App.jsx` stay the same.

## Skill taxonomy

`src/data/taxonomy.js` is the single source of truth for the 30 official SAT skills. Anything that needs to know "is this R&W or Math?" imports `isRWSkill` from there.

## What not to add right now

- Adaptive module routing, multi-user accounts, or cloud sync.
- Math rendering (KaTeX/MathJax) — question bodies are placeholders until AI generation is wired.
- A CSS framework / styling system. Figma pass will define that.
- TypeScript migration.

## Known placeholders

- Question text, passages, and answer choices are hard-coded placeholder strings.
- Correct answers are `Math.floor(Math.random() * 4)` per question at session start.
- Explanations are a single placeholder line in the review phases.
- Cards, menus, and placeholder components in specific pages.
- `reference/artifact-ui-template.jsx` is the starting point from the artifact transfer; it must remain unchanged and exists entirely as a reference for UI and design until a formal re-design takes place.