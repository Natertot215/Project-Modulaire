import type { ReactNode } from "react";

export default function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-tx3 uppercase tracking-[.08em] mb-2">
      {children}
    </div>
  );
}
