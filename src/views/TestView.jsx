import Shell from "../components/primitives/Shell.jsx";
import Back from "../components/primitives/Back.jsx";
import { C, ff } from "../styles/theme.js";

export default function TestView({ onBack, onStart }) {
  return (
    <Shell>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Back onClick={onBack} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Test</h1>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Simulate a full or half-length SAT.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Full Length", desc: "2 R&W modules (54) + 2 Math modules (44) — 98 questions", n: 98 },
            { label: "Half Length", desc: "1 R&W module (27) + 1 Math module (22) — 49 questions", n: 49 },
          ].map(({ label, desc, n }) => (
            <button key={n} onClick={() => onStart("test", n)} style={{
              background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 24px",
              cursor: "pointer", textAlign: "left", fontFamily: ff,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.tx, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.tx3 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
