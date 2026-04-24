import { C, ff } from "../styles/theme.js";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "test",     label: "Test"     },
  { id: "history",  label: "History"  },
];

export default function Sidebar({ active, onNavigate, savedSession, onResume }) {
  return (
    <div style={{
      width: 252, flexShrink: 0,
      borderRight: `1px solid ${C.bdr}`,
      display: "flex", flexDirection: "column",
      padding: "36px 0",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div style={{ padding: "0 22px 30px" }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em", color: C.tx }}>SAT Prep</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {NAV.map(({ id, label }) => {
          const sel = id === active;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{
              width: "100%", textAlign: "left",
              padding: "10px 14px", borderRadius: 7,
              border: `1px solid ${sel ? C.tx2 : C.bdr}`,
              background: sel ? C.sf2 : "transparent",
              color: sel ? C.tx : C.tx2,
              fontFamily: ff, fontSize: 15, fontWeight: sel ? 600 : 400,
              cursor: "pointer", transition: "background .1s, color .1s, border-color .1s",
            }}>
              {label}
            </button>
          );
        })}
      </nav>

      {savedSession && (
        <div style={{ marginTop: "auto", padding: "0 10px" }}>
          <button onClick={onResume} style={{
            width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 7,
            background: C.sf, border: `1px solid ${C.bdr}`,
            fontFamily: ff, fontSize: 13, cursor: "pointer",
          }}>
            <div style={{ fontSize: 12, color: C.tx3, marginBottom: 4 }}>In Progress</div>
            <div style={{ fontWeight: 600, color: C.tx2 }}>Resume Session →</div>
          </button>
        </div>
      )}
    </div>
  );
}
