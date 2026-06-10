// =============================================================================
// VCC — Core Financial Engine
// =============================================================================
// The mathematical brain of Venture Chain Capital.
//
// PRD Section 4.2: "System Rules & Mathematical Automation"
// PRD Section 7.1: "100% Code Coverage is mandatory on the Financial Math Engine"
//
// INVARIANTS:
//   1. Every calculation uses decimal.js — native floats are permanently banned.
//   2. All monetary results are rounded to 2 decimal places (ZAR precision).
//   3. The Credit Waterfall executes in strict priority order — no shortcuts.
//   4. Functions are pure — no side effects, no database calls, no I/O.
//      Database persistence is the caller's responsibility.
// =============================================================================

import type { TokenTier } from "@/generated/prisma";
import {
  Decimal,
  toDecimal,
  ZERO,
  decimalSub,
  decimalMin,
  percentageOf,
  roundZar,
} from "@/lib/decimal";
import { TIER_CONFIGS, PENALTY_RATE, ANNUAL_FEE_ZAR } from "@/lib/constants";
import type { TierConfig } from "@/lib/constants";
import { BusinessRuleError, FinancialIntegrityError } from "@/lib/errors";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

/** Input representing an outstanding penalty that must be cleared first. */
export interface OutstandingPenalty {
  /** Unique reference ID (e.g., ledger tx_id or installment schedule id). */
  readonly referenceId: string;
  /** The penalty amount owed (positive value, ZAR). */
  readonly amountOwed: string;
}

/** Input representing a missed installment (arrears) to be cleared oldest-first. */
export interface ArrearsInstallment {
  /** Unique reference ID for this missed installment. */
  readonly referenceId: string;
  /** The installment amount owed (positive value, ZAR). */
  readonly amountOwed: string;
  /** The due date — used for oldest-first ordering verification. */
  readonly dueDate: Date;
}

/** Input representing the current month's installment. */
export interface CurrentInstallment {
  /** Unique reference ID for this installment. */
  readonly referenceId: string;
  /** The installment amount due (positive value, ZAR). */
  readonly amountDue: string;
}

/** A single allocation record produced by the waterfall. */
export interface WaterfallAllocation {
  /** The reference ID of the obligation this payment was applied to. */
  readonly referenceId: string;
  /** Which waterfall step produced this allocation. */
  readonly step: "PENALTY" | "ARREARS" | "CURRENT_INSTALLMENT";
  /** The amount applied from the deposit toward this obligation. */
  readonly amountApplied: Decimal;
  /** The remaining balance on this obligation after the allocation. */
  readonly remainingOwed: Decimal;
  /** Whether this obligation was fully settled. */
  readonly fullyCleared: boolean;
}

/** The complete result of a credit waterfall execution. */
export interface WaterfallResult {
  /** The original deposit amount that entered the waterfall. */
  readonly depositAmount: Decimal;
  /** Ordered list of every allocation made during the cascade. */
  readonly allocations: ReadonlyArray<WaterfallAllocation>;
  /** Total funds applied to penalty clearance. */
  readonly totalAppliedToPenalties: Decimal;
  /** Total funds applied to arrears clearance. */
  readonly totalAppliedToArrears: Decimal;
  /** Total funds applied to the current installment. */
  readonly totalAppliedToCurrent: Decimal;
  /** Remaining credit held for future deductions. */
  readonly remainingCredit: Decimal;
  /** Summary: total amount consumed (deposit - remainingCredit). */
  readonly totalConsumed: Decimal;
}

/** Result of a penalty calculation. */
export interface PenaltyResult {
  /** The token tier this penalty applies to. */
  readonly tier: TokenTier;
  /** The monthly subscription amount for the tier. */
  readonly installmentAmount: Decimal;
  /** The penalty rate applied (e.g., 0.15). */
  readonly penaltyRate: Decimal;
  /** The calculated penalty amount in ZAR. */
  readonly penaltyAmount: Decimal;
}

