# Supabase Question Bank — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stubbed, placeholder-content question layer with real Supabase-backed questions — fetched up-front before each session with difficulty selection, per-skill cooldown, and a loading phase.

**Architecture:** Keep `src/lib/api.ts` as the single boundary. A new `src/lib/supabase.ts` owns the client. The `Question` type grows from `{ id: number }` to the full row. `SessionView` moves from synchronous `buildInitialState` to an async load with a new `"loading"` phase. A per-skill rolling cooldown lives in localStorage (`sat:recentBySkill`) and is committed on session submit.

**Tech Stack:** Vite, React 18, TypeScript (strict), Tailwind 3, Supabase JS v2, Vitest (new, for pure-function unit tests).

**Database prerequisites (already done, do not repeat):** `public.questions` table with check constraints, indexes on `(section, skill, difficulty)` and `(skill)`, RLS enabled with public-read policy, `question-images` storage bucket (public), `.env.local` populated with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Ordering rule:** Tasks 1–9 are strictly additive and keep `tsc` green after every task. Task 10 is the atomic type-shape migration — `tsc` goes green by the end of the task, not between its sub-steps. Tasks 11–13 are additive again.

---

## File Structure

### New files
- `src/lib/supabase.ts` — client singleton
- `src/views/session/LoadingPhase.tsx` — pre-session loading screen
- `src/components/DifficultySelector.tsx` — pill group for difficulty choice
- `src/lib/__tests__/api.test.ts` — unit tests for `splitMixedCount`
- `src/lib/__tests__/storage.test.ts` — unit tests for `recentBySkill` helpers
- `vitest.config.ts` — test runner config

### Modified files
- `package.json` — add `@supabase/supabase-js`, `vitest`, `jsdom`; add `test` script
- `src/types.ts` — expand `Question`, add `Difficulty` / `DifficultyChoice` / `ChartSpec`, add `"loading"` to `Phase`, extend `SessionInit`, drop `CorrectMap`, drop `correctMap` from `SessionState`
- `src/lib/api.ts` — replace `getQuestionContent` + `generateCorrectAnswers` with `fetchQuestions` + exported pure `splitMixedCount`
- `src/lib/storage.ts` — add `getRecentForSkills` / `pushRecentForSkills` / `RECENT_CAP`; rewrite `isValidSessionState` for new shape
- `src/App.tsx` — `startSession` takes `difficulty`; pass through to `SessionInit`
- `src/views/PracticeView.tsx` — difficulty selector + `canStart` gating
- `src/views/TestView.tsx` — difficulty selector + `canStart` gating
- `src/views/session/SessionView.tsx` — `"loading"` phase, async `loadInitialState`, commit cooldown on submit, read `correctIndex` from `Question`
- `src/views/session/QuestionsPhase.tsx` — accept `questions` prop; display real `stem`, `passage`, `choices`
- `src/views/session/ReviewPhase.tsx` — accept `questions` prop; display real content + `explanation`

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase client, Vitest, jsdom**

Run from the project root:

```bash
npm install @supabase/supabase-js
npm install -D vitest jsdom @vitest/ui
```

- [ ] **Step 2: Verify additions in `package.json`**

`dependencies` must now contain `"@supabase/supabase-js"`. `devDependencies` must contain `"vitest"`, `"jsdom"`, `"@vitest/ui"`.

- [ ] **Step 3: Add `test` script**

Edit `package.json` — replace the `scripts` block:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 4: Verify baseline still compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: exits 0, no output.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase-js, vitest deps"
```

---

## Task 2: Vitest configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: Create a smoke test** at `src/lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: `1 passed`, `smoke.test.ts` picked up.

- [ ] **Step 4: Verify tsc still green**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/lib/__tests__/smoke.test.ts
git commit -m "test: add vitest config and smoke test"
```

---

## Task 3: Supabase client singleton

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create the client file**

```ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See .env.example.",
  );
}

export const supabase = createClient(url, anonKey);
```

- [ ] **Step 2: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase client singleton"
```

---

## Task 4: Additive type declarations

Add new types without removing anything. `tsc` stays green.

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Update `src/types.ts`** — replace the file contents with:

```ts
export type Section = "rw" | "math" | "mixed";
export type SessionType = "practice" | "test";
export type Phase = "loading" | "questions" | "break" | "results" | "review";

export type Skill = string;

export type Difficulty = "easy" | "med" | "hard";
export type DifficultyChoice = Difficulty | "mixed";

export interface ChartSpec {
  [key: string]: unknown;
}

export interface Module {
  label: string;
  sec: Section;
  count: number;
  start: number;
}

export interface Question {
  id: number;
}

export type AnswerMap = Record<number, number | null>;
export type FlagMap = Record<number, boolean>;
export type CrossoutMap = Record<string, boolean>;
export type CorrectMap = Record<number, number>;

export interface ReviewResult {
  answered: boolean;
  correct: boolean;
  picked: number | null | undefined;
  correctChoice: number;
  skill: Skill;
  isRW: boolean;
}

export interface SessionState {
  sessionType: SessionType;
  modules: Module[];
  questions: Question[];
  questionSkills: Skill[];
  correctMap: CorrectMap;
  currentMod: number;
  qIdx: number;
  answers: AnswerMap;
  flags: FlagMap;
  crossouts: CrossoutMap;
}

export type SessionInit =
  | { resume: SessionState }
  | {
      type: SessionType;
      n: number;
      skills: Skill[];
      difficulty: DifficultyChoice;
    };

export interface HistoryEntry {
  id: number;
  date: string;
  type: string;
  skills: Skill[];
  correct: number;
  total: number;
  attempted: number;
  breakdown: boolean[];
  flagged: FlagMap;
  reviewData: ReviewResult[];
}
```

Note: `Question` still has only `{ id }` here — expanded in Task 10. `CorrectMap` and `correctMap` still exist — removed in Task 10. `"loading"` added to `Phase`. `SessionInit` fresh-start now requires `difficulty`.

