"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  submitWeeklyYield,
  type PortfolioSummary,
  type YieldSubmitResult,
} from "@/actions/admin";

interface YieldInputFormProps {
  readonly portfolios: ReadonlyArray<PortfolioSummary>;
}

export function YieldInputForm({
  portfolios,
}: YieldInputFormProps): React.JSX.Element {
  const [selectedPortfolio, setSelectedPortfolio] = useState(
    portfolios[0]?.portfolioId ?? ""
  );
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [yieldPct, setYieldPct] = useState("");
  const [absoluteReturn, setAbsoluteReturn] = useState("");
  const [notes, setNotes] = useState("");

  const [submitResult, setSubmitResult] = useState<YieldSubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitResult(null);

    startTransition(async () => {
      try {
        const result = await submitWeeklyYield({
          portfolioId: selectedPortfolio,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          yieldPercentage: yieldPct,
          absoluteReturn,
          notes: notes || undefined,
        });
        setSubmitResult(result);

        if (result.success) {
          // Reset form
          setWeekStart("");
          setWeekEnd("");
          setYieldPct("");
          setAbsoluteReturn("");
          setNotes("");
        }
      } catch (submitErr: unknown) {
        const message =
          submitErr instanceof Error ? submitErr.message : "Submission failed.";
        setSubmitResult({ success: false, message });
      }
    });
  }

  const selectedDetails = portfolios.find(
    (p) => p.portfolioId === selectedPortfolio
  );

  return (
    <div className="glass-accent glow-green rounded-2xl p-8">
      <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
        Submit Weekly Yield
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        Record the weekly performance metrics for your managed portfolio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Portfolio Selector */}
        <div>
          <label
            htmlFor="admin-portfolio-select"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
          >
            Portfolio
          </label>
          <select
            id="admin-portfolio-select"
            value={selectedPortfolio}
            onChange={(event) => setSelectedPortfolio(event.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200 cursor-pointer"
          >
            {portfolios.map((portfolio) => (
              <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                {portfolio.assetClass}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Portfolio Details */}
        {selectedDetails && (
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-dim)]">
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
                Allocated Capital
              </p>
              <p className="text-sm font-bold font-[family-name:var(--font-mono)]">
                R{selectedDetails.totalAllocatedCapital}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
                Market Value
              </p>
              <p className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-vcc-green)]">
                R{selectedDetails.currentMarketValue}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
                Holdings
              </p>
              <p className="text-sm font-bold font-[family-name:var(--font-mono)]">
                {selectedDetails.holdingsCount}
              </p>
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="admin-week-start"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Week Start
            </label>
            <input
              id="admin-week-start"
              type="date"
              value={weekStart}
              onChange={(event) => setWeekStart(event.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="admin-week-end"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Week End
            </label>
            <input
              id="admin-week-end"
              type="date"
              value={weekEnd}
              onChange={(event) => setWeekEnd(event.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200"
            />
          </div>
        </div>

        {/* Yield Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="admin-yield-pct"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Yield Percentage (%)
            </label>
            <input
              id="admin-yield-pct"
              type="number"
              step="0.00001"
              value={yieldPct}
              onChange={(event) => setYieldPct(event.target.value)}
              placeholder="2.34500"
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200 placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>
          <div>
            <label
              htmlFor="admin-abs-return"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Absolute Return (R)
            </label>
            <input
              id="admin-abs-return"
              type="number"
              step="0.01"
              value={absoluteReturn}
              onChange={(event) => setAbsoluteReturn(event.target.value)}
              placeholder="15,420.00"
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200 placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="admin-notes"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
          >
            Notes (Optional)
          </label>
          <textarea
            id="admin-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Market observations, strategy adjustments, etc."
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] transition-colors duration-200 placeholder:text-[var(--color-text-tertiary)] resize-none"
          />
        </div>

        {/* Result Alert */}
        {submitResult && (
          <div
            className={`px-4 py-3 rounded-xl text-sm border ${
              submitResult.success
                ? "bg-[var(--color-vcc-green-subtle)] border-[var(--color-border-accent)] text-[var(--color-vcc-green)]"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {submitResult.message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[var(--color-vcc-green)] text-[var(--color-surface-0)] hover:shadow-[0_0_30px_rgba(0,255,136,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Weekly Report"}
        </button>
      </form>
    </div>
  );
}
