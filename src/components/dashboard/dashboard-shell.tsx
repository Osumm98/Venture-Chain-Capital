"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useViewMode } from "@/components/view-mode-provider";
import { useUser, type UserProfile } from "@/components/user-provider";
import { TopNav } from "@/components/dashboard/top-nav";
import { useEffect, useRef } from "react";

export function DashboardShell({
  children,
  initialProfile,
}: {
  readonly children: React.ReactNode;
  readonly initialProfile: Partial<UserProfile>;
}): React.JSX.Element {
  const { viewMode } = useViewMode();
  const { updateProfile } = useUser();
  const isMobileView = viewMode === "mobile";
  const hasInitialised = useRef(false);

  // Sync the server-derived profile into UserProvider on mount
  useEffect(() => {
    if (!hasInitialised.current) {
      updateProfile(initialProfile);
      hasInitialised.current = true;
    }
  }, [initialProfile, updateProfile]);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-0)]">
      <DashboardSidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isMobileView
            ? "ml-0 pt-16 px-4 pb-6"
            : "ml-64 p-8"
        }`}
      >
        <TopNav />
        {children}
      </main>
    </div>
  );
}
