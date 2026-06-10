"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useViewMode } from "@/components/view-mode-provider";

import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { viewMode } = useViewMode();
  const isMobileView = viewMode === "mobile";

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
