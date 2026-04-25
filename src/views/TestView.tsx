import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import type { SessionType, Skill } from "../types";

interface TestViewProps {
  onStart: (type: SessionType, n: number, skills: Skill[]) => void;
}

type TestLength = "full" | "half";

export default function TestView({ onStart }: TestViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [length, setLength] = useState<TestLength>("full");
  const n = length === "full" ? 98 : 49;

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[26px] font-bold mb-1.5">Test</h1>
        <p className="text-tx3 text-sm mb-9">Simulate a full or half-length SAT.</p>
        <SkillSelector skills={skills} setSkills={setSkills} />
        <div className="border-t border-bdr pt-6 flex items-center justify-between">
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
          <Btn onClick={() => onStart("test", n, skills)} disabled={skills.length === 0}>
            Start Test ({skills.length} skill{skills.length !== 1 ? "s" : ""})
          </Btn>
        </div>
      </div>
    </Shell>
  );
}
