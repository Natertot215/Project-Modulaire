import Btn from "../../components/primitives/Btn.jsx";
import ModuleDropdown from "../../components/ModuleDropdown.jsx";
import { C, ff, PAD } from "../../styles/theme.js";
import { isRWSkill } from "../../data/taxonomy.js";

export default function QuestionsPhase({
  sessionType, modules, currentMod, qIdx, questionSkills,
  answers, flags, crossouts, highlighting, confirmHome, answeredCount, wide,
  onConfirmHome, onCancelHome, onSaveAndExit, onDiscardHome,
  onSetQIdx, onSetCurrentMod, onToggleHighlight, onToggleFlag,
  onSetAnswer, onToggleCrossout, onGoBreak,
}) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "" };
  const modLocalIdx = qIdx - mod.start;
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");
  const choices = ["A", "B", "C", "D"];
  const showSkill = sessionType === "practice";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
      {confirmHome && (
        <div style={{ position: "fixed", inset: 0, background: "var(--sat-overlay)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: 28, maxWidth: 400, width: "90%", textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>Leave session?</p>
            <p style={{ fontSize: 13, color: C.tx3, margin: "0 0 24px" }}>{answeredCount} question{answeredCount !== 1 ? "s" : ""} attempted.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn small onClick={onCancelHome}>Cancel</Btn>
              <Btn small onClick={onSaveAndExit}>Save & Exit</Btn>
              <Btn small danger onClick={onDiscardHome}>Discard</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: `20px ${PAD} 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onConfirmHome} title="Home" style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx3, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 10px", width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>⌂</button>
          {showSkill && <span style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, padding: "5px 12px", fontFamily: ff, fontSize: 12, color: C.tx2, cursor: "default" }}>{qSkill || "Skill"}</span>}
          <button onClick={onGoBreak} style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx2, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 12px" }}>Summary</button>
          <ModuleDropdown modules={modules} currentMod={currentMod} onSelect={(mi) => { onSetCurrentMod(mi); onSetQIdx(modules[mi].start); }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          {modLocalIdx + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {mod.count}</span>
        </span>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onToggleHighlight} style={{
            background: highlighting ? C.selDim : C.sf2, border: `1px solid ${highlighting ? C.tx2 : C.bdr}`,
            borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: ff,
            fontSize: 12, color: highlighting ? C.sel : C.tx3, minWidth: 36, textAlign: "center",
          }} title="Highlight">✎</button>
          <button onClick={onToggleFlag} style={{
            background: flags[qIdx] ? C.warnDim : C.sf2, border: `1px solid ${flags[qIdx] ? C.warn : C.bdr}`,
            borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: ff,
            fontSize: 12, color: flags[qIdx] ? C.warn : C.tx3, minWidth: 80, textAlign: "center",
          }}>{flags[qIdx] ? "⚑ Flagged" : "⚐ Flag"}</button>
        </div>
      </div>

      <div style={{ padding: `0 ${PAD} 16px`, display: "grid", gridTemplateColumns: `repeat(${mod.count}, 1fr)`, gap: 3, flexShrink: 0 }}>
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx, ans = answers[gi] != null, fl = flags[gi];
          let bg = "transparent", bd = C.bdr, co = C.tx3;
          if (cur) { bg = C.sf3; bd = C.tx2; co = C.tx; }
          else if (fl) { bg = C.warnDim; bd = C.warn; co = C.warn; }
          else if (ans) { bg = C.sf2; co = C.tx2; }
          return (
            <button key={i} onClick={() => onSetQIdx(gi)} style={{
              height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
              border: `1px solid ${bd}`, background: bg, color: co,
              cursor: "pointer", fontFamily: ff,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: `0 ${PAD} 28px`, width: "100%", boxSizing: "border-box" }}>
        <style>{`.hl-passage ::selection { background: var(--sat-warn-sel); } .hl-passage mark { background: var(--sat-warn-mark); color: var(--sat-tx); border-radius: 2px; }`}</style>
        <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 380px" : undefined, gap: wide ? 24 : undefined }}>
          <div>
            <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
              <span style={{ color: C.tx3, fontSize: 13 }}>Question text will appear here</span>
            </div>
            {isRW && (
              <div className={highlighting ? "hl-passage" : ""} style={{ background: C.sf, border: `1px solid ${highlighting ? C.warn : C.bdr}`, borderRadius: 8, padding: 24, marginBottom: wide ? 0 : 16, transition: "border-color .15s", cursor: highlighting ? "text" : "default" }}
                onMouseUp={() => {
                  if (!highlighting) return;
                  const sel = window.getSelection();
                  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
                  const range = sel.getRangeAt(0);
                  const mark = document.createElement("mark");
                  try { range.surroundContents(mark); } catch (e) {}
                  sel.removeAllRanges();
                }}>
                <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage {highlighting && <span style={{ color: C.warn, fontWeight: 400 }}>— highlighting on</span>}</div>
                <div style={{ minHeight: 100, color: C.tx2, fontSize: 14, lineHeight: 1.7, padding: 4, userSelect: highlighting ? "text" : "auto" }}>Generated passage content. Select text while the highlight tool is active to mark important sections for reference.</div>
              </div>
            )}
          </div>
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {choices.map((letter, ci) => {
                const sel = answers[qIdx] === ci;
                const crossed = crossouts[`${qIdx}-${ci}`];
                return (
                  <button key={ci} onClick={() => { if (!crossed) onSetAnswer(ci); }} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: 8, border: `1px solid ${sel ? C.tx2 : C.bdr}`,
                    background: sel ? C.selDim : "transparent",
                    cursor: crossed ? "default" : "pointer", fontFamily: ff, textAlign: "left",
                    textDecoration: crossed ? "line-through" : "none",
                    opacity: crossed && !sel ? 0.35 : 1, transition: "all .1s",
                  }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: sel ? C.sel : C.tx3, border: `1px solid ${sel ? "transparent" : C.bdr2}`, background: sel ? C.selDim : C.sf, flexShrink: 0 }}>{letter}</span>
                    <span style={{ fontSize: 14, color: sel ? C.sel : C.tx2, flex: 1 }}>Answer placeholder</span>
                    <span onClick={(e) => { e.stopPropagation(); onToggleCrossout(ci); }} title="Cross out" style={{
                      width: 24, height: 24, borderRadius: 4, fontSize: 11, fontWeight: 700,
                      border: `1px solid ${crossed ? C.tx3 : C.bdr2}`, background: crossed ? C.sf2 : "transparent",
                      color: crossed ? C.tx2 : C.tx3, cursor: "pointer", fontFamily: ff,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>✕</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>← Prev</Btn>
              {modLocalIdx < mod.count - 1
                ? <Btn small onClick={() => onSetQIdx(qIdx + 1)}>Next →</Btn>
                : <Btn small onClick={onGoBreak}>Module Summary</Btn>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
