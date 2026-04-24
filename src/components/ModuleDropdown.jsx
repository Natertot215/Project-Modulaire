import { useState } from "react";
import { C, ff } from "../styles/theme.js";

export default function ModuleDropdown({ modules, currentMod, onSelect }) {
  const [open, setOpen] = useState(false);
  if (modules.length <= 1) return null;
  const cur = modules[currentMod];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6,
        color: C.tx2, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 12px",
        display: "flex", alignItems: "center", gap: 6,
        transition: "all .12s",
      }}>
        {cur.label.replace("Reading & Writing", "R&W")}
        <span style={{ fontSize: 10, color: C.tx3 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50,
          background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8,
          overflow: "hidden", minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,.4)",
        }}>
          {modules.map((m, mi) => (
            <button key={mi} onClick={() => { onSelect(mi); setOpen(false); }} style={{
              display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
              background: mi === currentMod ? C.sf2 : "transparent",
              border: "none", borderBottom: mi < modules.length - 1 ? `1px solid ${C.bdr}` : "none",
              color: mi === currentMod ? C.tx : C.tx2,
              fontFamily: ff, fontSize: 12, fontWeight: mi === currentMod ? 600 : 400,
              cursor: "pointer", transition: "all .12s",
            }}>{m.label.replace("Reading & Writing", "R&W")}</button>
          ))}
        </div>
      )}
    </div>
  );
}
