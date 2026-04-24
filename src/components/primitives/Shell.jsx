import { C, ff, PAD } from "../../styles/theme.js";

export default function Shell({ children, wide }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, padding: wide ? `44px ${PAD}` : "44px 20px" }}>
      {children}
    </div>
  );
}
