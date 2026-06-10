"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type ViewMode = "desktop" | "mobile";

interface ViewModeContextValue {
  /** The currently active view mode */
  readonly viewMode: ViewMode;
  /** Whether the device is natively mobile (touch, narrow screen) */
  readonly isNativeMobile: boolean;
  /** Toggle between desktop and mobile view */
  readonly toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(
  undefined
);

function detectNativeMobile(): boolean {
  if (typeof window === "undefined") return false;

  const hasTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth < 768;
  const hasMobileUA =
    /Android|iPhone|iPod|iPad|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );

  return (hasTouch && isNarrow) || hasMobileUA;
}

export function ViewModeProvider({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isNativeMobile, setIsNativeMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nativeMobile = detectNativeMobile();
    setIsNativeMobile(nativeMobile);
    setViewMode(nativeMobile ? "mobile" : "desktop");
    setMounted(true);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "desktop" ? "mobile" : "desktop"));
  }, []);

  // Apply a class to <html> so CSS can respond to forced mobile view
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    if (viewMode === "mobile") {
      root.classList.add("force-mobile");
    } else {
      root.classList.remove("force-mobile");
    }
  }, [viewMode, mounted]);

  return (
    <ViewModeContext.Provider
      value={{ viewMode, isNativeMobile, toggleViewMode }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
