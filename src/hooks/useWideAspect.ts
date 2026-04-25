import { useEffect, useState } from "react";

const DEBOUNCE_MS = 120;

function compute(threshold: number): boolean {
  if (typeof window === "undefined") return false;
  const h = window.innerHeight || 1;
  return window.innerWidth / h >= threshold;
}

export default function useWideAspect(threshold: number = 1.8): boolean {
  const [wide, setWide] = useState<boolean>(() => compute(threshold));

  useEffect(() => {
    let handle: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (handle) clearTimeout(handle);
      handle = setTimeout(() => setWide(compute(threshold)), DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (handle) clearTimeout(handle);
      window.removeEventListener("resize", onResize);
    };
  }, [threshold]);

  return wide;
}
