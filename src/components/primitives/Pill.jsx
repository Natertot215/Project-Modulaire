import { C, ff } from "../../styles/theme.js";

export default function Pill({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 6, fontSize: 12, fontFamily: ff, fontWeight: active ? 600 : 400,
      border: `1px solid ${active ? C.tx2 : C.bdr}`, cursor: "pointer",
      background: active ? C.selDim : "transparent", color: active ? C.sel : C.tx2,
      transition: "all .12s", lineHeight: 1.4, textAlign: "left",
    }}>{children}</button>
  );
}
