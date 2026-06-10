// =============================================================================
// VCC — Token Tier Configuration Constants
// =============================================================================
// Extracted from PRD Section 4.1 Token Tiers & Fee Matrices.
// These are the SEED values. Runtime values come from TokenPricingHistory.
// All numeric values stored as strings for decimal.js construction.
// =============================================================================

import type { TokenTier } from "@/generated/prisma";

export interface TierConfig {
  readonly tier: TokenTier;
  readonly type: "INDIVIDUAL" | "ORGANISATIONAL";
  readonly label: string;
  readonly monthlySubZar: string;
  readonly adminFeePct: string;
  readonly profitFeePct: string;
  readonly serialPrefix: string; // 2-char prefix for token serial generation
}

/**
 * Immutable tier configuration map.
 * Monthly sub values are in ZAR. Fee percentages are stored as decimals (9.75% → "0.0975").
 */
export const TIER_CONFIGS: ReadonlyMap<TokenTier, TierConfig> = new Map([
  [
    "ENTRY",
    {
      tier: "ENTRY",
      type: "INDIVIDUAL",
      label: "Entry",
      monthlySubZar: "62.50",
      adminFeePct: "0.0975",
      profitFeePct: "0.0915",
      serialPrefix: "EN",
    },
  ],
  [
    "SILVER",
    {
      tier: "SILVER",
      type: "INDIVIDUAL",
      label: "Silver",
      monthlySubZar: "125.00",
      adminFeePct: "0.0950",
      profitFeePct: "0.0900",
      serialPrefix: "SV",
    },
  ],
  [
    "GOLD",
    {
      tier: "GOLD",
      type: "INDIVIDUAL",
      label: "Gold",
      monthlySubZar: "250.00",
      adminFeePct: "0.0885",
      profitFeePct: "0.0875",
      serialPrefix: "GT",
    },
  ],
  [
    "PLATINUM",
    {
      tier: "PLATINUM",
      type: "INDIVIDUAL",
      label: "Platinum",
      monthlySubZar: "1000.00",
      adminFeePct: "0.0850",
      profitFeePct: "0.0850",
      serialPrefix: "PT",
    },
  ],
  [
    "DIAMOND",
    {
      tier: "DIAMOND",
      type: "INDIVIDUAL",
      label: "Diamond",
      monthlySubZar: "2500.00",
      adminFeePct: "0.0815",
      profitFeePct: "0.0815",
      serialPrefix: "DM",
    },
  ],
  [
    "GROUP_1",
    {
      tier: "GROUP_1",
      type: "ORGANISATIONAL",
      label: "Group 1",
      monthlySubZar: "750.00",
      adminFeePct: "0.0860",
      profitFeePct: "0.0875",
      serialPrefix: "G1",
    },
  ],
  [
    "GROUP_2",
    {
      tier: "GROUP_2",
      type: "ORGANISATIONAL",
      label: "Group 2",
      monthlySubZar: "2250.00",
      adminFeePct: "0.0825",
      profitFeePct: "0.0825",
      serialPrefix: "G2",
    },
  ],
  [
    "GROUP_3",
    {
      tier: "GROUP_3",
      type: "ORGANISATIONAL",
      label: "Group 3",
      monthlySubZar: "5000.00",
      adminFeePct: "0.0800",
      profitFeePct: "0.0800",
      serialPrefix: "G3",
    },
  ],
]);

// ---------------------------------------------------------------------------
// System-wide financial constants
// ---------------------------------------------------------------------------

/** Annual fee deducted from all active accounts (ZAR) — PRD 4.2 */
export const ANNUAL_FEE_ZAR = "15.00";

/** Penalty rate applied to missed installments — PRD 4.2 */
export const PENALTY_RATE = "0.15";

/** Shareholder monthly contribution (ZAR) — PRD 4.2 */
export const SHAREHOLDER_MONTHLY_CONTRIBUTION_ZAR = "150.00";

/**
 * Credit Waterfall Priority Order — PRD 4.2
 * When funds are deposited, they cascade in this strict sequence:
 * 1. Clear outstanding penalty fees
 * 2. Clear arrears/missed installments (oldest first)
 * 3. Clear current month's installment
 * 4. Hold remainder as credit
 */
export const CREDIT_WATERFALL_PRIORITY = [
  "PENALTY",
  "ARREARS",
  "CURRENT_INSTALLMENT",
  "CREDIT",
] as const;

export type CreditWaterfallStep = (typeof CREDIT_WATERFALL_PRIORITY)[number];

// ---------------------------------------------------------------------------
// Asset classes — maps to the 5 portfolio domains
// ---------------------------------------------------------------------------

export const ASSET_CLASSES = [
  "CRYPTO",
  "STOCKS",
  "COMMODITIES",
  "FOREX",
  "HEDGE",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

/** Maps admin roles to their portfolio asset class */
export const ROLE_TO_ASSET_CLASS: ReadonlyMap<string, AssetClass> = new Map([
  ["ADMIN_CRYPTO", "CRYPTO"],
  ["ADMIN_STOCKS", "STOCKS"],
  ["ADMIN_COMMODITIES", "COMMODITIES"],
  ["ADMIN_FOREX", "FOREX"],
  ["ADMIN_HEDGE", "HEDGE"],
]);
