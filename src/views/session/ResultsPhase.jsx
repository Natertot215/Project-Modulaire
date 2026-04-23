import Shell from "../../components/primitives/Shell.jsx";
import Btn from "../../components/primitives/Btn.jsx";
import Label from "../../components/primitives/Label.jsx";
import { C } from "../../styles/theme.js";
import { getGridCols } from "../../lib/grid.js";

export default function ResultsPhase({ sessionType, results, flags, total, onHome, onReview }) {
  const correct = results.filter(r => r.correct).length;
  const attempted = results.filter(r => r.answered).length;
  const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  return (
    <Shell wide>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          width: 110, height: 110, borderRadius: "50%", margin: "0 auto 20px",
          border: `3px solid ${C.tx2}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: C.sf,
        }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: C.tx }}>{pct}%</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{sessionType === "test" ? "Test" : "Practice"} Complete</h1>
        <p style={{ color: C.tx2, fontSize: 14, margin: "0 0 8px" }}>{correct} correct out of {attempted} attempted ({total} total)</p>
        <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 20, textAlign: "left", margin: "28px 0" }}>
          <Label>Breakdown</Label>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${getGridCols(total)}, 1fr)`, gap: 5 }}>
            {results.map((r, i) => {
              const fl = flags[i];
              let bd = C.bdr, co = C.tx3;
              if (fl) { bd = C.warn; co = C.warn; }
              else if (r.correct) { bd = C.ok; co = C.ok; }
              else if (r.answered) { bd = C.bad; co = C.bad; }
              return (
                <div key={i} style={{
                  padding: "7px 0", borderRadius: 5, textAlign: "center", fontSize: 10, fontWeight: 600,
                  background: "transparent", color: co, border: `1.5px solid ${bd}`,
                }}>{i + 1}</div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn onClick={onHome}>Home</Btn>
          <Btn onClick={onReview}>Review Questions</Btn>
        </div>
      </div>
    </Shell>
  );
}
