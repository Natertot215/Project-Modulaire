import { memo } from "react";
import Shell from "../../components/primitives/Shell";
import Btn from "../../components/primitives/Btn";
import Label from "../../components/primitives/Label";
import { getGridCols } from "../../lib/grid";
import type { FlagMap, ReviewResult, SessionType } from "../../types";

interface ResultsPhaseProps {
  sessionType: SessionType;
  results: ReviewResult[];
  flags: FlagMap;
  total: number;
  onHome: () => void;
  onReview: () => void;
}

function ResultsPhase({ sessionType, results, flags, total, onHome, onReview }: ResultsPhaseProps) {
  const correct = results.filter((r) => r.correct).length;
  const attempted = results.filter((r) => r.answered).length;
  const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return (
    <Shell wide>
      <div className="max-w-[600px] mx-auto text-center">
        <div className="w-[110px] h-[110px] rounded-full mx-auto mb-5 border-[3px] border-tx2 flex items-center justify-center bg-sf">
          <span className="text-[32px] font-bold text-tx">{pct}%</span>
        </div>
        <h1 className="text-[22px] font-bold mb-1">
          {sessionType === "test" ? "Test" : "Practice"} Complete
        </h1>
        <p className="text-tx2 text-sm mb-2">
          {correct} correct out of {attempted} attempted ({total} total)
        </p>
        <div className="bg-sf border border-bdr rounded-[10px] p-5 text-left my-7">
          <Label>Breakdown</Label>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${getGridCols(total)}, 1fr)` }}
          >
            {results.map((r, i) => {
              const fl = flags[i];
              let cls = "border-bdr text-tx3";
              if (fl) cls = "border-warn text-warn";
              else if (r.correct) cls = "border-ok text-ok";
              else if (r.answered) cls = "border-bad text-bad";
              return (
                <div
                  key={i}
                  className={`py-[7px] rounded-[5px] text-center text-[10px] font-semibold bg-transparent border-[1.5px] ${cls}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2.5 justify-center">
          <Btn onClick={onHome}>Home</Btn>
          <Btn onClick={onReview}>Review Questions</Btn>
        </div>
      </div>
    </Shell>
  );
}

export default memo(ResultsPhase);
