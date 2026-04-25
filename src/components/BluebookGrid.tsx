import { getGridCols } from "../lib/grid";
import type { AnswerMap, FlagMap, Module } from "../types";

interface BluebookGridProps {
  mod: Module;
  answers: AnswerMap;
  flags: FlagMap;
  qIdx: number;
  onClickQ: (gi: number) => void;
  forceCols?: number;
}

export default function BluebookGrid({ mod, answers, flags, qIdx, onClickQ, forceCols }: BluebookGridProps) {
  const cols = forceCols || getGridCols(mod.count);

  return (
    <div
      className="grid gap-2 justify-center"
      style={{ gridTemplateColumns: `repeat(${cols}, 44px)` }}
    >
      {Array.from({ length: mod.count }, (_, i) => {
        const gi = mod.start + i;
        const ans = answers[gi] != null;
        const fl = flags[gi];
        const cur = gi === qIdx;

        let cls = "";
        if (cur) cls = "bg-sf3 text-tx border-solid border-tx2 border-2";
        else if (fl) cls = "bg-warn-dim text-warn border-solid border-warn border-2";
        else if (ans) cls = "bg-sf2 text-tx2 border-solid border-bdr border-2";
        else cls = "bg-transparent text-tx3 border-dashed border-bdr2 border-2";

        return (
          <button
            key={i}
            onClick={() => onClickQ(gi)}
            aria-label={`Question ${i + 1}${cur ? " (current)" : ""}${ans ? " answered" : ""}${fl ? " flagged" : ""}`}
            className={`w-11 h-11 rounded-md text-sm font-semibold cursor-pointer flex items-center justify-center ${cls}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
