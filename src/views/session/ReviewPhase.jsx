import Btn from "../../components/primitives/Btn.jsx";
import ModuleDropdown from "../../components/ModuleDropdown.jsx";
import { C, ff, PAD } from "../../styles/theme.js";
import { isRWSkill } from "../../data/taxonomy.js";

export default function ReviewPhase({
  sessionType, modules, currentMod, qIdx, questionSkills, results, flags, crossouts, wide,
  onHome, onSetQIdx, onSetCurrentMod,
}) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "" };
  const modLocalIdx = qIdx - mod.start;
  const isLastMod = currentMod === modules.length - 1;
  const r = results[qIdx] || {};
  const choices = ["A", "B", "C", "D"];
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: `20px ${PAD}px 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onHome} style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx3, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 10px", width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>⌂</button>
          <ModuleDropdown modules={modules} currentMod={currentMod} onSelect={(mi) => { onSetCurrentMod(mi); onSetQIdx(modules[mi].start); }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          Review: {modLocalIdx + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {mod.count}</span>
        </span>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: ff, background: r.correct ? C.okDim : r.answered ? C.badDim : C.sf2, color: r.correct ? C.ok : r.answered ? C.bad : C.tx3 }}>
            {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
          </span>
        </div>
      </div>

      <div style={{ padding: `0 ${PAD}px 16px`, display: "grid", gridTemplateColumns: `repeat(${mod.count}, 1fr)`, gap: 3, flexShrink: 0 }}>
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const rr = results[gi] || {};
          const fl = flags[gi];
          let bd = C.bdr, co = C.tx3;
          if (fl) { bd = C.warn; co = C.warn; }
          else if (rr.correct) { bd = C.ok; co = C.ok; }
          else if (rr.answered) { bd = C.bad; co = C.bad; }
          if (cur) { co = C.tx; }
          return (
            <button key={i} onClick={() => onSetQIdx(gi)} style={{
              height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
              border: `1.5px solid ${cur ? C.tx2 : bd}`, background: cur ? C.sf3 : "transparent", color: co,
              cursor: "pointer", fontFamily: ff,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: `0 ${PAD}px 28px`, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, color: C.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>{qSkill || "Skill"}</div>
        <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 380px" : undefined, gap: wide ? 24 : undefined }}>
          <div>
            <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
              <span style={{ color: C.tx3, fontSize: 13 }}>Question text placeholder</span>
            </div>
            {isRW && (
              <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, padding: 24, marginBottom: wide ? 0 : 16 }}>
                <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage</div>
                <div style={{ minHeight: 80, border: `1px dashed ${C.bdr2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: C.tx3, fontSize: 13, padding: 16 }}>Passage content</div>
              </div>
            )}
          </div>
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {choices.map((letter, ci) => {
                const wasYours = r.picked === ci;
                const isCorrect = r.correctChoice === ci;
                const wasCrossed = crossouts[`${qIdx}-${ci}`];
                let bdr = C.bdr, bg = "transparent", col = C.tx2, label = "";
                if (isCorrect) { bdr = C.ok; bg = C.okDim; col = C.ok; label = " ✓"; }
                if (wasYours && !isCorrect) { bdr = C.bad; bg = C.badDim; col = C.bad; label = " ✗"; }
                return (
                  <div key={ci} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: 8, border: `1.5px solid ${bdr}`, background: bg,
                    textDecoration: wasCrossed && !isCorrect && !wasYours ? "line-through" : "none",
                    opacity: wasCrossed && !isCorrect && !wasYours ? 0.4 : 1,
                  }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: col, border: `1px solid ${isCorrect || wasYours ? "transparent" : C.bdr2}`, background: isCorrect ? C.okDim : wasYours ? C.badDim : C.sf, flexShrink: 0 }}>{letter}</span>
                    <span style={{ fontSize: 14, color: col, flex: 1 }}>Answer placeholder{label}</span>
                    {wasYours && !isCorrect && <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>Your answer</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8, fontWeight: 600 }}>Explanation</div>
              <p style={{ color: C.tx2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Explanation placeholder — AI-generated reasoning will appear here.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>← Prev</Btn>
              {modLocalIdx < mod.count - 1 ? (
                <Btn small onClick={() => onSetQIdx(qIdx + 1)}>Next →</Btn>
              ) : isLastMod ? (
                <Btn small onClick={onHome}>Done</Btn>
              ) : (
                <Btn small onClick={() => onSetCurrentMod(currentMod + 1)}>Next Module →</Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
