"use client";

import type { DashboardSummary } from "@/actions/dashboard";
import { useUser } from "@/components/user-provider";

export function WelcomeHeader({
  summary,
}: {
  readonly summary: DashboardSummary;
}): React.JSX.Element {
  const { profile } = useUser();
  // Temporary mock data for trend
  const trendPercent = "+12.4%";

  return (
    <div className="mb-8 mt-2">
      <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-2 flex items-center gap-3">
        Welcome back, <span className="text-[var(--color-vcc-green)]">{profile?.firstName}</span>
      </h1>
      <p className="text-sm md:text-base text-[var(--color-text-secondary)]">
        Your portfolio is up <span className="text-green-500 font-semibold">{trendPercent}</span> this week. Keep it up!
      </p>
    </div>
  );
}