- [ ] **Step 2: Fix call sites that now need `difficulty`**

Only `App.tsx` constructs `SessionInit`. Open `src/App.tsx` and find:

```ts
  const startSession = (type: SessionType, n: number, skills: Skill[]) => {
    setSessionInit({ type, n, skills });
    setSavedSession(null);
    setView("session");
  };
```

Replace with:

```ts
  const startSession = (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice = "mixed",
  ) => {
    setSessionInit({ type, n, skills, difficulty });
    setSavedSession(null);
    setView("session");
  };
```

And add `DifficultyChoice` to the type import at the top of `App.tsx`:

```ts
import type {
  DifficultyChoice,
  HistoryEntry,
  SessionInit,
  SessionState,
  SessionType,
  Skill,
} from "./types";
```

- [ ] **Step 3: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0. (Views still call `onStart("practice", n, skills)` — the new `difficulty` parameter defaults to `"mixed"`, so they compile.)

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/App.tsx
git commit -m "feat: add Difficulty types and loading phase variant"
```

---

## Task 5: TDD — `splitMixedCount` pure function

**Files:**
- Create: `src/lib/__tests__/api.test.ts`
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Write failing test** at `src/lib/__tests__/api.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { splitMixedCount } from "../api";

describe("splitMixedCount", () => {
  it("splits evenly when divisible by 3", () => {
    expect(splitMixedCount(12)).toEqual({ easy: 4, med: 4, hard: 4 });
    expect(splitMixedCount(9)).toEqual({ easy: 3, med: 3, hard: 3 });
  });

  it("gives remainder to easy first, then med (remainder == 1)", () => {
    expect(splitMixedCount(10)).toEqual({ easy: 4, med: 3, hard: 3 });
  });

  it("gives remainder to easy and med (remainder == 2)", () => {
    expect(splitMixedCount(11)).toEqual({ easy: 4, med: 4, hard: 3 });
  });

  it("handles small counts", () => {
    expect(splitMixedCount(1)).toEqual({ easy: 1, med: 0, hard: 0 });
    expect(splitMixedCount(2)).toEqual({ easy: 1, med: 1, hard: 0 });
    expect(splitMixedCount(3)).toEqual({ easy: 1, med: 1, hard: 1 });
  });

  it("handles zero", () => {
    expect(splitMixedCount(0)).toEqual({ easy: 0, med: 0, hard: 0 });
  });

  it("sum of buckets equals input count", () => {
    for (let n = 0; n <= 100; n++) {
      const { easy, med, hard } = splitMixedCount(n);
      expect(easy + med + hard).toBe(n);
    }
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test -- api.test.ts
```

Expected: fails on `Cannot find module` / `splitMixedCount is not exported`.

- [ ] **Step 3: Implement** — add to the top of `src/lib/api.ts` (above the existing exports; do not remove existing code yet):

```ts
export function splitMixedCount(count: number): { easy: number; med: number; hard: number } {
  if (count <= 0) return { easy: 0, med: 0, hard: 0 };
  const base = Math.floor(count / 3);
  const extra = count % 3;
  return {
    easy: base + (extra >= 1 ? 1 : 0),
    med: base + (extra >= 2 ? 1 : 0),
    hard: base,
  };
}
```

- [ ] **Step 4: Re-run — confirm pass**

```bash
npm test -- api.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api.ts src/lib/__tests__/api.test.ts
git commit -m "feat: splitMixedCount pure helper with tests"
```

---

## Task 6: TDD — per-skill cooldown helpers

**Files:**
- Create: `src/lib/__tests__/storage.test.ts`
- Modify: `src/lib/storage.ts`

- [ ] **Step 1: Write failing tests** at `src/lib/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  RECENT_CAP,
  getRecentForSkills,
  pushRecentForSkills,
  _resetRecentForTests,
} from "../storage";

describe("recentBySkill cooldown", () => {
  beforeEach(() => {
    _resetRecentForTests();
  });

  it("returns empty when nothing recorded", () => {
    expect(getRecentForSkills(["Boundaries", "Percentages"])).toEqual([]);
  });

  it("returns ids for a single skill", () => {
    pushRecentForSkills([
      { skill: "Boundaries", id: 1 },
      { skill: "Boundaries", id: 2 },
    ]);
    expect(getRecentForSkills(["Boundaries"]).sort()).toEqual([1, 2]);
  });

  it("returns unique union across multiple skills", () => {
    pushRecentForSkills([
      { skill: "Boundaries", id: 1 },
      { skill: "Percentages", id: 2 },
      { skill: "Boundaries", id: 3 },
    ]);
    expect(getRecentForSkills(["Boundaries", "Percentages"]).sort()).toEqual([1, 2, 3]);
  });

  it("deduplicates ids that appear in multiple skills", () => {
    pushRecentForSkills([
      { skill: "Boundaries", id: 7 },
      { skill: "Percentages", id: 7 },
    ]);
    expect(getRecentForSkills(["Boundaries", "Percentages"])).toEqual([7]);
  });

  it(`caps each skill buffer at RECENT_CAP (${RECENT_CAP})`, () => {
    const records = Array.from({ length: RECENT_CAP + 50 }, (_, i) => ({
      skill: "Boundaries",
      id: i,
    }));
    pushRecentForSkills(records);
    const ids = getRecentForSkills(["Boundaries"]);
    expect(ids.length).toBe(RECENT_CAP);
    expect(ids).toContain(RECENT_CAP + 49);
    expect(ids).not.toContain(0);
  });

  it("FIFO order preserved across pushes", () => {
    const first = Array.from({ length: RECENT_CAP }, (_, i) => ({
      skill: "Boundaries",
      id: i,
    }));
    pushRecentForSkills(first);
    pushRecentForSkills([{ skill: "Boundaries", id: 9999 }]);
    const ids = getRecentForSkills(["Boundaries"]);
    expect(ids).toContain(9999);
    expect(ids).not.toContain(0);
    expect(ids.length).toBe(RECENT_CAP);
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test -- storage.test.ts
```

Expected: fails on missing exports.

- [ ] **Step 3: Implement** — append to `src/lib/storage.ts`:

```ts
// --- Per-skill cooldown buffer (no-repeat-within-200-uses of that skill) ---
export const RECENT_CAP = 200;

const RECENT_KEY = "recentBySkill";

type RecentBySkill = Record<string, number[]>;

export function getRecentForSkills(skills: string[]): number[] {
  const map = get<RecentBySkill>(RECENT_KEY, {});
  const union = new Set<number>();
  for (const s of skills) {
    const buf = map[s];
    if (buf) for (const id of buf) union.add(id);
  }
  return [...union];
}

export function pushRecentForSkills(
  records: Array<{ skill: string; id: number }>,
): void {
  if (records.length === 0) return;
  const map = get<RecentBySkill>(RECENT_KEY, {});
  for (const { skill, id } of records) {
    const existing = map[skill] ?? [];
    existing.push(id);
    if (existing.length > RECENT_CAP) {
      existing.splice(0, existing.length - RECENT_CAP);
    }
    map[skill] = existing;
  }
  set(RECENT_KEY, map);
}

// Test-only helper. Not exported through the barrel.
export function _resetRecentForTests(): void {
  remove(RECENT_KEY);
}
```

- [ ] **Step 4: Re-run — confirm pass**

```bash
npm test -- storage.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage.ts src/lib/__tests__/storage.test.ts
git commit -m "feat: per-skill cooldown buffer (RECENT_CAP=200)"
```

---

## Task 7: `LoadingPhase` component

**Files:**
- Create: `src/views/session/LoadingPhase.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { memo, useEffect, useState } from "react";
import Shell from "../../components/primitives/Shell";
import Btn from "../../components/primitives/Btn";

interface LoadingPhaseProps {
  error: string | null;
  onBack: () => void;
}

function LoadingPhase({ error, onBack }: LoadingPhaseProps) {
  const [label, setLabel] = useState("Preparing your session…");

  useEffect(() => {
    if (error) return;
    const t = setTimeout(() => setLabel("Almost there…"), 3000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <Shell wide>
      <div className="max-w-[400px] mx-auto text-center pt-24">
        {error ? (
          <>
            <p className="text-bad text-[15px] font-semibold mb-2">
              Couldn&rsquo;t load questions
            </p>
            <p className="text-tx3 text-[13px] mb-6">{error}</p>
            <Btn onClick={onBack}>Back</Btn>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 mx-auto mb-5 rounded-full border-2 border-bdr border-t-tx2 animate-spin"
              aria-label="Loading"
              role="status"
            />
            <p className="text-tx2 text-[13px]">{label}</p>
          </>
        )}
      </div>
    </Shell>
  );
}

export default memo(LoadingPhase);
```

- [ ] **Step 2: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0. Component unused yet — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/views/session/LoadingPhase.tsx
git commit -m "feat: loading phase component"
```

---

## Task 8: `DifficultySelector` component

**Files:**
- Create: `src/components/DifficultySelector.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Pill from "./primitives/Pill";
import Label from "./primitives/Label";
import type { DifficultyChoice } from "../types";

const OPTIONS: Array<{ value: DifficultyChoice; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "med", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

interface DifficultySelectorProps {
  value: DifficultyChoice;
  onChange: (d: DifficultyChoice) => void;
}

export default function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Label>Difficulty</Label>
      <div className="flex gap-1.5 -mt-2">
        {OPTIONS.map((o) => (
          <Pill
            key={o.value}
            active={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/DifficultySelector.tsx
git commit -m "feat: difficulty selector component"
```

---

## Task 9: Wire difficulty + canStart into PracticeView and TestView

**Files:**
- Modify: `src/views/PracticeView.tsx`
- Modify: `src/views/TestView.tsx`

- [ ] **Step 1: Replace `src/views/PracticeView.tsx`**

```tsx
import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import DifficultySelector from "../components/DifficultySelector";
import type { DifficultyChoice, SessionType, Skill } from "../types";

interface PracticeViewProps {
  onStart: (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice,
  ) => void;
}

const COUNT_OPTIONS = [10, 15, 20, 25, 30];

export default function PracticeView({ onStart }: PracticeViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pCount, setPCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("mixed");

  const canStart =
    skills.length > 0 &&
    Number.isInteger(pCount) &&
    pCount > 0 &&
    COUNT_OPTIONS.includes(pCount);

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[26px] font-bold mb-1.5">Practice</h1>
        <p className="text-tx3 text-sm mb-9">
          Select skills from either or both sections.
        </p>
        <SkillSelector skills={skills} setSkills={setSkills} />
        <div className="border-t border-bdr pt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Questions</Label>
              <div className="flex gap-1.5 -mt-2">
                {COUNT_OPTIONS.map((n) => (
                  <Pill
                    key={n}
                    active={pCount === n}
                    onClick={() => setPCount(n)}
                  >
                    {n}
                  </Pill>
                ))}
              </div>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>
          <div className="flex justify-end">
            <Btn
              onClick={() => onStart("practice", pCount, skills, difficulty)}
              disabled={!canStart}
            >
              Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}
```

- [ ] **Step 2: Replace `src/views/TestView.tsx`**

```tsx
import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import DifficultySelector from "../components/DifficultySelector";
import type { DifficultyChoice, SessionType, Skill } from "../types";

interface TestViewProps {
  onStart: (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice,
  ) => void;
}

type TestLength = "full" | "half";

export default function TestView({ onStart }: TestViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [length, setLength] = useState<TestLength>("full");
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("mixed");
  const n = length === "full" ? 98 : 49;

  const canStart = skills.length > 0;

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[26px] font-bold mb-1.5">Test</h1>
        <p className="text-tx3 text-sm mb-9">Simulate a full or half-length SAT.</p>
        <SkillSelector skills={skills} setSkills={setSkills} />
        <div className="border-t border-bdr pt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Length</Label>
              <div className="flex gap-1.5 -mt-2">
                <Pill active={length === "full"} onClick={() => setLength("full")}>
                  Full Length
                </Pill>
                <Pill active={length === "half"} onClick={() => setLength("half")}>
                  Half Length
                </Pill>
              </div>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>
          <div className="flex justify-end">
            <Btn
              onClick={() => onStart("test", n, skills, difficulty)}
              disabled={!canStart}
            >
              Start Test ({skills.length} skill{skills.length !== 1 ? "s" : ""})
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}
```

- [ ] **Step 3: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0. `App.tsx`'s `startSession` already accepts optional `difficulty` from Task 4, so the narrower required signature here is compatible (the callback accepts the extra arg).

- [ ] **Step 4: Run the dev server and manually verify the UI**

```bash
npm run dev
```

In the browser: click **Practice** — difficulty pills appear next to the question count pills. "Start Practice" is disabled when no skills are selected. Toggle a skill → button becomes active. Same for **Test**.

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5: Commit**

```bash
git add src/views/PracticeView.tsx src/views/TestView.tsx
git commit -m "feat: difficulty selector and canStart gate in Practice/Test"
```

---

## Task 10: Atomic Question-shape migration

This is the largest task. It replaces the stub content layer with real Supabase fetches. `tsc` may fail between sub-steps; it must be green at step 9.

**Files:**
- Modify: `src/types.ts`
- Modify: `src/lib/api.ts`
- Modify: `src/lib/storage.ts`
- Modify: `src/views/session/SessionView.tsx`

- [ ] **Step 1: Expand `Question` and drop `CorrectMap` / `correctMap`**

In `src/types.ts`, replace the `Question` interface:

```ts
export interface Question {
  id: number;
  section: "rw" | "math";
  skill: Skill;
  difficulty: Difficulty;
  passage: string | null;
  stem: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  chartData: ChartSpec | null;
  imagePath: string | null;
}
```

Remove the line `export type CorrectMap = Record<number, number>;`.

In `SessionState`, remove the line `correctMap: CorrectMap;`.

- [ ] **Step 2: Rewrite `src/lib/api.ts`**

Replace the entire file with:

```ts
import { supabase } from "./supabase";
import type {
  Difficulty,
  DifficultyChoice,
  Question,
  Skill,
} from "../types";

export function splitMixedCount(count: number): { easy: number; med: number; hard: number } {
  if (count <= 0) return { easy: 0, med: 0, hard: 0 };
  const base = Math.floor(count / 3);
  const extra = count % 3;
  return {
    easy: base + (extra >= 1 ? 1 : 0),
    med: base + (extra >= 2 ? 1 : 0),
    hard: base,
  };
}

interface Row {
  id: number;
  section: "rw" | "math";
  skill: string;
  difficulty: Difficulty;
  passage: string | null;
  stem: string;
  choices: unknown;
  correct_index: number;
  explanation: string;
  chart_data: unknown;
  image_path: string | null;
}

function rowToQuestion(r: Row): Question {
  const choices = r.choices as unknown;
  if (
    !Array.isArray(choices) ||
    choices.length !== 4 ||
    !choices.every((c) => typeof c === "string")
  ) {
    throw new Error(`Question ${r.id} has malformed choices`);
  }
  return {
    id: r.id,
    section: r.section,
    skill: r.skill,
    difficulty: r.difficulty,
    passage: r.passage,
    stem: r.stem,
    choices: choices as [string, string, string, string],
    correctIndex: r.correct_index,
    explanation: r.explanation,
    chartData: (r.chart_data as Question["chartData"]) ?? null,
    imagePath: r.image_path,
  };
}

async function queryBucket(args: {
  section: "rw" | "math";
  skills: Skill[];
  difficulty: Difficulty;
  count: number;
  excludeIds: number[];
}): Promise<Question[]> {
  if (args.count === 0) return [];
  let q = supabase
    .from("questions")
    .select("*")
    .eq("section", args.section)
    .eq("difficulty", args.difficulty)
    .in("skill", args.skills);
  if (args.excludeIds.length > 0) {
    q = q.not("id", "in", `(${args.excludeIds.join(",")})`);
  }
  // Pull the full filtered set (bounded at 1000 by PostgREST default);
  // shuffle client-side for unbiased sampling. At 8k rows across 30 skills
  // × 3 difficulties × 2 sections, an individual bucket is well under 1000.
  const { data, error } = await q.limit(1000);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows.slice(0, args.count).map(rowToQuestion);
}

export interface FetchQuestionsOptions {
  section: "rw" | "math";
  skills: Skill[];
  difficulty: DifficultyChoice;
  count: number;
  excludeIds: number[];
}

export async function fetchQuestions(opts: FetchQuestionsOptions): Promise<Question[]> {
  const { section, skills, difficulty, count, excludeIds } = opts;
  if (skills.length === 0) throw new Error("fetchQuestions: skills must be non-empty");
  if (count <= 0) return [];

  const fetchSingle = async (diff: Difficulty, want: number, exclude: number[]) => {
    let got = await queryBucket({ section, skills, difficulty: diff, count: want, excludeIds: exclude });
    if (got.length < want) {
      // one relaxation pass: drop the user-cooldown exclusions, keep in-session dedup only
      const userIds = new Set(excludeIds);
      const inSession = exclude.filter((id) => !userIds.has(id));
      got = await queryBucket({ section, skills, difficulty: diff, count: want, excludeIds: inSession });
    }
    if (got.length < want) {
      throw new Error(
        `Not enough ${diff} questions for ${section} / ${skills.join(", ")}: got ${got.length}, need ${want}`,
      );
    }
    return got;
  };

  if (difficulty !== "mixed") {
    return fetchSingle(difficulty, count, excludeIds);
  }

  const split = splitMixedCount(count);
  const sessionDedup = [...excludeIds];
  const easy = await fetchSingle("easy", split.easy, sessionDedup);
  sessionDedup.push(...easy.map((q) => q.id));
  const med = await fetchSingle("med", split.med, sessionDedup);
  sessionDedup.push(...med.map((q) => q.id));
  const hard = await fetchSingle("hard", split.hard, sessionDedup);
  return [...easy, ...med, ...hard];
}
```

- [ ] **Step 3: Update `isValidSessionState` in `src/lib/storage.ts`**

Replace the `isValidSessionState` function at the bottom of the file with:

```ts
export function isValidSessionState(s: unknown): s is SessionState {
  if (!s || typeof s !== "object") return false;
  const v = s as Partial<SessionState>;
  if (v.sessionType !== "practice" && v.sessionType !== "test") return false;
  if (!Array.isArray(v.modules) || v.modules.length === 0) return false;
  if (!Array.isArray(v.questions)) return false;
  if (!Array.isArray(v.questionSkills)) return false;
  if (typeof v.currentMod !== "number") return false;
  if (typeof v.qIdx !== "number") return false;
  if (!v.answers || typeof v.answers !== "object") return false;
  if (!v.flags || typeof v.flags !== "object") return false;
  if (!v.crossouts || typeof v.crossouts !== "object") return false;
  for (const q of v.questions) {
    if (!q || typeof q !== "object") return false;
    const qq = q as Partial<import("../types").Question>;
    if (
      typeof qq.id !== "number" ||
      typeof qq.stem !== "string" ||
      typeof qq.correctIndex !== "number" ||
      !Array.isArray(qq.choices) ||
      qq.choices.length !== 4
    ) {
      return false;
    }
  }
  return true;
}
```

- [ ] **Step 4: Rewrite `SessionView` — async init, loading phase, cooldown commit**

Replace the entire contents of `src/views/session/SessionView.tsx` with:

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import useBreakpoint from "../../hooks/useBreakpoint";
import { buildModules } from "../../lib/modules";
import { fetchQuestions } from "../../lib/api";
import * as storage from "../../lib/storage";
import { isRWSkill } from "../../data/taxonomy";
import QuestionsPhase from "./QuestionsPhase";
import BreakPhase from "./BreakPhase";
import ResultsPhase from "./ResultsPhase";
import ReviewPhase from "./ReviewPhase";
import LoadingPhase from "./LoadingPhase";
import type {
  AnswerMap,
  CrossoutMap,
  DifficultyChoice,
  FlagMap,
  HistoryEntry,
  Module,
  Phase,
  Question,
  ReviewResult,
  SessionInit,
  SessionState,
  Skill,
} from "../../types";

function isResumeInit(init: SessionInit): init is { resume: SessionState } {
  return "resume" in init && init.resume != null;
}

interface SessionViewProps {
  init: SessionInit;
  onHome: () => void;
  onSaveAndExit: (state: SessionState) => void;
  onSubmit: (entry: HistoryEntry | null) => void;
}

export default function SessionView({ init, onHome, onSaveAndExit, onSubmit }: SessionViewProps) {
  const resumed = isResumeInit(init);
  const initialState = resumed ? init.resume : null;

  const [phase, setPhase] = useState<Phase>(resumed ? "questions" : "loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sessionType, setSessionType] = useState(initialState?.sessionType ?? "practice");
  const [modules, setModules] = useState<Module[]>(initialState?.modules ?? []);
  const [questions, setQuestions] = useState<Question[]>(initialState?.questions ?? []);
  const [questionSkills, setQuestionSkills] = useState<Skill[]>(initialState?.questionSkills ?? []);
  const [currentMod, setCurrentMod] = useState(initialState?.currentMod ?? 0);
  const [qIdx, setQIdx] = useState(initialState?.qIdx ?? 0);
  const [answers, setAnswers] = useState<AnswerMap>(initialState?.answers ?? {});
  const [flags, setFlags] = useState<FlagMap>(initialState?.flags ?? {});
  const [crossouts, setCrossouts] = useState<CrossoutMap>(initialState?.crossouts ?? {});
  const [highlighting, setHighlighting] = useState(false);
  const [confirmHome, setConfirmHome] = useState(false);

  const wide = useBreakpoint(1000);
  const aborted = useRef(false);

  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
    };
  }, []);

  useEffect(() => {
    if (resumed) return;
    const load = async () => {
      try {
        const { type, n, skills, difficulty } = init as {
          type: "practice" | "test";
          n: number;
          skills: Skill[];
          difficulty: DifficultyChoice;
        };
        const mods = buildModules(type, n);

        const excludeIds = storage.getRecentForSkills(skills);
        const rwSkills = skills.filter((s) => isRWSkill(s));
        const mathSkills = skills.filter((s) => !isRWSkill(s));
        const loaded: Question[] = [];

        if (type === "practice") {
          // Split the total between RW and math proportional to how many
          // skills the user picked from each section.
          const rwCount =
            rwSkills.length > 0 && mathSkills.length > 0
              ? Math.round((rwSkills.length / (rwSkills.length + mathSkills.length)) * n)
              : rwSkills.length > 0
                ? n
                : 0;
          const mathCount = n - rwCount;

          if (rwCount > 0) {
            const rwQs = await fetchQuestions({
              section: "rw",
              skills: rwSkills,
              difficulty,
              count: rwCount,
              excludeIds,
            });
            loaded.push(...rwQs);
          }
          if (mathCount > 0) {
            const mathQs = await fetchQuestions({
              section: "math",
              skills: mathSkills,
              difficulty,
              count: mathCount,
              excludeIds,
            });
            loaded.push(...mathQs);
          }
        } else {
          for (const m of mods) {
            if (m.sec !== "rw" && m.sec !== "math") {
              throw new Error(`Unexpected test module section: ${m.sec}`);
            }
            const sectionSkills = m.sec === "rw" ? rwSkills : mathSkills;
            if (sectionSkills.length === 0) {
              throw new Error(
                `No ${m.sec === "rw" ? "Reading & Writing" : "Math"} skills selected for ${m.label}`,
              );
            }
            const qs = await fetchQuestions({
              section: m.sec,
              skills: sectionSkills,
              difficulty,
              count: m.count,
              excludeIds,
            });
            loaded.push(...qs);
          }
        }

        // Each fetched question carries its own skill; use it directly.
        const qSkills: Skill[] = loaded.map((q) => q.skill);

        if (aborted.current) return;
        setSessionType(type);
        setModules(mods);
        setQuestions(loaded);
        setQuestionSkills(qSkills);
        setPhase("questions");
      } catch (e) {
        if (aborted.current) return;
        setLoadError(e instanceof Error ? e.message : "Unknown error");
      }
    };
    void load();
  }, [init, resumed]);

  const answeredCount = Object.values(answers).filter((v) => v != null).length;

  const scoreSession = useCallback((): ReviewResult[] =>
    questions.map((q, i) => ({
      answered: answers[i] != null,
      correct: answers[i] != null && answers[i] === q.correctIndex,
      picked: answers[i],
      correctChoice: q.correctIndex,
      skill: questionSkills[i] || "Unknown",
      isRW: isRWSkill(questionSkills[i] || ""),
    })),
    [answers, questions, questionSkills]);

  const restartModule = (mi: number) => {
    const m = modules[mi];
    const na = { ...answers };
    const nf = { ...flags };
    const nc = { ...crossouts };
    for (let i = m.start; i < m.start + m.count; i++) {
      delete na[i];
      delete nf[i];
      [0, 1, 2, 3].forEach((c) => delete nc[`${i}-${c}`]);
    }
    setAnswers(na);
    setFlags(nf);
    setCrossouts(nc);
    setCurrentMod(mi);
    setQIdx(m.start);
    setPhase("questions");
  };

  const handleSaveAndExit = () => {
    onSaveAndExit({
      sessionType,
      modules,
      questions,
      questionSkills,
      currentMod,
      qIdx,
      answers,
      flags,
      crossouts,
    });
  };

  const commitCooldown = () => {
    const records = questions.map((q, i) => ({
      skill: questionSkills[i] || q.skill,
      id: q.id,
    }));
    storage.pushRecentForSkills(records);
  };

  const handleSubmit = () => {
    const results = scoreSession();
    commitCooldown();
    let entry: HistoryEntry | null = null;
    if (sessionType === "test") {
      const correct = results.filter((r) => r.correct).length;
      const attempted = results.filter((r) => r.answered).length;
      const flaggedOnly: FlagMap = Object.entries(flags)
        .filter(([, v]) => v)
        .reduce<FlagMap>((o, [k, v]) => {
          o[Number(k)] = v;
          return o;
        }, {});
      entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        type: `Test — ${questions.length === 98 ? "Full" : "Half"} Length`,
        skills: [],
        correct,
        total: questions.length,
        attempted,
        breakdown: results.map((r) => r.correct),
        flagged: flaggedOnly,
        reviewData: results,
      };
    }
    onSubmit(entry);
    setPhase("results");
  };

  if (phase === "loading") {
    return <LoadingPhase error={loadError} onBack={onHome} />;
  }

  if (phase === "questions") {
    return (
      <QuestionsPhase
        sessionType={sessionType}
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        questionSkills={questionSkills}
        questions={questions}
        answers={answers}
        flags={flags}
        crossouts={crossouts}
        highlighting={highlighting}
        confirmHome={confirmHome}
        answeredCount={answeredCount}
        wide={wide}
        onConfirmHome={() => setConfirmHome(true)}
        onCancelHome={() => setConfirmHome(false)}
        onSaveAndExit={handleSaveAndExit}
        onDiscardHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
        onToggleHighlight={() => setHighlighting((h) => !h)}
        onToggleFlag={() => setFlags((p) => ({ ...p, [qIdx]: !p[qIdx] }))}
        onSetAnswer={(ci) => setAnswers((p) => ({ ...p, [qIdx]: p[qIdx] === ci ? null : ci }))}
        onToggleCrossout={(ci) =>
          setCrossouts((p) => ({ ...p, [`${qIdx}-${ci}`]: !p[`${qIdx}-${ci}`] }))
        }
        onGoBreak={() => setPhase("break")}
      />
    );
  }

  if (phase === "break") {
    return (
      <BreakPhase
        sessionType={sessionType}
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        answers={answers}
        flags={flags}
        onSetQIdx={setQIdx}
        onSetPhase={setPhase}
        onNextModule={() => {
          const next = currentMod + 1;
          setCurrentMod(next);
          setQIdx(modules[next].start);
          setPhase("questions");
        }}
        onSubmit={handleSubmit}
        onRestart={() => restartModule(currentMod)}
      />
    );
  }

  if (phase === "results") {
    const results = scoreSession();
    return (
      <ResultsPhase
        sessionType={sessionType}
        results={results}
        flags={flags}
        total={questions.length}
        onHome={onHome}
        onReview={() => {
          setQIdx(0);
          setCurrentMod(0);
          setPhase("review");
        }}
      />
    );
  }

  if (phase === "review") {
    const results = scoreSession();
    return (
      <ReviewPhase
        sessionType={sessionType}
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        questionSkills={questionSkills}
        questions={questions}
        results={results}
        flags={flags}
        crossouts={crossouts}
        wide={wide}
        onHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
      />
    );
  }

  return null;
}
```

- [ ] **Step 5: Add `questions` prop to `QuestionsPhase` signature (not yet used in render)**

At the top of `src/views/session/QuestionsPhase.tsx`, add `Question` to the type import:

```ts
import type { AnswerMap, CrossoutMap, FlagMap, Module, Question, Skill } from "../../types";
```

Add `questions: Question[];` to the `QuestionsPhaseProps` interface (near `questionSkills`):

```ts
  questionSkills: Skill[];
  questions: Question[];
  answers: AnswerMap;
```

Add `questions,` to the destructured parameters in the function declaration — do **not** yet change the render. This keeps the diff small and keeps the placeholder UI intact for this task; the display wiring comes in Tasks 11/12.

```ts
function QuestionsPhase({
  sessionType,
  modules,
  currentMod,
  qIdx,
  questionSkills,
  questions,
  answers,
```

Suppress the unused-var warning for the duration of this task by referencing it once after the destructure:

```ts
  void questions; // wired into render in Task 11
```

- [ ] **Step 6: Add `questions` prop to `ReviewPhase` signature (not yet used in render)**

At the top of `src/views/session/ReviewPhase.tsx`, extend the type import:

```ts
import type { CrossoutMap, FlagMap, Module, Question, ReviewResult, SessionType, Skill } from "../../types";
```

Add `questions: Question[];` to `ReviewPhaseProps` after `questionSkills`. Destructure it, then:

```ts
  void questions; // wired into render in Task 12
```

- [ ] **Step 7: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0. If errors mention `correctMap`, confirm you removed the field from `SessionState` in Step 1. If errors mention `CorrectMap`, confirm the type export was removed.

- [ ] **Step 8: Run the test suite**

```bash
npm test
```

Expected: all tests pass (no changes to `splitMixedCount` or `recentBySkill` logic).

- [ ] **Step 9: Manual verification that the UI still compiles and loads the loading phase (will error because bank is empty — that's expected)**

```bash
npm run dev
```

Click Practice → pick a skill → click Start. You should see the loading spinner for ≈1s, then the error state "Not enough ... questions for rw / ..." with a Back button. Click Back — returns home. This proves the error path works; we just have no data yet. Stop dev server.

- [ ] **Step 10: Commit**

```bash
git add src/types.ts src/lib/api.ts src/lib/storage.ts src/views/session/SessionView.tsx src/views/session/QuestionsPhase.tsx src/views/session/ReviewPhase.tsx
git commit -m "feat: supabase-backed question fetch with loading phase and cooldown"
```

---

## Task 11: Display real question content in `QuestionsPhase`

**Files:**
- Modify: `src/views/session/QuestionsPhase.tsx`

- [ ] **Step 1: Remove the unused-var suppressor**

Delete the line `void questions; // wired into render in Task 11`.

- [ ] **Step 2: Derive the current question**

Right after the existing `const mod = modules[currentMod] || ...` line, add:

```ts
  const q = questions[qIdx];
```

If `questions[qIdx]` could be undefined (during resume of a partial state), render nothing safely:

```ts
  if (!q) return null;
```

Place that `if (!q) return null;` immediately above the `const modLocalIdx = qIdx - mod.start;` line.

- [ ] **Step 3: Replace the question-stem block**

Find:

```tsx
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <span className="text-tx3 text-[13px]">Question text will appear here</span>
            </div>
```

Replace with:

```tsx
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <p className="text-tx text-[14px] leading-[1.65] m-0 whitespace-pre-wrap">{q.stem}</p>
            </div>
```

- [ ] **Step 4: Replace the passage block**

Find:

```tsx
                <div
                  className={`min-h-[100px] text-tx2 text-sm leading-[1.7] p-1 ${highlighting ? "select-text" : ""}`}
                >
                  Generated passage content. Select text while the highlight tool is active to mark
                  important sections for reference.
                </div>
```

Replace with:

```tsx
                <div
                  className={`min-h-[100px] text-tx2 text-sm leading-[1.7] p-1 ${highlighting ? "select-text" : ""}`}
                >
                  {q.passage ?? ""}
                </div>
```

Also change the outer `{isRW && (` gate to `{isRW && q.passage && (` so the passage box only renders when there actually is one:

```tsx
            {isRW && q.passage && (
```

- [ ] **Step 5: Replace the choice-text placeholder**

Find the span that renders `Answer placeholder`:

```tsx
                    <span className={`text-sm flex-1 ${sel ? "text-sel" : "text-tx2"}`}>
                      Answer placeholder
                    </span>
```

Replace with:

```tsx
                    <span className={`text-sm flex-1 ${sel ? "text-sel" : "text-tx2"}`}>
                      {q.choices[ci]}
                    </span>
```

- [ ] **Step 6: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/views/session/QuestionsPhase.tsx
git commit -m "feat: render real question content in QuestionsPhase"
```

---

## Task 12: Display real content + explanation in `ReviewPhase`

**Files:**
- Modify: `src/views/session/ReviewPhase.tsx`

- [ ] **Step 1: Remove the unused-var suppressor**

Delete the line `void questions; // wired into render in Task 12`.

- [ ] **Step 2: Derive the current question**

After `const mod = modules[currentMod] || ...`, add:

```ts
  const q = questions[qIdx];
```

Immediately after that, add a safety guard:

```ts
  if (!q) return null;
```

- [ ] **Step 3: Replace the question-text placeholder**

Find:

```tsx
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <span className="text-tx3 text-[13px]">Question text placeholder</span>
            </div>
```

Replace with:

```tsx
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <p className="text-tx text-[14px] leading-[1.65] m-0 whitespace-pre-wrap">{q.stem}</p>
            </div>
```

- [ ] **Step 4: Replace the passage placeholder**

Find:

```tsx
            {isRW && (
              <div className={`bg-sf border border-bdr rounded-lg p-6 ${wide ? "mb-0" : "mb-4"}`}>
                <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
                  Passage
                </div>
                <div className="min-h-[80px] border border-dashed border-bdr2 rounded-md flex items-center justify-center text-tx3 text-[13px] p-4">
                  Passage content
                </div>
              </div>
            )}
```

Replace with:

```tsx
            {isRW && q.passage && (
              <div className={`bg-sf border border-bdr rounded-lg p-6 ${wide ? "mb-0" : "mb-4"}`}>
                <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
                  Passage
                </div>
                <div className="text-tx2 text-sm leading-[1.7] whitespace-pre-wrap">
                  {q.passage}
                </div>
              </div>
            )}
```

- [ ] **Step 5: Replace the choice-text placeholder**

Find the line:

```tsx
                    <span className="text-sm flex-1">Answer placeholder{label}</span>
```

Replace with:

```tsx
                    <span className="text-sm flex-1">
                      {q.choices[ci]}
                      {label}
                    </span>
```

- [ ] **Step 6: Replace the explanation placeholder**

Find:

```tsx
              <p className="text-tx2 text-[13px] leading-[1.6] m-0">
                Explanation placeholder — AI-generated reasoning will appear here.
              </p>
```

Replace with:

```tsx
              <p className="text-tx2 text-[13px] leading-[1.6] m-0 whitespace-pre-wrap">
                {q.explanation}
              </p>
```

- [ ] **Step 7: Verify tsc**

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/views/session/ReviewPhase.tsx
git commit -m "feat: render real question content + explanation in ReviewPhase"
```

---

## Task 13: End-to-end verification with seed data

The bank is empty, so a real run needs a few seed rows. Insert 12 rows (enough for a 10-question practice session at any difficulty, plus headroom for the dedup retry budget) via the Supabase MCP.

**Files:**
- None modified. Data-only migration to the Supabase project.

- [ ] **Step 1: Insert seed rows**

From Claude Code with the Supabase MCP connected, run this SQL via `execute_sql` (project_id `udscmriuzyzxyqarpwnb`). It seeds 6 RW rows (2 per difficulty) and 6 math rows (2 per difficulty) across 2 skills each, so difficulty + skill filters all return data:

```sql
insert into public.questions
  (section, skill, difficulty, passage, stem, choices, correct_index, explanation)
values
  ('rw', 'Boundaries', 'easy', null, 'Which sentence is correctly punctuated?',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 0, 'Seed easy boundaries explanation.'),
  ('rw', 'Boundaries', 'easy', null, 'Identify the grammatical error.',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 1, 'Seed easy boundaries explanation 2.'),
  ('rw', 'Boundaries', 'med', null, 'Select the best revision.',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 2, 'Seed med boundaries explanation.'),
  ('rw', 'Inferences', 'med', 'Seed passage for inferences.', 'What can be inferred from the passage?',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 3, 'Seed med inferences explanation.'),
  ('rw', 'Inferences', 'hard', 'Seed passage for hard inferences.', 'Which conclusion is best supported?',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 0, 'Seed hard inferences explanation.'),
  ('rw', 'Inferences', 'hard', null, 'Select the most logical completion.',
   '["Option A","Option B","Option C","Option D"]'::jsonb, 2, 'Seed hard inferences explanation 2.'),
  ('math', 'Percentages', 'easy', null, 'What is 20% of 80?',
   '["12","16","20","24"]'::jsonb, 1, '20% = 0.2; 0.2 * 80 = 16.'),
  ('math', 'Percentages', 'easy', null, 'What is 50% of 46?',
   '["20","21","22","23"]'::jsonb, 3, '50% = half; 46/2 = 23.'),
  ('math', 'Percentages', 'med', null, 'A price rises 10% then falls 10%. Net change?',
   '["0%","−1%","+1%","−10%"]'::jsonb, 1, '1.1 * 0.9 = 0.99 = 1% decrease.'),
  ('math', 'Linear functions', 'med', null, 'Slope of y = 3x + 5?',
   '["3","5","−3","1/3"]'::jsonb, 0, 'Slope is the coefficient of x.'),
  ('math', 'Linear functions', 'hard', null, 'Find x if 2(x+3) = 4x - 6.',
   '["3","4","5","6"]'::jsonb, 3, '2x+6 = 4x-6; 12 = 2x; x = 6.'),
  ('math', 'Linear functions', 'hard', null, 'If f(x) = 2x+1, f(f(3)) = ?',
   '["11","13","15","17"]'::jsonb, 2, 'f(3)=7; f(7)=15.');
```

- [ ] **Step 2: Verify row count**

```sql
select count(*) from public.questions;
```

Expected: `12`.

- [ ] **Step 3: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 4: Manual end-to-end check**

In the browser:

1. Practice → select skill **Boundaries** → count **10** → difficulty **Easy** → Start.
   Expected: loading phase, then error "Not enough easy questions" (only 2 easy Boundaries rows seeded). Click Back.
2. Practice → select **Boundaries** + **Inferences** + **Percentages** + **Linear functions** → count **10** → difficulty **Mixed** → Start.
   Expected: loading phase, then questions appear. Answer a few, inspect that the stems match the seed text. Navigate to Summary → Submit Practice.
3. Click **Review Questions**. Confirm stems, passages (where present), choices, and the explanation box all show real seed content. "✓ Correct" / "✗ Wrong" reflect the `correct_index` from the seed.
4. Start a second Practice with the same skills + difficulty. Confirm it does **not** serve the same question IDs (cooldown kicking in). You can verify by opening DevTools → Application → Local Storage → `sat:recentBySkill` and seeing the IDs from session 1.

- [ ] **Step 5: Run the full test suite + type check one last time**

```bash
npm test && npx tsc --noEmit && npm run build
```

Expected: tests pass, tsc exits 0, vite build succeeds.

- [ ] **Step 6: No commit** — this task writes no files. Data lives in Supabase.

---

## Out of scope (follow-ups tracked separately)

- KaTeX rendering of `$...$` in stem / choices / explanation.
- Chart renderer for `chart_data` jsonb.
- Image rendering from `image_path` via Supabase Storage public URLs.
- Anthropic generation pipeline to populate the bank beyond the 12 seed rows.
- Account-backed cooldown (replaces the localStorage `recentBySkill` buffer).
- RTL-based UI tests for the phase components.
