import { C, ff } from "../styles/theme.js";
import { getGridCols } from "../lib/grid.js";

export default function BluebookGrid({ mod, answers, flags, qIdx, onClickQ, forceCols }) {
  const cols = forceCols || getGridCols(mod.count);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 44px)`, gap: 8, justifyContent: "center" }}>
      {Array.from({ length: mod.count }, (_, i) => {
        const gi = mod.start + i;
        const ans = answers[gi] != null;
        const fl = flags[gi];
        const cur = gi === qIdx;
        let bg = C.sf2, co = C.tx2, bd = C.bdr;
        if (!ans) { bg = "transparent"; co = C.tx3; }
        if (fl) { bg = C.warnDim; co = C.warn; bd = C.warn; }
        if (cur) { bg = C.sf3; co = C.tx; bd = C.tx2; }
        return (
          <button key={i} onClick={() => onClickQ(gi)} style={{
            width: 44, height: 44, borderRadius: 6, fontSize: 14, fontWeight: 600,
            border: !ans && !fl && !cur ? `2px dashed ${C.bdr2}` : `2px solid ${bd}`,
            background: bg, color: co, cursor: "pointer", fontFamily: ff,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