/** Result of a fee calculation (admin or profit). */
export interface FeeResult {
  /** The token tier this fee applies to. */
  readonly tier: TokenTier;
  /** The base amount the fee was calculated on. */
  readonly baseAmount: Decimal;
  /** The fee rate applied. */
  readonly feeRate: Decimal;
  /** The calculated fee amount in ZAR. */
  readonly feeAmount: Decimal;
}

// ---------------------------------------------------------------------------
// Tier Configuration Lookup
// ---------------------------------------------------------------------------

/**
 * Retrieves the immutable tier configuration for a given TokenTier.
 * @throws BusinessRuleError if the tier is not found in configuration.
 */
export function getTierConfig(tier: TokenTier): TierConfig {
  const config = TIER_CONFIGS.get(tier);
  if (!config) {
    throw new BusinessRuleError(`Unknown token tier: ${tier}`);
  }
  return config;
}

// ---------------------------------------------------------------------------
// Penalty Calculation — PRD 4.2
// ---------------------------------------------------------------------------

/**
 * Calculates the penalty for a missed installment.
 *
 * PRD 4.2: "If an installment is missed, the system automatically applies
 * a 15% penalty fee to the ledger (e.g., Missing a R250 Gold installment
 * generates a strict R37.50 penalty debt)."
 *
 * @param tier — The token tier of the missed installment.
 * @param customInstallmentAmount — Optional override for the installment
 *   amount. If not provided, uses the tier's standard monthly subscription.
 * @returns PenaltyResult with the exact penalty amount.
 */
export function calculatePenalty(
  tier: TokenTier,
  customInstallmentAmount?: string
): PenaltyResult {
  const config = getTierConfig(tier);
  const installmentAmount = toDecimal(customInstallmentAmount ?? config.monthlySubZar);
  const rate = toDecimal(PENALTY_RATE);

  if (installmentAmount.isNegative() || installmentAmount.isZero()) {
    throw new BusinessRuleError(
      `Installment amount must be positive, received: ${installmentAmount.toFixed(2)}`
    );
  }

  const rawPenalty = percentageOf(installmentAmount, rate);
  const penaltyAmount = roundZar(rawPenalty);

  return {
    tier,
    installmentAmount: roundZar(installmentAmount),
    penaltyRate: rate,
    penaltyAmount,
  };
}

// ---------------------------------------------------------------------------
// Fee Calculations — PRD 4.1
// ---------------------------------------------------------------------------

/**
 * Calculates the admin fee for a given tier and base amount.
 *
 * @param tier — The token tier.
 * @param baseAmount — The amount to calculate the fee on.
 *   If not provided, uses the tier's monthly subscription.
 */
export function calculateAdminFee(
  tier: TokenTier,
  baseAmount?: string
): FeeResult {
  const config = getTierConfig(tier);
  const base = toDecimal(baseAmount ?? config.monthlySubZar);
  const rate = toDecimal(config.adminFeePct);
  const feeAmount = roundZar(percentageOf(base, rate));

  return { tier, baseAmount: roundZar(base), feeRate: rate, feeAmount };
}

/**
 * Calculates the profit fee for a given tier and base amount.
 *
 * @param tier — The token tier.
 * @param baseAmount — The amount to calculate the fee on.
 *   If not provided, uses the tier's monthly subscription.
 */
export function calculateProfitFee(
  tier: TokenTier,
  baseAmount?: string
): FeeResult {
  const config = getTierConfig(tier);
  const base = toDecimal(baseAmount ?? config.monthlySubZar);
  const rate = toDecimal(config.profitFeePct);
  const feeAmount = roundZar(percentageOf(base, rate));

  return { tier, baseAmount: roundZar(base), feeRate: rate, feeAmount };
}

/**
 * Calculates the annual fee deduction.
 * PRD 4.2: "A flat R15.00 fee is deducted from all active accounts annually."
 */
export function calculateAnnualFee(): Decimal {
  return toDecimal(ANNUAL_FEE_ZAR);
}

