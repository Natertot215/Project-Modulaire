import { useState } from "react";
import Shell from "../components/primitives/Shell.jsx";
import Back from "../components/primitives/Back.jsx";
import Btn from "../components/primitives/Btn.jsx";
import Label from "../components/primitives/Label.jsx";
import { C, ff, PAD } from "../styles/theme.js";
import { getGridCols } from "../lib/grid.js";

function ReviewFromHistory({ session: s, idx: ri, onNav, onBack }) {
  const rd = s.reviewData || [];
  const r = rd[ri] || {};
  const choices = ["A", "B", "C", "D"];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: `20px ${PAD} 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
        <Back onClick={onBack} label="Session" />
        <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          Review: {ri + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {rd.length}</span>
        </span>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: ff, background: r.correct ? C.okDim : r.answered ? C.badDim : C.sf2, color: r.correct ? C.ok : r.answered ? C.bad : C.tx3 }}>
            {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
          </span>
        </div>
      </div>
      <div style={{ padding: `0 ${PAD} 16px`, display: "grid", gridTemplateColumns: `repeat(${rd.length}, 1fr)`, gap: 3, flexShrink: 0 }}>
        {rd.map((rr, i) => {
          const cur = i === ri;
          let bd = C.bdr, co = C.tx3;
          if (rr.correct) { bd = C.ok; co = C.ok; }
          else if (rr.answered) { bd = C.bad; co = C.bad; }
          if (cur) { co = C.tx; }
          return (
            <button key={i} onClick={() => onNav(i)} style={{
              height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
              border: `1.5px solid ${cur ? C.tx2 : bd}`, background: cur ? C.sf3 : "transparent", color: co,
              cursor: "pointer", fontFamily: ff,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</button>
          );
        })}
      </div>
      <div style={{ flex: 1, padding: `0 ${PAD} 28px`, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, color: C.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>{r.skill || "Skill"}</div>
        <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
          <span style={{ color: C.tx3, fontSize: 13 }}>Question text placeholder</span>
        </div>
        {r.isRW && (
          <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage</div>
            <div style={{ minHeight: 80, border: `1px dashed ${C.bdr2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: C.tx3, fontSize: 13, padding: 16 }}>Passage content</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {choices.map((letter, ci) => {
            const wasYours = r.picked === ci;
            const isCorrect = r.correctChoice === ci;
            let bdr = C.bdr, bg = "transparent", col = C.tx2, label = "";
            if (isCorrect) { bdr = C.ok; bg = C.okDim; col = C.ok; label = " ✓"; }
            if (wasYours && !isCorrect) { bdr = C.bad; bg = C.badDim; col = C.bad; label = " ✗"; }
            return (
              <div key={ci} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 8, border: `1.5px solid ${bdr}`, background: bg }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: col, border: `1px solid ${isCorrect || wasYours ? "transparent" : C.bdr2}`, background: isCorrect ? C.okDim : wasYours ? C.badDim : C.sf, flexShrink: 0 }}>{letter}</span>
                <span style={{ fontSize: 14, color: col, flex: 1 }}>Answer placeholder{label}</span>
                {wasYours && !isCorrect && <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>Your answer</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, padding: "14px 18px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}` }}>
          <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8, fontWeight: 600 }}>Explanation</div>
          <p style={{ color: C.tx2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Explanation placeholder.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <Btn small disabled={ri === 0} onClick={() => onNav(ri - 1)}>← Prev</Btn>
          {ri < rd.length - 1 ? <Btn small onClick={() => onNav(ri + 1)}>Next →</Btn> : <Btn small onClick={onBack}>Done</Btn>}
        </div>
      </div>
    </div>
  );
}

function SessionDetail({ session: s, onBack, onDelete, onReview }) {
  const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
  const hasReview = s.reviewData && s.reviewData.length > 0;
  return (
    <Shell wide>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Back onClick={onBack} label="History" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{s.type}</h1>
            <p style={{ color: C.tx3, fontSize: 13, margin: 0 }}>{s.date} · {s.attempted} attempted</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.tx }}>{pct}%</div>
            <div style={{ fontSize: 12, color: C.tx3 }}>{s.correct}/{s.attempted}</div>
          </div>
        </div>
        <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 20, marginTop: 24 }}>
          <Label>Breakdown</Label>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${getGridCols(s.total)}, 1fr)`, gap: 5 }}>
            {s.breakdown.map((correct, i) => {
              const fl = s.flagged && s.flagged[i];
              let bd = C.bdr, co = C.tx3;
              if (fl) { bd = C.warn; co = C.warn; }
              else if (correct) { bd = C.ok; co = C.ok; }
              else { bd = C.bad; co = C.bad; }
              return (
                <div key={i} style={{ padding: "7px 0", borderRadius: 5, textAlign: "center", fontSize: 10, fontWeight: 600, background: "transparent", color: co, border: `1.5px solid ${bd}` }}>{i + 1}</div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {hasReview && <Btn small onClick={onReview}>Review Questions</Btn>}
          <Btn danger small onClick={onDelete}>Delete</Btn>
        </div>
      </div>
    </Shell>
  );
}

export default function HistoryView({ history, onDelete, onBack }) {
  const [viewing, setViewing] = useState(null);
  const [review, setReview] = useState(null);

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
        onDelete={() => { onDelete(viewing.id); setViewing(null); }}
        onReview={() => setReview({ session: viewing, idx: 0 })}
      />
    );
  }

  return (
    <Shell>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <Back onClick={onBack} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>History</h1>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Past sessions and scores.</p>
        {history.length === 0 && <p style={{ color: C.tx3, fontSize: 14 }}>No sessions yet.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {history.map((h) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, overflow: "hidden" }}>
              <button onClick={() => setViewing(h)} style={{ flex: 1, display: "grid", gridTemplateColumns: "72px 1fr 64px", padding: "14px 16px", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: ff, textAlign: "left" }}>
                <span style={{ color: C.tx3, fontSize: 13 }}>{h.date}</span>
                <span style={{ color: C.tx2, fontSize: 13 }}>{h.type}</span>
                <span style={{ textAlign: "right", fontWeight: 600, fontSize: 14, color: C.tx }}>{h.correct}/{h.attempted}</span>
              </button>
              <button onClick={() => onDelete(h.id)} title="Delete" style={{ width: 44, alignSelf: "stretch", background: "transparent", border: "none", borderLeft: `1px solid ${C.bdr}`, cursor: "pointer", color: C.tx3, fontSize: 14, fontFamily: ff, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
