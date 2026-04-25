import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import DifficultySelector, { DIFFICULTY_OPTIONS } from "../components/DifficultySelector";
import useWideAspect from "../hooks/useWideAspect";
import type { DifficultyChoice, SessionType, Skill } from "../types";

interface PracticeViewProps {
  onStart: (type: SessionType, n: number, skills: Skill[]) => void;
}

const COUNT_OPTIONS = [10, 20, 30, 40, 50, 60] as const;

const INLINE_LABEL_CLS =
  "text-[11px] font-semibold text-tx3 uppercase tracking-[.08em] whitespace-nowrap";

export default function PracticeView({ onStart }: PracticeViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pCount, setPCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("mixed");
  // Default = stacked. Switch to inline single-row toolbar at >= 14.5:9
  // (≈1.611) — just under 16:9 so a slightly-shrunk browser stays inline,
  // but mobile / portrait / strongly-narrowed windows fall back to stacked.
  const inline = useWideAspect(14.5 / 9);
  // `difficulty` drives the active-state UI in both layouts. Wiring it
  // through to onStart / the session fetch happens when the Supabase
  // plan executes.

  const startBtn = (
    <Btn
      small
      onClick={() => onStart("practice", pCount, skills)}
      disabled={skills.length === 0}
    >
      Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})
    </Btn>
  );

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[26px] font-bold mb-1.5">Practice</h1>
        <p className="text-tx3 text-sm mb-9">
          Select skills from either or both sections.
        </p>
        <SkillSelector skills={skills} setSkills={setSkills} />

        {inline ? (
          <div className="border-t border-bdr pt-6 grid items-center gap-4 grid-cols-[auto_minmax(0,6fr)_auto_auto_minmax(0,4fr)_auto_auto]">
            <span className={INLINE_LABEL_CLS}>Questions</span>
            <div className="grid grid-cols-6 gap-1.5 min-w-0">
              {COUNT_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  fullWidth
                  large
                  active={pCount === n}
                  onClick={() => setPCount(n)}
                >
                  {n}
                </Pill>
              ))}
            </div>
            <div className="h-7 w-px bg-bdr" aria-hidden />
            <span className={INLINE_LABEL_CLS}>Difficulty</span>
            <div className="grid grid-cols-4 gap-1.5 min-w-0">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  fullWidth
                  large
                  active={difficulty === opt.value}
                  onClick={() => setDifficulty(opt.value)}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>
            <div className="h-7 w-px bg-bdr" aria-hidden />
            {startBtn}
          </div>
        ) : (
          <div className="border-t border-bdr pt-6 flex flex-col gap-5">
            <div>
              <Label>Questions</Label>
              <div className="grid grid-cols-6 gap-1.5 mt-2">
                {COUNT_OPTIONS.map((n) => (
                  <Pill
                    key={n}
                    fullWidth
                    large
                    active={pCount === n}
                    onClick={() => setPCount(n)}
                  >
                    {n}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <Label>Difficulty</Label>
              <div className="mt-2">
                <DifficultySelector
                  value={difficulty}
                  onChange={setDifficulty}
                  large
                />
              </div>
            </div>
            <div className="flex justify-end">{startBtn}</div>
          </div>
        )}
      </div>
    </Shell>
  );
}
