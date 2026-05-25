import { useState, useEffect } from "react";

/**
 * Hook untuk deteksi ukuran layar secara real-time.
 * Pakai untuk render conditional di JSX
 * (mis. Navbar desktop vs hamburger menu di mobile).
 *
 * Contoh:
 *   const isMobile = useIsMobile();
 *   const { isMobile, isTablet } = useBreakpoint();
 */

export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export function useBreakpoint() {
  const getBp = () => {
    if (typeof window === "undefined") return { isMobile: false, isTablet: false, isDesktop: true };
    const w = window.innerWidth;
    return {
      isMobile:  w < 640,
      isTablet:  w >= 640 && w < 1024,
      isDesktop: w >= 1024,
      width: w,
    };
  };

  const [bp, setBp] = useState(getBp());

  useEffect(() => {
    const onResize = () => setBp(getBp());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}