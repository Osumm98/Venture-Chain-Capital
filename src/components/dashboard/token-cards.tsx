"use client";

import { useState } from "react";
import type { TokenCardData } from "@/actions/dashboard";

// ---------------------------------------------------------------------------
// Tier colour map — each tier gets a distinct accent
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, { readonly border: string; readonly glow: string; readonly text: string }> = {
  ENTRY:    { border: "rgba(139,161,176,0.3)", glow: "rgba(139,161,176,0.08)", text: "#8BA1B0" },
  SILVER:   { border: "rgba(176,196,210,0.3)", glow: "rgba(176,196,210,0.08)", text: "#B0C4D2" },
  GOLD:     { border: "rgba(234,179,8,0.4)",   glow: "rgba(234,179,8,0.10)",  text: "#EAB308" },
  PLATINUM: { border: "rgba(168,162,206,0.4)", glow: "rgba(168,162,206,0.10)", text: "#A8A2CE" },
  DIAMOND:  { border: "rgba(130,220,255,0.4)", glow: "rgba(130,220,255,0.12)", text: "#82DCFF" },
  GROUP_1:  { border: "rgba(0,255,136,0.3)",   glow: "rgba(0,255,136,0.08)",  text: "#00FF88" },
  GROUP_2:  { border: "rgba(0,255,136,0.4)",   glow: "rgba(0,255,136,0.10)",  text: "#00FF88" },
  GROUP_3:  { border: "rgba(0,255,136,0.5)",   glow: "rgba(0,255,136,0.12)",  text: "#00FF88" },
};

function getTierColor(tier: string): { readonly border: string; readonly glow: string; readonly text: string } {
  return TIER_COLORS[tier] ?? TIER_COLORS.ENTRY;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TokenCardsProps {
  readonly tokens: ReadonlyArray<TokenCardData>;
}

export function TokenCards({ tokens }: TokenCardsProps): React.JSX.Element {
  if (tokens.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
          Token Wallet
        </h2>
        <div className="flex items-center justify-center h-[160px] text-[var(--color-text-tertiary)] text-sm">
          No active tokens. Purchase a token package to start building wealth.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
        Token Wallet
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <FlippableTokenCard key={token.tokenSerial} token={token} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual Flippable Card
// ---------------------------------------------------------------------------

function FlippableTokenCard({
  token,
}: {
  readonly token: TokenCardData;
}): React.JSX.Element {
  const [isFlipped, setIsFlipped] = useState(false);
  const colors = getTierColor(token.tier);
  const progress =
    token.installmentsTotal > 0
      ? (token.installmentsPaid / token.installmentsTotal) * 100
      : 0;

  return (
    <div
      className="relative h-[220px] cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${token.tier} token card. Click to flip.`}
    >
      <div
        className="w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ---- FRONT ---- */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(135deg, rgba(15,22,30,0.8) 0%, ${colors.glow} 100%)`,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 30px ${colors.glow}`,
          }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-heading)]"
                style={{ color: colors.text }}
              >
                {token.tier.replace("_", " ")}
              </p>
              <p className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-text-tertiary)] mt-1">
                {token.tokenSerial}
              </p>
            </div>
            {token.isCarryOver && (
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[var(--color-vcc-green-subtle)] text-[var(--color-vcc-green)] font-medium">
                Carry-Over
              </span>
            )}
          </div>

          {/* Value */}
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
              Current Value
            </p>
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: colors.text }}>
              R{formatValue(token.currentCashoutValue)}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] mb-1.5">
              <span>
                {token.installmentsPaid}/{token.installmentsTotal} installments
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: colors.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* ---- BACK ---- */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center gap-3"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(135deg, rgba(15,22,30,0.9) 0%, ${colors.glow} 100%)`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p
            className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-heading)]"
            style={{ color: colors.text }}
          >
            {token.tier.replace("_", " ")} Token
          </p>

          <div className="w-full space-y-3 text-sm">
            <DetailRow label="Serial" value={token.tokenSerial} />
            <DetailRow label="Issue Year" value={String(token.issueYear)} />
            <DetailRow label="Status" value={token.status} />
            <DetailRow label="Cashout" value={`R${formatValue(token.currentCashoutValue)}`} />
            <DetailRow
              label="Payments"
              value={`${token.installmentsPaid} of ${token.installmentsTotal}`}
            />
          </div>

          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">
            Tap to flip back
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div className="flex justify-between border-b border-[var(--color-border-dim)] pb-1.5">
      <span className="text-[var(--color-text-tertiary)] text-xs">{label}</span>
      <span className="text-[var(--color-text-primary)] text-xs font-[family-name:var(--font-mono)]">
        {value}
      </span>
    </div>
  );
}

function formatValue(value: string): string {
  const parts = value.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}
