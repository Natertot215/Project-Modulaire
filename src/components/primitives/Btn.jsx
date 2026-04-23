import { C, ff } from "../../styles/theme.js";

export default function Btn({ children, onClick, disabled, small, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "8px 20px" : "11px 28px", borderRadius: 8,
      fontSize: small ? 13 : 14, fontFamily: ff, fontWeight: 600, letterSpacing: ".01em",
      border: danger ? "none" : `1px solid ${C.bdr}`,
      cursor: disabled ? "default" : "pointer",
      background: danger ? C.badDim : "transparent",
      color: danger ? C.bad : C.tx2,
      opacity: disabled ? 0.4 : 1, transition: "all .12s",
    }}>{children}</button>
  );
}
