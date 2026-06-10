"use client";

import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Smartphone } from "lucide-react";
import { useViewMode } from "@/components/view-mode-provider";

export function ThemeToggle(): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { viewMode, isNativeMobile, toggleViewMode } = useViewMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl border border-transparent" />;
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-dim)] backdrop-blur-xl">
      {/* Light mode */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
          theme === "light"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] shadow-sm"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* View mode toggle — only show on desktop devices (native mobile users don't need it) */}
      {!isNativeMobile && (
        <button
          type="button"
          onClick={toggleViewMode}
          aria-label={viewMode === "desktop" ? "Switch to mobile view" : "Switch to desktop view"}
          title={viewMode === "desktop" ? "Switch to mobile view" : "Switch to desktop view"}
          className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
            viewMode === "mobile"
              ? "bg-[var(--color-vcc-green-subtle)] text-[var(--color-vcc-green)] shadow-sm"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
          }`}
        >
          {/* When in desktop view → show phone icon (click to go mobile) */}
          {/* When in mobile view → show monitor icon (click to go back to desktop) */}
          {viewMode === "desktop" ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Dark mode */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
          theme === "dark"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] shadow-sm"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
