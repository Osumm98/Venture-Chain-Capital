"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Global smooth scrolling wrapper using Lenis.
 * Provides buttery-smooth kinetic scrolling across the entire page.
 *
 * Respects `prefers-reduced-motion` — disables smooth scrolling
 * when the user has requested reduced motion.
 */
export function SmoothScrollProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    function raf(time: number): void {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