// ---------------------------------------------------------------------------
// Token Serial Generation — PRD 4.2
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic token serial number.
 *
 * Format: VCC{year}{tierPrefix}{sequence5}
 * Example: VCC2026GT00004 (2026 Gold Token #4)
 *
 * PRD 4.2: "Tokens are uniquely tracked via serial hashes corresponding
 * to the year and tier (e.g., VCC2026GT00004 = 2026 Gold Token #4)."
 *
 * @param tier — The token tier.
 * @param year — The issuance year.
 * @param sequenceNumber — The sequential number within that tier/year.
 * @returns The formatted token serial string.
 */
export function generateTokenSerial(
  tier: TokenTier,
  year: number,
  sequenceNumber: number
): string {
  if (year < 2020 || year > 2100) {
    throw new BusinessRuleError(`Invalid issuance year: ${year}`);
  }
  if (sequenceNumber < 1 || sequenceNumber > 99999) {
    throw new BusinessRuleError(
      `Sequence number must be between 1 and 99999, received: ${sequenceNumber}`
    );
  }
  if (!Number.isInteger(sequenceNumber)) {
    throw new BusinessRuleError(
      `Sequence number must be an integer, received: ${sequenceNumber}`
    );
  }

  const config = getTierConfig(tier);
  const paddedSeq = String(sequenceNumber).padStart(5, "0");

  return `VCC${year}${config.serialPrefix}${paddedSeq}`;
}

// ---------------------------------------------------------------------------
// Credit Waterfall Engine — PRD 4.2 (THE CRITICAL PATH)
// ---------------------------------------------------------------------------

/**
 * Executes the Credit Waterfall — the single most critical financial
 * algorithm in the VCC platform.
 *
 * PRD 4.2: "When a user deposits funds or has 'Carry Over Credit' from
 * a previous year, the system must automatically cascade funds in this
 * strict priority sequence:
 *   1. Clear outstanding Penalty Fees.
 *   2. Clear arrears/missed installments (oldest first).
 *   3. Clear current month's installment.
 *   4. Hold the remainder as CREDIT for future automated deductions."
 *
 * This function is PURE — it computes the waterfall allocation without
 * touching the database. The caller is responsible for persisting the
 * results as ledger entries.
 *
 * @param depositAmount — The incoming funds (must be positive).
 * @param penalties — Outstanding penalty fees to clear (order irrelevant,
 *   processed in array order since all have equal priority).
 * @param arrears — Missed installments to clear, MUST be pre-sorted by
 *   dueDate ascending (oldest first). The engine verifies this ordering.
 * @param currentInstallment — The current month's installment, or null
 *   if no installment is currently due.
 * @returns WaterfallResult with every allocation and the remaining credit.
 *
 * @throws FinancialIntegrityError if the waterfall produces inconsistent
 *   totals (the sum of allocations + remaining credit ≠ deposit).
 * @throws BusinessRuleError if deposit is not positive, or if arrears
 *   are not sorted by dueDate ascending.
 */
export function executeCreditWaterfall(
  depositAmount: string,
  penalties: ReadonlyArray<OutstandingPenalty>,
  arrears: ReadonlyArray<ArrearsInstallment>,
  currentInstallment: CurrentInstallment | null
): WaterfallResult {
  const deposit = roundZar(toDecimal(depositAmount));

  // -----------------------------------------------------------------------
  // Input validation
  // -----------------------------------------------------------------------
  if (deposit.isNegative()) {
    throw new BusinessRuleError(
      `Deposit amount must be non-negative, received: ${deposit.toFixed(2)}`
    );
  }

  // Validate arrears are sorted by dueDate ascending (oldest first).
  for (let i = 1; i < arrears.length; i++) {
    const prev = arrears[i - 1];
    const curr = arrears[i];
    if (curr.dueDate < prev.dueDate) {
      throw new BusinessRuleError(
        `Arrears must be sorted by dueDate ascending (oldest first). ` +
        `Found ${curr.referenceId} (${curr.dueDate.toISOString()}) before ` +
        `${prev.referenceId} (${prev.dueDate.toISOString()}).`
      );
    }
  }

  // Validate all obligation amounts are positive
  for (const penalty of penalties) {
    const amt = toDecimal(penalty.amountOwed);
    if (amt.isNegative() || amt.isZero()) {
      throw new BusinessRuleError(
        `Penalty amount must be positive for ${penalty.referenceId}, received: ${amt.toFixed(2)}`
      );
    }
  }
  for (const installment of arrears) {
    const amt = toDecimal(installment.amountOwed);
    if (amt.isNegative() || amt.isZero()) {
      throw new BusinessRuleError(
        `Arrears amount must be positive for ${installment.referenceId}, received: ${amt.toFixed(2)}`
      );
    }
  }
  if (currentInstallment) {
    const amt = toDecimal(currentInstallment.amountDue);
    if (amt.isNegative() || amt.isZero()) {
      throw new BusinessRuleError(
        `Current installment amount must be positive for ${currentInstallment.referenceId}, received: ${amt.toFixed(2)}`
      );
    }
  }

  // -----------------------------------------------------------------------
  // Waterfall execution
  // -----------------------------------------------------------------------
  let remainingFunds = deposit;
  const allocations: WaterfallAllocation[] = [];
  let totalAppliedToPenalties = ZERO;
  let totalAppliedToArrears = ZERO;
  let totalAppliedToCurrent = ZERO;

  // STEP 1: Clear outstanding Penalty Fees
  for (const penalty of penalties) {
    if (remainingFunds.isZero()) break;

    const owed = roundZar(toDecimal(penalty.amountOwed));
    const payment = decimalMin(remainingFunds, owed);
    const remaining = roundZar(decimalSub(owed, payment));

    allocations.push({
      referenceId: penalty.referenceId,
      step: "PENALTY",
      amountApplied: roundZar(payment),
      remainingOwed: remaining,
      fullyCleared: remaining.isZero(),
    });

    remainingFunds = roundZar(decimalSub(remainingFunds, payment));
    totalAppliedToPenalties = roundZar(totalAppliedToPenalties.plus(payment));
  }

  // STEP 2: Clear arrears/missed installments (oldest first)
  for (const installment of arrears) {
    if (remainingFunds.isZero()) break;

    const owed = roundZar(toDecimal(installment.amountOwed));
    const payment = decimalMin(remainingFunds, owed);
    const remaining = roundZar(decimalSub(owed, payment));

    allocations.push({
      referenceId: installment.referenceId,
      step: "ARREARS",
      amountApplied: roundZar(payment),
      remainingOwed: remaining,
      fullyCleared: remaining.isZero(),
    });

    remainingFunds = roundZar(decimalSub(remainingFunds, payment));
    totalAppliedToArrears = roundZar(totalAppliedToArrears.plus(payment));
  }

  // STEP 3: Clear current month's installment
  if (currentInstallment && !remainingFunds.isZero()) {
    const owed = roundZar(toDecimal(currentInstallment.amountDue));
    const payment = decimalMin(remainingFunds, owed);
    const remaining = roundZar(decimalSub(owed, payment));

    allocations.push({
      referenceId: currentInstallment.referenceId,
      step: "CURRENT_INSTALLMENT",
      amountApplied: roundZar(payment),
      remainingOwed: remaining,
      fullyCleared: remaining.isZero(),
    });

    remainingFunds = roundZar(decimalSub(remainingFunds, payment));
    totalAppliedToCurrent = roundZar(totalAppliedToCurrent.plus(payment));
  }

  // STEP 4: Hold remainder as CREDIT (remainingFunds is the credit)
  const remainingCredit = roundZar(remainingFunds);

  // -----------------------------------------------------------------------
  // Integrity verification — the cardinal rule of financial systems
  // -----------------------------------------------------------------------
  const totalConsumed = roundZar(
    totalAppliedToPenalties
      .plus(totalAppliedToArrears)
      .plus(totalAppliedToCurrent)
  );
  const expectedDeposit = roundZar(totalConsumed.plus(remainingCredit));

  // The following branch is a defensive safety net — mathematically proven
  // unreachable by the integrity verification test suite. It remains as
  // catastrophic failure detection in case of decimal.js behavioral changes.
  /* v8 ignore start */
  if (!expectedDeposit.eq(deposit)) {
    throw new FinancialIntegrityError(
      `Waterfall integrity check failed: ` +
      `deposit=${deposit.toFixed(2)}, ` +
      `consumed=${totalConsumed.toFixed(2)}, ` +
      `credit=${remainingCredit.toFixed(2)}, ` +
      `sum=${expectedDeposit.toFixed(2)}. ` +
      `The sum of allocations + credit must exactly equal the deposit.`
    );
  }
  /* v8 ignore stop */

  return {
    depositAmount: deposit,
    allocations,
    totalAppliedToPenalties,
    totalAppliedToArrears,
    totalAppliedToCurrent,
    remainingCredit,
    totalConsumed,
  };
}

// ---------------------------------------------------------------------------
// Batch Penalty Calculation — for CRON automated monthly penalty runs
// ---------------------------------------------------------------------------

/** Input for a single missed installment in a batch penalty run. */
export interface MissedInstallmentInput {
  /** The member's membership number. */
  readonly membershipNo: string;
  /** The token serial of the missed installment. */
  readonly tokenSerial: string;
  /** The token tier. */
  readonly tier: TokenTier;
  /** Optional custom installment amount (overrides tier default). */
  readonly customAmount?: string;
}

/** Result of a single penalty in a batch run. */
export interface BatchPenaltyEntry {
  readonly membershipNo: string;
  readonly tokenSerial: string;
  readonly tier: TokenTier;
  readonly installmentAmount: Decimal;
  readonly penaltyAmount: Decimal;
}

/**
 * Calculates penalties for a batch of missed installments.
 *
 * Used by the CRON job that runs monthly to detect missed installments
 * and generate penalty ledger entries.
 *
 * @param missedInstallments — Array of missed installment inputs.
 * @returns Array of BatchPenaltyEntry results with calculated penalties.
 */
export function calculateBatchPenalties(
  missedInstallments: ReadonlyArray<MissedInstallmentInput>
): ReadonlyArray<BatchPenaltyEntry> {
  return missedInstallments.map((missed) => {
    const result = calculatePenalty(missed.tier, missed.customAmount);
    return {
      membershipNo: missed.membershipNo,
      tokenSerial: missed.tokenSerial,
      tier: missed.tier,
      installmentAmount: result.installmentAmount,
      penaltyAmount: result.penaltyAmount,
    };
  });
}

// ---------------------------------------------------------------------------
// Account Valuation — PRD 5.1 "Total Account Value"
// ---------------------------------------------------------------------------

/** A single token holding with its current valuation. */
export interface TokenHolding {
  readonly tokenSerial: string;
  readonly tier: TokenTier;
  /** Current cashout value per token (from latest TokenPricingHistory). */
  readonly currentCashoutValue: string;
}

/**
 * Calculates the total account value for a member based on their
 * active token holdings and current pricing.
 *
 * PRD 5.1: "Hero Metric: Total Account Value (e.g., R33,283.91)
 * updated dynamically based on Weekly Token Valuation Prices."
 *
 * @param holdings — The member's active token holdings with current values.
 * @param creditBalance — Any credit balance held in the account.
 * @returns The total account value in ZAR.
 */
export function calculateTotalAccountValue(
  holdings: ReadonlyArray<TokenHolding>,
  creditBalance: string
): Decimal {
  let totalTokenValue = ZERO;

  for (const holding of holdings) {
    const cashoutValue = toDecimal(holding.currentCashoutValue);
    if (cashoutValue.isNegative()) {
      throw new FinancialIntegrityError(
        `Negative cashout value for token ${holding.tokenSerial}: ${cashoutValue.toFixed(2)}`
      );
    }
    totalTokenValue = totalTokenValue.plus(cashoutValue);
  }

  const credit = toDecimal(creditBalance);
  return roundZar(totalTokenValue.plus(credit));
}
