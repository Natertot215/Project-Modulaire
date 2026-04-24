import Shell from "../../components/primitives/Shell.jsx";
import BluebookGrid from "../../components/BluebookGrid.jsx";
import { C, ff } from "../../styles/theme.js";

export default function BreakPhase({
  sessionType, modules, currentMod, qIdx, answers, flags,
  onSetQIdx, onSetPhase, onNextModule, onSubmit, onRestart,
}) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "" };
  const isLastMod = currentMod === modules.length - 1;
  const modAnswered = Array.from({ length: mod.count }, (_, i) => answers[mod.start + i] != null).filter(Boolean).length;
  const modFlagged = Array.from({ length: mod.count }, (_, i) => flags[mod.start + i]).filter(Boolean).length;
  const gridW = 9 * 52;

  return (
    <Shell wide>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{mod.label}</h2>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 28px" }}>Questions</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <BluebookGrid mod={mod} answers={answers} flags={flags} qIdx={qIdx} onClickQ={(gi) => { onSetQIdx(gi); onSetPhase("questions"); }} forceCols={9} />
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32, fontSize: 13 }}>
          <span style={{ color: C.tx2 }}>{modAnswered} answered</span>
          {mod.count - modAnswered > 0 && <span style={{ color: C.tx3 }}>{mod.count - modAnswered} unanswered</span>}
          {modFlagged > 0 && <span style={{ color: C.tx3 }}>{modFlagged} flagged</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: gridW, margin: "0 auto" }}>
          <button onClick={() => onSetPhase("questions")} style={{
            padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
            border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer", transition: "all .12s",
          }}>Back to Questions</button>
          {isLastMod || sessionType === "practice" ? (
            <button onClick={onSubmit} style={{
              padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
              border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer", transition: "all .12s",
            }}>{sessionType === "practice" ? "Submit Practice" : "Submit Test"}</button>
          ) : (
            <button onClick={onNextModule} style={{
              padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
              border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer", transition: "all .12s",
            }}>Proceed to Next Module</button>
          )}
        </div>
        <button onClick={onRestart} style={{
          background: "none", border: "none", color: C.tx3, fontFamily: ff,
          fontSize: 13, cursor: "pointer", padding: 0, marginTop: 20, transition: "color .12s",
        }}>Restart Module</button>
      </div>
    </Shell>
  );
}
