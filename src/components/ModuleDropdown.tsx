import { useState } from "react";
import type { Module } from "../types";

interface ModuleDropdownProps {
  modules: Module[];
  currentMod: number;
  onSelect: (mi: number) => void;
}

export default function ModuleDropdown({ modules, currentMod, onSelect }: ModuleDropdownProps) {
  const [open, setOpen] = useState(false);
  if (modules.length <= 1) return null;
  const cur = modules[currentMod];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="bg-sf2 border border-bdr rounded-md text-tx2 text-xs cursor-pointer px-3 py-[5px] flex items-center gap-1.5 transition-all duration-[120ms]"
      >
        {cur.label.replace("Reading & Writing", "R&W")}
        <span className="text-[10px] text-tx3">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 z-50 bg-sf border border-bdr rounded-lg overflow-hidden min-w-[200px] shadow-[0_8px_24px_rgba(0,0,0,.4)]"
        >
          {modules.map((m, mi) => {
            const isCur = mi === currentMod;
            const notLast = mi < modules.length - 1;
            return (
              <button
                key={mi}
                onClick={() => {
                  onSelect(mi);
                  setOpen(false);
                }}
                role="option"
                aria-selected={isCur}
                className={`block w-full px-4 py-2.5 text-left text-xs cursor-pointer transition-all duration-[120ms] border-0 ${
                  notLast ? "border-b border-bdr" : ""
                } ${isCur ? "bg-sf2 text-tx font-semibold" : "bg-transparent text-tx2 font-normal"}`}
              >
                {m.label.replace("Reading & Writing", "R&W")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
