import Shell from "../components/primitives/Shell.jsx";
import { C, ff } from "../styles/theme.js";

export default function HomeView({ savedSession, onResume, onNavigate }) {
  return (
    <Shell>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-.02em" }}>SAT Prep</h1>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Practice, test, and track your progress.</p>
        {savedSession && (
          <button onClick={onResume} style={{
            width: "100%", background: C.sf, border: `1px solid ${C.tx2}`, borderRadius: 10,
            padding: "18px 24px", cursor: "pointer", textAlign: "left", fontFamily: ff, marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 4 }}>Resume Session</div>
              <div style={{ fontSize: 12, color: C.tx3 }}>
                {savedSession.sessionType === "test" ? "Test" : "Practice"} — {Object.values(savedSession.answers).filter(v => v != null).length}/{savedSession.questions.length} answered
              </div>
            </div>
            <span style={{ color: C.tx2, fontSize: 18 }}>→</span>
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Practice", desc: "Select topics and skills, choose question count", v: "practice" },
            { label: "Test", desc: "Full-length or half-length modules", v: "test" },
            { label: "History", desc: "Past sessions and scores", v: "history" },
          ].map(({ label, desc, v }) => (
            <button key={v} onClick={() => onNavigate(v)} style={{
              background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 24px",
              cursor: "pointer", textAlign: "left", fontFamily: ff,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: C.tx3 }}>{desc}</div>
              </div>
              <span style={{ color: C.tx3, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
