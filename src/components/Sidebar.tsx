import type { SessionState } from "../types";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "test", label: "Test" },
  { id: "history", label: "History" },
] as const;

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  savedSession: SessionState | null;
  onResume: () => void;
}

export default function Sidebar({ active, onNavigate, savedSession, onResume }: SidebarProps) {
  return (
    <div className="w-[252px] flex-shrink-0 border-r border-bdr flex flex-col py-9 sticky top-0 h-screen">
      <div className="px-[22px] pb-[30px]">
        <div className="text-[17px] font-bold tracking-[-.01em] text-tx">SAT Prep</div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5">
        {NAV.map(({ id, label }) => {
          const sel = id === active;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={sel ? "page" : undefined}
              className={`w-full text-left px-[14px] py-2.5 rounded-[7px] text-[15px] border transition-[background,color,border-color] duration-100 ${
                sel
                  ? "border-tx2 bg-sf2 text-tx font-semibold"
                  : "border-bdr bg-transparent text-tx2 font-normal hover:text-tx"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {savedSession && (
        <div className="mt-auto px-2.5">
          <button
            onClick={onResume}
            className="w-full text-left px-[14px] py-3 rounded-[7px] bg-sf border border-bdr text-[13px] cursor-pointer"
          >
            <div className="text-xs text-tx3 mb-1">In Progress</div>
            <div className="font-semibold text-tx2">Resume Session →</div>
          </button>
        </div>
      )}
    </div>
  );
}
