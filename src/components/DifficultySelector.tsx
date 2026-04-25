import Pill from "./primitives/Pill";
import type { DifficultyChoice } from "../types";

export const DIFFICULTY_OPTIONS: ReadonlyArray<{ value: DifficultyChoice; label: string }> = [
  { value: "mixed", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "med", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface DifficultySelectorProps {
  value: DifficultyChoice;
  onChange: (d: DifficultyChoice) => void;
  large?: boolean;
}

export default function DifficultySelector({ value, onChange, large }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {DIFFICULTY_OPTIONS.map((o) => (
        <Pill
          key={o.value}
          fullWidth
          large={large}
          active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Pill>
      ))}
    </div>
  );
}
