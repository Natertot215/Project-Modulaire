import { useEffect, useState } from "react";

const DEBOUNCE_MS = 120;

export default function useBreakpoint(px: number = 1000): boolean {
  const [wide, setWide] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= px : true,
  );

  useEffect(() => {
    let handle: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (handle) clearTimeout(handle);
      handle = setTimeout(() => setWide(window.innerWidth >= px), DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (handle) clearTimeout(handle);
      window.removeEventListener("resize", onResize);
    };
  }, [px]);

  return wide;
}
