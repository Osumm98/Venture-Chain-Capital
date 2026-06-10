"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getLedgerPage, type LedgerPage, type LedgerRow } from "@/actions/dashboard";

// ---------------------------------------------------------------------------
// Transaction type display config
// ---------------------------------------------------------------------------

const TX_TYPE_CONFIG: Record<
  string,
  { readonly label: string; readonly color: string; readonly sign: string }
> = {
  PAYMENT:        { label: "Payment",         color: "#00FF88", sign: "+" },
  PENALTY:        { label: "Penalty",         color: "#F87171", sign: "−" },
  CREDIT_APPLIED: { label: "Credit Applied",  color: "#60A5FA", sign: "+" },
  ANNUAL_FEE:     { label: "Annual Fee",      color: "#FBBF24", sign: "−" },
  ADMIN_FEE:      { label: "Admin Fee",       color: "#A78BFA", sign: "−" },
  PROFIT_FEE:     { label: "Profit Fee",      color: "#FB923C", sign: "−" },
};

function getTxConfig(
  type: string
): { readonly label: string; readonly color: string; readonly sign: string } {
  return TX_TYPE_CONFIG[type] ?? { label: type, color: "#8A94A0", sign: "" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LedgerGrid(): React.JSX.Element {
  const [ledger, setLedger] = useState<LedgerPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchPage = useCallback((page: number) => {
    startTransition(async () => {
      try {
        setLoadError(null);
        const pageData = await getLedgerPage(page, 15);
        setLedger(pageData);
        setCurrentPage(page);
      } catch (fetchErr: unknown) {
        const message =
          fetchErr instanceof Error ? fetchErr.message : "Failed to load ledger data.";
        setLoadError(message);
      }
    });
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
          Recent Activity
        </h2>
        <a href="#" className="text-sm font-bold text-[var(--color-vcc-green)] hover:text-green-400 transition-colors">
          View All
        </a>
        {ledger && (
          <span className="text-xs text-[var(--color-text-tertiary)] font-[family-name:var(--font-mono)]">
            {ledger.totalRows} entries
          </span>
        )}
      </div>

      {/* Error State */}
      {loadError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {loadError}
        </div>
      )}

      {/* Loading State */}
      {!ledger && !loadError && (
        <div className="flex items-center justify-center h-[200px]">
          <div className="flex items-center gap-3 text-[var(--color-text-tertiary)] text-sm">
            <LoadingSpinner />
            Loading transactions...
          </div>
        </div>
      )}

      {/* Empty State */}
      {ledger && ledger.rows.length === 0 && (
        <div className="flex items-center justify-center h-[200px] text-[var(--color-text-tertiary)] text-sm">
          No transactions recorded yet. Your payment history will appear here.
        </div>
      )}

      {/* Data Table */}
      {ledger && ledger.rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-dim)]">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium">
                    Type
                  </th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium">
                    Amount
                  </th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium hidden md:table-cell">
                    Token
                  </th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium hidden lg:table-cell">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledger.rows.map((row: LedgerRow) => {
                  const config = getTxConfig(row.type);
                  return (
                    <tr
                      key={row.txId}
                      className="border-b border-[var(--color-border-dim)] hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
                    >
                      <td className="py-3 px-3 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)]">
                        {formatDate(row.txDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap font-[family-name:var(--font-mono)] font-medium">
                        <span style={{ color: config.color }}>
                          {config.sign}R{formatAmount(row.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-tertiary)] hidden md:table-cell">
                        {row.tokenSerial ?? "—"}
                      </td>
                      <td className="py-3 px-3 text-right font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] hidden lg:table-cell">
                        {row.balanceSnapshot
                          ? `R${formatAmount(row.balanceSnapshot)}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border-dim)]">
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Page {ledger.page} of {ledger.totalPages}
            </span>
            <div className="flex gap-2">
              <PaginationButton
                label="Previous"
                disabled={ledger.page <= 1 || isPending}
                onClick={() => fetchPage(ledger.page - 1)}
              />
              <PaginationButton
                label="Next"
                disabled={ledger.page >= ledger.totalPages || isPending}
                onClick={() => fetchPage(ledger.page + 1)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PaginationButton({
  label,
  disabled,
  onClick,
}: {
  readonly label: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
    >
      {label}
    </button>
  );
}

function LoadingSpinner(): React.JSX.Element {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(value: string): string {
  const parts = value.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}
