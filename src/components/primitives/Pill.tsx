import type { ReactNode } from "react";

interface PillProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  large?: boolean;
}

export default function Pill({ active, children, onClick, fullWidth, large }: PillProps) {
  const layout = fullWidth ? "w-full text-center whitespace-nowrap" : "text-left";
  const size = large
    ? "px-5 py-2 text-[13px] rounded-lg"
    : "px-3 py-[5px] text-xs rounded-md";
  return (
    <button
      onClick={onClick}
      className={`${size} leading-[1.4] ${layout} transition-all duration-[120ms] border ${
        active
          ? "font-semibold border-tx2 bg-sel-dim text-sel"
          : "font-normal border-bdr bg-transparent text-tx2"
      }`}
    >
      {children}
    </button>
  );
}
