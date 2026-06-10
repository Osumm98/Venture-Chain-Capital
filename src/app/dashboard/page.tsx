// =============================================================================
// /dashboard — Investor Dashboard (Server Component)
// =============================================================================
// PRD 5.1: "Investor Dashboard: A premium, personalized command center"
// - Welcome header with total account value
// - Portfolio growth spline chart (recharts)
// - 3D-styled flippable Token Cards
// - Paginated Ledger DataGrid
// =============================================================================

import { Suspense } from "react";
import {
  getDashboardSummary,
  getActiveTokens,
  getPortfolioGrowth,
} from "@/actions/dashboard";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { AllocationDonut } from "@/components/dashboard/allocation-donut";
import { LedgerGrid } from "@/components/dashboard/ledger-grid";
import { GamificationBadge } from "@/components/dashboard/gamification-badge";

// ---------------------------------------------------------------------------
// Data Loader Components (Server-side)
// ---------------------------------------------------------------------------

async function WelcomeSection(): Promise<React.JSX.Element> {
  try {
    const summary = await getDashboardSummary();
    return (
      <>
        <WelcomeHeader summary={summary} />
        <MetricCards summary={summary} />
      </>
    );
  } catch {
    return (
      <div className="glass-accent rounded-2xl p-8 mb-8">
        <p className="text-[var(--color-text-secondary)]">
          Unable to load account summary. Please try refreshing the page.
        </p>
      </div>
    );
  }
}

async function GrowthChartSection(): Promise<React.JSX.Element> {
  try {
    const growthData = await getPortfolioGrowth();
    return <PortfolioChart data={growthData} />;
  } catch {
    return (
      <div className="glass rounded-2xl p-6 h-full flex flex-col">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
          Portfolio Growth
        </h2>
        <p className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
          Chart data is temporarily unavailable.
        </p>
      </div>
    );
  }
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function WelcomeSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse mb-8">
      <div className="mb-8 mt-2">
        <div className="h-8 w-64 bg-[var(--color-surface-2)] rounded mb-2" />
        <div className="h-4 w-48 bg-[var(--color-surface-2)] rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-2xl p-6 h-32" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton(): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-6 h-full animate-pulse">
      <div className="h-5 w-36 bg-[var(--color-surface-2)] rounded mb-6" />
      <div className="h-[250px] bg-[var(--color-surface-2)] rounded-xl opacity-50" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Section: Welcome + 4 Metric Cards */}
      <Suspense fallback={<WelcomeSkeleton />}>
        <WelcomeSection />
      </Suspense>

      {/* Middle Section: Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Growth Chart takes up 2/3 */}
        <div className="lg:col-span-2 flex flex-col min-h-[350px]">
          <Suspense fallback={<ChartSkeleton />}>
            <GrowthChartSection />
          </Suspense>
        </div>

        {/* Allocation Donut takes up 1/3 */}
        <div className="flex flex-col min-h-[350px]">
          <AllocationDonut />
        </div>
      </div>

      {/* Bottom Section: Activity Table & Gamification Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Grid takes up 2/3 */}
        <div className="lg:col-span-2 flex flex-col">
          <LedgerGrid />
        </div>

        {/* Gamification Badge takes up 1/3 */}
        <div className="flex flex-col min-h-[300px]">
          <GamificationBadge />
        </div>
      </div>
    </div>
  );
}
