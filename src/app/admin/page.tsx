// =============================================================================
// /admin — Portfolio Head Admin Hub (Server Component)
// =============================================================================
// PRD 5.2: "A secure module to input weekly yield/growth metrics"
// =============================================================================

import { Suspense } from "react";
import { getAdminPortfolios, type PortfolioSummary } from "@/actions/admin";
import { YieldInputForm } from "@/components/admin/yield-input-form";
import { AdminMetricCards } from "@/components/admin/admin-metric-cards";

// ---------------------------------------------------------------------------
// Data Loader
// ---------------------------------------------------------------------------

async function AdminContent(): Promise<React.JSX.Element> {
  try {
    const portfolios = await getAdminPortfolios();

    if (portfolios.length === 0) {
      return (
        <div className="glass rounded-2xl p-8">
          <p className="text-[var(--color-text-tertiary)] text-sm">
            No portfolios found. Contact a Super Admin to set up portfolio
            allocations.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        <AdminMetricCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yield Input Form */}
          <YieldInputForm portfolios={portfolios} />

          {/* Portfolio Overview Cards */}
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-6">
              Portfolio Overview
            </h2>
            <div className="space-y-4">
              {portfolios.map((portfolio: PortfolioSummary) => (
                <PortfolioOverviewCard
                  key={portfolio.portfolioId}
                  portfolio={portfolio}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="glass rounded-2xl p-8">
        <p className="text-red-400 text-sm">
          Unable to load admin data. Please ensure the database is connected and
          try again.
        </p>
      </div>
    );
  }
}

// ---------------------------------------------------------------------------
// Portfolio Overview Card
// ---------------------------------------------------------------------------

function PortfolioOverviewCard({
  portfolio,
}: {
  readonly portfolio: PortfolioSummary;
}): React.JSX.Element {
  const pnl =
    parseFloat(portfolio.currentMarketValue) -
    parseFloat(portfolio.totalAllocatedCapital);
  const pnlPositive = pnl >= 0;

  return (
    <div className="glass rounded-xl p-5 hover:border-[var(--color-border-accent)] transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold font-[family-name:var(--font-heading)]">
            {portfolio.assetClass}
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {portfolio.holdingsCount} holding
            {portfolio.holdingsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`text-xs font-bold font-[family-name:var(--font-mono)] px-2 py-1 rounded-lg ${
            pnlPositive
              ? "text-[var(--color-vcc-green)] bg-[var(--color-vcc-green-subtle)]"
              : "text-red-400 bg-red-400/10"
          }`}
        >
          {pnlPositive ? "+" : ""}R
          {Math.abs(pnl).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
            Allocated
          </p>
          <p className="font-[family-name:var(--font-mono)] font-medium">
            R{portfolio.totalAllocatedCapital}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
            Market Value
          </p>
          <p className="font-[family-name:var(--font-mono)] font-medium text-[var(--color-vcc-green)]">
            R{portfolio.currentMarketValue}
          </p>
        </div>
      </div>

      {portfolio.lastUpdated && (
        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-3">
          Updated{" "}
          {new Date(portfolio.lastUpdated).toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function AdminSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
      <div className="glass rounded-2xl p-8 h-[600px]" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((skeletonIndex) => (
          <div key={skeletonIndex} className="glass rounded-xl p-5 h-[120px]" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage(): React.JSX.Element {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          Portfolio Admin Hub
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage asset class performance and update the global token valuation
          engine.
        </p>
      </div>

      <Suspense fallback={<AdminSkeleton />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
