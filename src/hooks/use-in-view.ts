"use client";

import { useState, useEffect, useRef, type RefObject } from "react";

/**
 * Custom hook that tracks whether an element is visible in the viewport
 * using the IntersectionObserver API.
 *
 * Used to pause WebGL rendering when the 3D canvas is scrolled out of view,
 * preventing unnecessary GPU work and saving battery.
 *
 * @param threshold — The percentage of the element that must be visible
 *   to be considered "in view" (0.0 to 1.0). Default: 0.0 (any pixel visible).
 * @returns A tuple of [ref to attach, isInView boolean].
 */
export function useInView(
  threshold = 0.0
): [RefObject<HTMLDivElement | null>, boolean] {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: "100px 0px", // Start rendering slightly before visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [elementRef, isInView];
}
