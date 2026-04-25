import type { Dispatch, SetStateAction } from "react";
import Pill from "./primitives/Pill";
import { TAXONOMY, allSkills } from "../data/taxonomy";
import type { Skill } from "../types";

type Sec = "rw" | "math";

interface ColumnProps {
  sec: Sec;
  skills: Skill[];
  onToggleSkill: (s: Skill) => void;
  onToggleCategory: (sec: Sec, sub: string) => void;
  onToggleSection: (sec: Sec) => void;
}

function SkillColumn({ sec, skills, onToggleSkill, onToggleCategory, onToggleSection }: ColumnProps) {
  const t = TAXONOMY[sec];
  const all = allSkills(sec);
  const allSel = all.every((s) => skills.includes(s));

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[17px] font-bold text-tx">{t.label}</span>
        <button
          onClick={() => onToggleSection(sec)}
          aria-label={`${allSel ? "Deselect" : "Select"} all ${t.label} skills`}
          className={`rounded-[5px] px-[11px] py-[5px] text-xs font-semibold cursor-pointer transition-all duration-[120ms] border ${
            allSel ? "bg-sel-dim text-sel border-tx2" : "bg-transparent text-tx3 border-bdr"
          }`}
        >
          {allSel ? "Deselect All" : "Select All"}
        </button>
      </div>
      {Object.entries(t.subtypes).map(([sub, subSkills]) => {
        const catAll = subSkills.every((s) => skills.includes(s));
        const catCount = subSkills.filter((s) => skills.includes(s)).length;
        return (
          <div key={sub} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => onToggleCategory(sec, sub)}
                aria-label={`Toggle category ${sub}`}
                className={`bg-transparent border-0 cursor-pointer p-0 text-[13px] font-semibold transition-colors duration-[120ms] ${
                  catAll ? "text-tx" : "text-tx2"
                }`}
              >
                {sub}
              </button>
              <span className="text-[11px] text-tx3">
                {catCount}/{subSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subSkills.map((s) => (
                <Pill key={s} active={skills.includes(s)} onClick={() => onToggleSkill(s)}>
                  {s}
                </Pill>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SkillSelectorProps {
  skills: Skill[];
  setSkills: Dispatch<SetStateAction<Skill[]>>;
}

export default function SkillSelector({ skills, setSkills }: SkillSelectorProps) {
  const toggleSkill = (s: Skill) =>
    setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const toggleCategory = (sec: Sec, sub: string) => {
    const cat = TAXONOMY[sec].subtypes[sub];
    if (cat.every((s) => skills.includes(s))) {
      setSkills((p) => p.filter((x) => !cat.includes(x)));
    } else {
      setSkills((p) => [...new Set([...p, ...cat])]);
    }
  };

  const toggleSection = (sec: Sec) => {
    const all = allSkills(sec);
    if (all.every((s) => skills.includes(s))) {
      setSkills((p) => p.filter((x) => !all.includes(x)));
    } else {
      setSkills((p) => [...new Set([...p, ...all])]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <SkillColumn
        sec="math"
        skills={skills}
        onToggleSkill={toggleSkill}
        onToggleCategory={toggleCategory}
        onToggleSection={toggleSection}
      />
      <SkillColumn
        sec="rw"
        skills={skills}
        onToggleSkill={toggleSkill}
        onToggleCategory={toggleCategory}
        onToggleSection={toggleSection}
      />
    </div>
  );
}
