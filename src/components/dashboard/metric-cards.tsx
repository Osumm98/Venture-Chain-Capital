"use client";

import type { DashboardSummary } from "@/actions/dashboard";
import { TrendingUp, Package, CreditCard, Award } from "lucide-react";

export function MetricCards({
  summary,
}: {
  readonly summary: DashboardSummary;
}): React.JSX.Element {
  const trendPercent = summary.portfolioGrowthPercent;
  const isPositive = trendPercent.startsWith("+");

  // Determine top tier badge style based on active packages
  // Mock logic assuming they have Gold/Platinum based on count
  const tierName = summary.activeTiers.length >= 3 ? "Platinum" : summary.activeTiers.length >= 1 ? "Gold" : "Entry";
  const tierColor = tierName === "Platinum" ? "var(--color-vcc-green)" : tierName === "Gold" ? "#D4A853" : "var(--color-border-accent)";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Portfolio Value */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vcc-green-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-vcc-green)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}>
              {trendPercent}
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Portfolio Value
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            R{formatZar(summary.totalAccountValue)}
          </p>
        </div>
      </div>

      {/* Total Tokens Owned */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-border-accent)] to-transparent opacity-0 group-hover:opacity-10 opacity-5 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Total Tokens Owned
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            {summary.totalTokens} <span className="text-sm font-normal text-[var(--color-text-tertiary)]">VCC</span>
          </p>
        </div>
      </div>

      {/* Credit Balance */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A85320] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[#D4A853]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Credit Balance
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            R{formatZar(summary.creditBalance)}
          </p>
        </div>
      </div>

      {/* Active Packages / Gamification */}
      <div className="glass-accent rounded-2xl p-6 relative overflow-hidden group" style={{ borderColor: `${tierColor}40` }}>
        <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-15 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${tierColor}, transparent)` }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center" style={{ color: tierColor }}>
              <Award className="w-5 h-5" />
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border" style={{ color: tierColor, borderColor: `${tierColor}40`, backgroundColor: `${tierColor}10` }}>
              Tier Level
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Active Packages
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            {summary.activeTiers.length} <span className="text-sm font-normal text-[var(--color-text-tertiary)]">{tierName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatZar(value: string): string {
  const parts = value.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}
