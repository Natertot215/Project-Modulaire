import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Back from "../components/primitives/Back";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import { getGridCols } from "../lib/grid";
import type { HistoryEntry, ReviewResult } from "../types";

interface ReviewFromHistoryProps {
  session: HistoryEntry;
  idx: number;
  onNav: (i: number) => void;
  onBack: () => void;
}

function ReviewFromHistory({ session: s, idx: ri, onNav, onBack }: ReviewFromHistoryProps) {
  const rd: ReviewResult[] = s.reviewData || [];
  const r = rd[ri] || ({} as Partial<ReviewResult>);
  const choices = ["A", "B", "C", "D"];

  const statusLabel = r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped";
  const statusClass = r.correct
    ? "bg-ok-dim text-ok"
    : r.answered
      ? "bg-bad-dim text-bad"
      : "bg-sf2 text-tx3";

  return (
    <div className="min-h-screen bg-bg text-tx flex flex-col">
      <div className="pt-5 px-pad pb-2 grid grid-cols-[1fr_auto_1fr] items-center flex-shrink-0">
        <Back onClick={onBack} label="Session" />
        <span className="text-[13px] font-semibold text-center">
          Review: {ri + 1} <span className="text-tx3 font-normal">/ {rd.length}</span>
        </span>
        <div className="flex justify-end">
          <span className={`px-3 py-[5px] rounded-md text-xs font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div
        className="px-pad pb-4 grid gap-[3px] flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${rd.length}, 1fr)` }}
      >
        {rd.map((rr, i) => {
          const cur = i === ri;
          let cls = "border-bdr text-tx3";
          if (rr.correct) cls = "border-ok text-ok";
          else if (rr.answered) cls = "border-bad text-bad";

          return (
            <button
              key={i}
              onClick={() => onNav(i)}
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
          {r.skill || "Skill"}
        </div>
        <div className="px-5 py-4 bg-sf rounded-lg border border-bdr mb-4">
          <span className="text-tx3 text-[13px]">Question text placeholder</span>
        </div>
        {r.isRW && (
          <div className="bg-sf border border-bdr rounded-lg p-6 mb-4">
            <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">Passage</div>
            <div className="min-h-[80px] border border-dashed border-bdr2 rounded-md flex items-center justify-center text-tx3 text-[13px] p-4">
              Passage content
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {choices.map((letter, ci) => {
            const wasYours = r.picked === ci;
            const isCorrect = r.correctChoice === ci;
            let wrapCls = "border-bdr bg-transparent text-tx2";
            let badgeCls = "bg-sf text-tx3";
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
            return (
              <div
                key={ci}
                className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg border-[1.5px] ${wrapCls}`}
              >
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border border-bdr2 ${badgeCls}`}
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
          <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-2 font-semibold">Explanation</div>
          <p className="text-tx2 text-[13px] leading-[1.6] m-0">Explanation placeholder.</p>
        </div>
        <div className="flex justify-between mt-6">
          <Btn small disabled={ri === 0} onClick={() => onNav(ri - 1)}>
            ← Prev
          </Btn>
          {ri < rd.length - 1 ? (
            <Btn small onClick={() => onNav(ri + 1)}>
              Next →
            </Btn>
          ) : (
            <Btn small onClick={onBack}>
              Done
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

interface SessionDetailProps {
  session: HistoryEntry;
  onBack: () => void;
  onDelete: () => void;
  onReview: () => void;
}

function SessionDetail({ session: s, onBack, onDelete, onReview }: SessionDetailProps) {
  const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
  const hasReview = s.reviewData && s.reviewData.length > 0;

  return (
    <Shell wide>
      <div className="max-w-[760px] mx-auto">
        <Back onClick={onBack} label="History" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold mb-1.5">{s.type}</h1>
            <p className="text-tx3 text-sm m-0">
              {s.date} · {s.attempted} attempted
            </p>
          </div>
          <div className="text-right">
            <div className="text-[32px] font-bold text-tx">{pct}%</div>
            <div className="text-[13px] text-tx3">
              {s.correct}/{s.attempted}
            </div>
          </div>
        </div>
        <div className="bg-sf border border-bdr rounded-[10px] p-5 mt-6">
          <Label>Breakdown</Label>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${getGridCols(s.total)}, 1fr)` }}
          >
            {s.breakdown.map((correct, i) => {
              const fl = s.flagged && s.flagged[i];
              let cls = "border-bad text-bad";
              if (fl) cls = "border-warn text-warn";
              else if (correct) cls = "border-ok text-ok";
              return (
                <div
                  key={i}
                  className={`py-2 rounded-[5px] text-center text-[11px] font-semibold bg-transparent border-[1.5px] ${cls}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2.5 mt-5">
          {hasReview && (
            <Btn small onClick={onReview}>
              Review Questions
            </Btn>
          )}
          <Btn danger small onClick={onDelete}>
            Delete
          </Btn>
        </div>
      </div>
    </Shell>
  );
}

interface HistoryViewProps {
  history: HistoryEntry[];
  onDelete: (id: number) => void;
}

export default function HistoryView({ history, onDelete }: HistoryViewProps) {
  const [viewing, setViewing] = useState<HistoryEntry | null>(null);
  const [review, setReview] = useState<{ session: HistoryEntry; idx: number } | null>(null);

  if (review) {
    return (
      <ReviewFromHistory
        session={review.session}
        idx={review.idx}
        onNav={(i) => setReview({ session: review.session, idx: i })}
        onBack={() => setReview(null)}
      />
    );
  }

  if (viewing) {
    return (
      <SessionDetail
        session={viewing}
        onBack={() => setViewing(null)}
        onDelete={() => {
          onDelete(viewing.id);
          setViewing(null);
        }}
        onReview={() => setReview({ session: viewing, idx: 0 })}
      />
    );
  }

  return (
    <Shell>
      <div className="max-w-[680px] mx-auto">
        <h1 className="text-[26px] font-bold mb-1.5">History</h1>
        <p className="text-tx3 text-sm mb-9">Past sessions and scores.</p>
        {history.length === 0 && <p className="text-tx3 text-[15px]">No sessions yet.</p>}
        <div className="flex flex-col gap-2">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center bg-sf border border-bdr rounded-[9px] overflow-hidden"
            >
              <button
                onClick={() => setViewing(h)}
                className="flex-1 grid grid-cols-[80px_1fr_72px] px-[18px] py-4 items-center bg-transparent border-0 cursor-pointer text-left transition-all duration-[120ms]"
              >
                <span className="text-tx3 text-sm">{h.date}</span>
                <span className="text-tx2 text-sm">{h.type}</span>
                <span className="text-right font-semibold text-[15px] text-tx">
                  {h.correct}/{h.attempted}
                </span>
              </button>
              <button
                onClick={() => onDelete(h.id)}
                aria-label={`Delete session from ${h.date}`}
                className="w-12 self-stretch bg-transparent border-0 border-l border-bdr cursor-pointer text-tx3 text-base flex items-center justify-center transition-all duration-[120ms]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
