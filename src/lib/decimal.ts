// =============================================================================
// VCC — Decimal.js Wrapper Utilities
// =============================================================================
// Centralizes all decimal.js configuration and provides typed helper functions
// for financial math. Native JS floats are NEVER used for money calculations.
// =============================================================================

import Decimal from "decimal.js";

// Configure decimal.js for financial precision
Decimal.set({
  precision: 30,       // 30 significant digits
  rounding: Decimal.ROUND_HALF_EVEN, // Banker's rounding — unbiased for financial sums
  toExpNeg: -18,       // Don't use exponential notation for small numbers
  toExpPos: 30,        // Don't use exponential notation for large numbers
});

export { Decimal };

// ---------------------------------------------------------------------------
// Construction helpers — always from string, never from float
// ---------------------------------------------------------------------------

/** Create a Decimal from a string value. Throws on invalid input. */
export function toDecimal(value: string | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}

/** Safe zero constant */
export const ZERO = new Decimal("0");

/** Safe one constant */
export const ONE = new Decimal("1");

/** Safe one hundred constant (for percentage conversions) */
export const HUNDRED = new Decimal("100");

// ---------------------------------------------------------------------------
// Financial arithmetic — all operations return Decimal, never number
// ---------------------------------------------------------------------------

/** Add two decimal values */
export function decimalAdd(a: string | Decimal, b: string | Decimal): Decimal {
  return toDecimal(a).plus(toDecimal(b));
}

/** Subtract b from a */
export function decimalSub(a: string | Decimal, b: string | Decimal): Decimal {
  return toDecimal(a).minus(toDecimal(b));
}

/** Multiply two decimal values */
export function decimalMul(a: string | Decimal, b: string | Decimal): Decimal {
  return toDecimal(a).times(toDecimal(b));
}

/** Divide a by b. Throws if b is zero. */
export function decimalDiv(a: string | Decimal, b: string | Decimal): Decimal {
  const divisor = toDecimal(b);
  if (divisor.isZero()) {
    throw new Error("Division by zero in financial calculation");
  }
  return toDecimal(a).dividedBy(divisor);
}

/**
 * Calculate a percentage of a base amount.
 * @param base — The base amount (e.g., "250.00")
 * @param rate — The percentage as a decimal (e.g., "0.15" for 15%)
 * @returns The calculated amount
 */
export function percentageOf(base: string | Decimal, rate: string | Decimal): Decimal {
  return decimalMul(base, rate);
}

/**
 * Round to exactly 2 decimal places (ZAR currency precision).
 * Uses banker's rounding (ROUND_HALF_EVEN) to prevent systematic bias.
 */
export function roundZar(value: string | Decimal): Decimal {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
}

/**
 * Round to exactly 5 decimal places (token valuation precision).
 */
export function roundTokenValue(value: string | Decimal): Decimal {
  return toDecimal(value).toDecimalPlaces(5, Decimal.ROUND_HALF_EVEN);
}

/**
 * Check if a value is negative (debt/liability).
 */
export function isNegative(value: string | Decimal): boolean {
  return toDecimal(value).isNegative();
}

/**
 * Check if a value is zero.
 */
export function isZero(value: string | Decimal): boolean {
  return toDecimal(value).isZero();
}

/**
 * Return the absolute value.
 */
export function absoluteValue(value: string | Decimal): Decimal {
  return toDecimal(value).abs();
}

/**
 * Return the minimum of two decimal values.
 */
export function decimalMin(a: string | Decimal, b: string | Decimal): Decimal {
  return Decimal.min(toDecimal(a), toDecimal(b));
}

/**
 * Return the maximum of two decimal values.
 */
export function decimalMax(a: string | Decimal, b: string | Decimal): Decimal {
  return Decimal.max(toDecimal(a), toDecimal(b));
}

/**
 * Format a Decimal as a ZAR currency string (e.g., "R 1,250.00").
 */
export function formatZar(value: string | Decimal): string {
  const d = roundZar(value);
  const parts = d.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1];

  if (d.isNegative()) {
    return `-R ${integerPart.replace("-", "")}.${decimalPart}`;
  }
  return `R ${integerPart}.${decimalPart}`;
}

/**
 * Serialize a Decimal to a string for JSON/API transport.
 * Always uses fixed notation, never exponential.
 */
export function serializeDecimal(value: Decimal): string {
  return value.toFixed();
}
