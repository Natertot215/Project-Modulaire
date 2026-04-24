import { C, ff } from "../../styles/theme.js";

export default function Back({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: C.tx3, fontFamily: ff, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20, transition: "color .12s" }}>
      ← {label || "Back"}
    </button>
  );
}
