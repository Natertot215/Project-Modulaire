import { memo } from "react";
import Btn from "../../components/primitives/Btn";
import ModuleDropdown from "../../components/ModuleDropdown";
import { isRWSkill } from "../../data/taxonomy";
import type { AnswerMap, CrossoutMap, FlagMap, Module, Skill } from "../../types";

interface QuestionsPhaseProps {
  sessionType: "practice" | "test";
  modules: Module[];
  currentMod: number;
  qIdx: number;
  questionSkills: Skill[];
  answers: AnswerMap;
  flags: FlagMap;
  crossouts: CrossoutMap;
  highlighting: boolean;
  confirmHome: boolean;
  answeredCount: number;
  wide: boolean;
  onConfirmHome: () => void;
  onCancelHome: () => void;
  onSaveAndExit: () => void;
  onDiscardHome: () => void;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (mi: number) => void;
  onToggleHighlight: () => void;
  onToggleFlag: () => void;
  onSetAnswer: (ci: number) => void;
  onToggleCrossout: (ci: number) => void;
  onGoBreak: () => void;
}

function QuestionsPhase({
  sessionType,
  modules,
  currentMod,
  qIdx,
  questionSkills,
  answers,
  flags,
  crossouts,
  highlighting,
  confirmHome,
  answeredCount,
  wide,
  onConfirmHome,
  onCancelHome,
  onSaveAndExit,
  onDiscardHome,
  onSetQIdx,
  onSetCurrentMod,
  onToggleHighlight,
  onToggleFlag,
  onSetAnswer,
  onToggleCrossout,
  onGoBreak,
}: QuestionsPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" };
  const modLocalIdx = qIdx - mod.start;
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");
  const choices = ["A", "B", "C", "D"];
  const showSkill = sessionType === "practice";

  return (
    <div className="min-h-screen bg-bg text-tx flex flex-col">
      {confirmHome && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay"
        >
          <div className="bg-sf border border-bdr rounded-xl p-7 max-w-[400px] w-[90%] text-center">
            <p id="leave-title" className="text-[15px] font-semibold mb-1.5 m-0">Leave session?</p>
            <p className="text-[13px] text-tx3 mb-6 m-0">
              {answeredCount} question{answeredCount !== 1 ? "s" : ""} attempted.
            </p>
            <div className="flex gap-2.5 justify-center">
              <Btn small onClick={onCancelHome}>Cancel</Btn>
              <Btn small onClick={onSaveAndExit}>Save & Exit</Btn>
              <Btn small danger onClick={onDiscardHome}>Discard</Btn>
            </div>
          </div>
        </div>
      )}

      <div className="pt-5 px-pad pb-2 grid grid-cols-[1fr_auto_1fr] items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          <button
            onClick={onConfirmHome}
            aria-label="Home"
            className="bg-sf2 border border-bdr rounded-md text-tx3 text-xs cursor-pointer px-2.5 py-[5px] w-9 flex items-center justify-center transition-all duration-[120ms]"
          >
            ⌂
          </button>
          {showSkill && (
            <span className="bg-sf2 border border-bdr rounded-md px-3 py-[5px] text-xs text-tx2">
              {qSkill || "Skill"}
            </span>
          )}
          <button
            onClick={onGoBreak}
            className="bg-sf2 border border-bdr rounded-md text-tx2 text-xs cursor-pointer px-3 py-[5px] transition-all duration-[120ms]"
          >
            Summary
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
          {modLocalIdx + 1} <span className="text-tx3 font-normal">/ {mod.count}</span>
        </span>
        <div className="flex justify-end gap-2">
          <button
            onClick={onToggleHighlight}
            aria-label={highlighting ? "Disable highlighting" : "Enable highlighting"}
            aria-pressed={highlighting}
            className={`rounded-md px-2.5 py-[5px] text-xs min-w-9 text-center cursor-pointer transition-all duration-[120ms] border ${
              highlighting ? "bg-sel-dim border-tx2 text-sel" : "bg-sf2 border-bdr text-tx3"
            }`}
          >
            ✎
          </button>
          <button
            onClick={onToggleFlag}
            aria-label={flags[qIdx] ? "Unflag question" : "Flag question"}
            aria-pressed={!!flags[qIdx]}
            className={`rounded-md px-2.5 py-[5px] text-xs min-w-[80px] text-center cursor-pointer transition-all duration-[120ms] border ${
              flags[qIdx] ? "bg-warn-dim border-warn text-warn" : "bg-sf2 border-bdr text-tx3"
            }`}
          >
            {flags[qIdx] ? "⚑ Flagged" : "⚐ Flag"}
          </button>
        </div>
      </div>

      <div
        className="px-pad pb-4 grid gap-[3px] flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${mod.count}, 1fr)` }}
      >
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const ans = answers[gi] != null;
          const fl = flags[gi];
          let cls = "border-bdr bg-transparent text-tx3";
          if (cur) cls = "border-tx2 bg-sf3 text-tx";
          else if (fl) cls = "border-warn bg-warn-dim text-warn";
          else if (ans) cls = "border-bdr bg-sf2 text-tx2";

          return (
            <button
              key={i}
              onClick={() => onSetQIdx(gi)}
              aria-label={`Question ${i + 1}${cur ? " (current)" : ""}${ans ? " answered" : ""}${fl ? " flagged" : ""}`}
              className={`h-9 rounded-[5px] text-[11px] font-semibold cursor-pointer flex items-center justify-center transition-all duration-[120ms] border ${cls}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-pad pb-7 w-full">
        <div className={wide ? "grid grid-cols-[1fr_380px] gap-6" : "block"}>
          <div>
            <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
              <span className="text-tx3 text-[13px]">Question text will appear here</span>
            </div>
            {isRW && (
              <div
                className={`${highlighting ? "hl-passage border-warn cursor-text" : "border-bdr cursor-default"} bg-sf border rounded-lg p-6 transition-colors duration-150 ${wide ? "mb-0" : "mb-4"}`}
                onMouseUp={() => {
                  if (!highlighting) return;
                  const sel = window.getSelection();
                  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
                  const range = sel.getRangeAt(0);
                  const mark = document.createElement("mark");
                  try {
                    range.surroundContents(mark);
                  } catch {
                    /* selection spans non-text boundaries — ignore */
                  }
                  sel.removeAllRanges();
                }}
              >
                <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
                  Passage{" "}
                  {highlighting && (
                    <span className="text-warn font-normal">— highlighting on</span>
                  )}
                </div>
                <div
                  className={`min-h-[100px] text-tx2 text-sm leading-[1.7] p-1 ${highlighting ? "select-text" : ""}`}
                >
                  Generated passage content. Select text while the highlight tool is active to mark
                  important sections for reference.
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {choices.map((letter, ci) => {
                const sel = answers[qIdx] === ci;
                const crossed = crossouts[`${qIdx}-${ci}`];
                return (
                  <button
                    key={ci}
                    onClick={() => {
                      if (!crossed) onSetAnswer(ci);
                    }}
                    aria-pressed={sel}
                    aria-label={`Choice ${letter}${sel ? " (selected)" : ""}${crossed ? " (crossed out)" : ""}`}
                    className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg text-left transition-all duration-100 border ${
                      sel ? "border-tx2 bg-sel-dim" : "border-bdr bg-transparent"
                    } ${crossed ? "cursor-default line-through" : "cursor-pointer"} ${
                      crossed && !sel ? "opacity-[.35]" : "opacity-100"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border ${
                        sel
                          ? "border-transparent bg-sel-dim text-sel"
                          : "border-bdr2 bg-sf text-tx3"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className={`text-sm flex-1 ${sel ? "text-sel" : "text-tx2"}`}>
                      Answer placeholder
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCrossout(ci);
                      }}
                      role="button"
                      aria-label={crossed ? `Uncross out ${letter}` : `Cross out ${letter}`}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold flex-shrink-0 cursor-pointer transition-all duration-[120ms] border ${
                        crossed ? "border-tx3 bg-sf2 text-tx2" : "border-bdr2 bg-transparent text-tx3"
                      }`}
                    >
                      ✕
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>
                ← Prev
              </Btn>
              {modLocalIdx < mod.count - 1 ? (
                <Btn small onClick={() => onSetQIdx(qIdx + 1)}>
                  Next →
                </Btn>
              ) : (
                <Btn small onClick={onGoBreak}>
                  Module Summary
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(QuestionsPhase);
