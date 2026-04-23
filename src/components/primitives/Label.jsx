import { C } from "../../styles/theme.js";

export default function Label({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: C.tx3, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
      {children}
    </div>
  );
}
