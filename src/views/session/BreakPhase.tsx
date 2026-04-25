import { memo } from "react";
import Shell from "../../components/primitives/Shell";
import BluebookGrid from "../../components/BluebookGrid";
import type { AnswerMap, FlagMap, Module, Phase, SessionType } from "../../types";

interface BreakPhaseProps {
  sessionType: SessionType;
  modules: Module[];
  currentMod: number;
  qIdx: number;
  answers: AnswerMap;
  flags: FlagMap;
  onSetQIdx: (i: number) => void;
  onSetPhase: (p: Phase) => void;
  onNextModule: () => void;
  onSubmit: () => void;
  onRestart: () => void;
}

function BreakPhase({
  sessionType,
  modules,
  currentMod,
  qIdx,
  answers,
  flags,
  onSetQIdx,
  onSetPhase,
  onNextModule,
  onSubmit,
  onRestart,
}: BreakPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" };
  const isLastMod = currentMod === modules.length - 1;
  const modAnswered = Array.from({ length: mod.count }, (_, i) => answers[mod.start + i] != null).filter(Boolean).length;
  const modFlagged = Array.from({ length: mod.count }, (_, i) => flags[mod.start + i]).filter(Boolean).length;

  const primaryLabel =
    isLastMod || sessionType === "practice"
      ? sessionType === "practice"
        ? "Submit Practice"
        : "Submit Test"
      : "Proceed to Next Module";
  const primaryOnClick = isLastMod || sessionType === "practice" ? onSubmit : onNextModule;

  const btnClass =
    "py-3 rounded-lg text-sm font-semibold border border-bdr bg-transparent text-tx2 cursor-pointer transition-all duration-[120ms]";

  return (
    <Shell wide>
      <div className="max-w-[560px] mx-auto text-center">
        <h2 className="text-xl font-bold mb-1.5">{mod.label}</h2>
        <p className="text-tx3 text-[13px] mb-7">Questions</p>
        <div className="flex justify-center mb-7">
          <BluebookGrid
            mod={mod}
            answers={answers}
            flags={flags}
            qIdx={qIdx}
            forceCols={9}
            onClickQ={(gi) => {
              onSetQIdx(gi);
              onSetPhase("questions");
            }}
          />
        </div>
        <div className="flex gap-4 justify-center mb-8 text-[13px]">
          <span className="text-tx2">{modAnswered} answered</span>
          {mod.count - modAnswered > 0 && (
            <span className="text-tx3">{mod.count - modAnswered} unanswered</span>
          )}
          {modFlagged > 0 && <span className="text-tx3">{modFlagged} flagged</span>}
        </div>
        <div className="grid grid-cols-2 gap-2.5 mx-auto max-w-[468px]">
          <button onClick={() => onSetPhase("questions")} className={btnClass}>
            Back to Questions
          </button>
          <button onClick={primaryOnClick} className={btnClass}>
            {primaryLabel}
          </button>
        </div>
        <button
          onClick={onRestart}
          className="bg-transparent border-0 text-tx3 text-[13px] cursor-pointer p-0 mt-5 transition-colors duration-[120ms]"
        >
          Restart Module
        </button>
      </div>
    </Shell>
  );
}

export default memo(BreakPhase);
