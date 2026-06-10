"use client";

import { TrendingUp, Users, Wallet, BarChart4 } from "lucide-react";

export function AdminMetricCards(): React.JSX.Element {
  // Mock data for admin global metrics
  const globalAUM = "14,550,000.00";
  const activeInvestors = "1,245";
  const mrr = "125,400.00";
  const activeTokens = "8,450";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Global AUM */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vcc-green-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-vcc-green)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full text-green-500 bg-green-500/10">
              +5.2% M/M
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Total Assets Under Management
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            R{globalAUM}
          </p>
        </div>
      </div>

      {/* Active Investors */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-border-accent)] to-transparent opacity-0 group-hover:opacity-10 opacity-5 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[#60A5FA]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Active Investors
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            {activeInvestors}
          </p>
        </div>
      </div>

      {/* Platform MRR / Fees */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A85320] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[#D4A853]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Est. Monthly Revenue (MRR)
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            R{mrr}
          </p>
        </div>
      </div>

      {/* Total Active Tokens */}
      <div className="glass-accent rounded-2xl p-6 relative overflow-hidden group" style={{ borderColor: "var(--color-vcc-green-subtle)" }}>
        <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-15 transition-opacity duration-500 from-[var(--color-vcc-green)] to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-vcc-green)]">
              <BarChart4 className="w-5 h-5" />
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full text-[var(--color-vcc-green)] border border-[var(--color-vcc-green-subtle)] bg-[var(--color-vcc-green-subtle)]/10">
              Platform
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">
            Total Active Tokens
          </p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            {activeTokens} <span className="text-sm font-normal text-[var(--color-text-tertiary)]">VCC</span>
          </p>
        </div>
      </div>
    </div>
  );
}
