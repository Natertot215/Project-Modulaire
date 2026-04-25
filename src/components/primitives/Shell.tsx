import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  wide?: boolean;
}

export default function Shell({ children, wide }: ShellProps) {
  return (
    <div className={`min-h-screen bg-bg text-tx py-11 ${wide ? "px-pad" : "px-5"}`}>
      {children}
    </div>
  );
}
