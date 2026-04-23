import { useEffect, useState } from "react";

export default function useBreakpoint(px = 1000) {
  const [wide, setWide] = useState(typeof window !== "undefined" ? window.innerWidth >= px : true);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= px);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [px]);
  return wide;
}
