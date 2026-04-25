import { memo } from "react";
import Btn from "../../components/primitives/Btn";
import ModuleDropdown from "../../components/ModuleDropdown";
import { isRWSkill } from "../../data/taxonomy";
import type { CrossoutMap, FlagMap, Module, ReviewResult, SessionType, Skill } from "../../types";

interface ReviewPhaseProps {
  sessionType: SessionType;
  modules: Module[];
  currentMod: number;
  qIdx: number;
  questionSkills: Skill[];
  results: ReviewResult[];
  flags: FlagMap;
  crossouts: CrossoutMap;
  wide: boolean;
  onHome: () => void;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (mi: number) => void;
}

function ReviewPhase({
  sessionType,
  modules,
  currentMod,
  qIdx,
  questionSkills,
  results,
  flags,
  crossouts,
  wide,
  onHome,
  onSetQIdx,
  onSetCurrentMod,
}: ReviewPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" };
  const modLocalIdx = qIdx - mod.start;
  const isLastMod = currentMod === modules.length - 1;
  const r = results[qIdx] || ({} as Partial<ReviewResult>);
  const choices = ["A", "B", "C", "D"];
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");

  const statusLabel = r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped";
  const statusClass = r.correct
    ? "bg-ok-dim text-ok"
    : r.answered
      ? "bg-bad-dim text-bad"
      : "bg-sf2 text-tx3";

  return (
    <div className="min-h-screen bg-bg text-tx flex flex-col">
      <div className="pt-5 px-pad pb-2 grid grid-cols-[1fr_auto_1fr] items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          <button
            onClick={onHome}
            aria-label="Home"
            className="bg-sf2 border border-bdr rounded-md text-tx3 text-xs cursor-pointer px-2.5 py-[5px] w-9 flex items-center justify-center transition-all duration-[120ms]"
          >
            ⌂
          </button>
          <ModuleDropdown
            modules={modules}
            currentMod={currentMod}
            onSelect={(mi) => {
              onSetCurrentMod(mi);
              onSetQIdx(modules[mi].start);
            }}
          />
        </div>
        <span className="text-[13px] font-semibold text-center">
          Review: {modLocalIdx + 1} <span className="text-tx3 font-normal">/ {mod.count}</span>
        </span>
        <div className="flex justify-end">
          <span className={`px-3 py-[5px] rounded-md text-xs font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div
        className="px-pad pb-4 grid gap-[3px] flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${mod.count}, 1fr)` }}
      >
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const rr = results[gi] || ({} as Partial<ReviewResult>);
          const fl = flags[gi];
          let cls = "border-bdr text-tx3";
          if (fl) cls = "border-warn text-warn";
          else if (rr.correct) cls = "border-ok text-ok";
          else if (rr.answered) cls = "border-bad text-bad";

          return (
            <button
              key={i}
              onClick={() => onSetQIdx(gi)}
              aria-label={`Review question ${i + 1}${cur ? " (current)" : ""}`}
              className={`h-9 rounded-[5px] text-[11px] font-semibold border-[1.5px] cursor-pointer flex items-center justify-center transition-all duration-[120ms] ${
                cur ? "bg-sf3 border-tx2 text-tx" : `bg-transparent ${cls}`
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-pad pb-7 w-full">
        <div className="text-[11px] text-tx2 font-semibold uppercase tracking-[.07em] mb-2">
          {qSkill || "Skill"}
        </div>
        <div className={wide ? "grid grid-cols-[1fr_380px] gap-6" : "block"}>
          <div>
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <span className="text-tx3 text-[13px]">Question text placeholder</span>
            </div>
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
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {choices.map((letter, ci) => {
                const wasYours = r.picked === ci;
                const isCorrect = r.correctChoice === ci;
                const wasCrossed = crossouts[`${qIdx}-${ci}`];
                let wrapCls = "border-bdr bg-transparent text-tx2";
                let badgeCls = "bg-sf text-tx3 border-bdr2";
                let label = "";
                if (isCorrect) {
                  wrapCls = "border-ok bg-ok-dim text-ok";
                  badgeCls = "bg-ok-dim text-ok border-transparent";
                  label = " ✓";
                }
                if (wasYours && !isCorrect) {
                  wrapCls = "border-bad bg-bad-dim text-bad";
                  badgeCls = "bg-bad-dim text-bad border-transparent";
                  label = " ✗";
                }
                const fade = wasCrossed && !isCorrect && !wasYours;

                return (
                  <div
                    key={ci}
                    className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg border-[1.5px] ${wrapCls} ${
                      fade ? "opacity-40 line-through" : ""
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border ${badgeCls}`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm flex-1">Answer placeholder{label}</span>
                    {wasYours && !isCorrect && (
                      <span className="text-[11px] font-semibold">Your answer</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 px-[18px] py-[14px] bg-sf rounded-lg border border-bdr">
              <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-2 font-semibold">
                Explanation
              </div>
              <p className="text-tx2 text-[13px] leading-[1.6] m-0">
                Explanation placeholder — AI-generated reasoning will appear here.
              </p>
            </div>
            <div className="flex justify-between mt-6">
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>
                ← Prev
              </Btn>
              {modLocalIdx < mod.count - 1 ? (
                <Btn small onClick={() => onSetQIdx(qIdx + 1)}>
                  Next →
                </Btn>
              ) : isLastMod ? (
                <Btn small onClick={onHome}>
                  Done
                </Btn>
              ) : (
                <Btn small onClick={() => onSetCurrentMod(currentMod + 1)}>
                  Next Module →
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReviewPhase);
