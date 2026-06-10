// =============================================================================
// VCC — Decimal Utility Tests
// =============================================================================
// Exhaustive tests for the financial math foundation layer.
// PRD 7.1: "100% Code Coverage is mandatory on the Financial Math Engine."
// =============================================================================

import { describe, it, expect } from "vitest";
import {
  Decimal,
  toDecimal,
  ZERO,
  ONE,
  HUNDRED,
  decimalAdd,
  decimalSub,
  decimalMul,
  decimalDiv,
  percentageOf,
  roundZar,
  roundTokenValue,
  isNegative,
  isZero,
  absoluteValue,
  decimalMin,
  decimalMax,
  formatZar,
  serializeDecimal,
} from "./decimal";

describe("toDecimal", () => {
  it("converts a string to Decimal", () => {
    const result = toDecimal("123.456");
    expect(result.toString()).toBe("123.456");
  });

  it("returns the same Decimal instance if already Decimal", () => {
    const original = new Decimal("99.99");
    const result = toDecimal(original);
    expect(result).toBe(original);
  });

  it("throws on invalid input", () => {
    expect(() => toDecimal("not_a_number")).toThrow();
  });
});

describe("constants", () => {
  it("ZERO is 0", () => {
    expect(ZERO.toString()).toBe("0");
  });

  it("ONE is 1", () => {
    expect(ONE.toString()).toBe("1");
  });

  it("HUNDRED is 100", () => {
    expect(HUNDRED.toString()).toBe("100");
  });
});

describe("decimalAdd", () => {
  it("adds two string values", () => {
    expect(decimalAdd("100.50", "200.75").toString()).toBe("301.25");
  });

  it("adds a Decimal and a string", () => {
    const a = new Decimal("50.00");
    expect(decimalAdd(a, "25.50").toString()).toBe("75.5");
  });

  it("handles negative values", () => {
    expect(decimalAdd("100.00", "-37.50").toString()).toBe("62.5");
  });

  it("returns exact result — no floating-point drift", () => {
    // Classic float bug: 0.1 + 0.2 !== 0.3 in native JS
    expect(decimalAdd("0.1", "0.2").toString()).toBe("0.3");
  });
});

describe("decimalSub", () => {
  it("subtracts two string values", () => {
    expect(decimalSub("250.00", "37.50").toString()).toBe("212.5");
  });

  it("returns negative when result is negative", () => {
    expect(decimalSub("10.00", "25.00").toString()).toBe("-15");
  });
});

describe("decimalMul", () => {
  it("multiplies two string values", () => {
    expect(decimalMul("250.00", "0.15").toString()).toBe("37.5");
  });

  it("handles VCC penalty calculation: R250 × 15%", () => {
    // PRD 4.2: "Missing a R250 Gold installment generates a strict R37.50 penalty debt"
    const penalty = decimalMul("250.00", "0.15");
    expect(penalty.toString()).toBe("37.5");
    expect(roundZar(penalty).toFixed(2)).toBe("37.50");
  });
});

describe("decimalDiv", () => {
  it("divides two values", () => {
    expect(decimalDiv("100.00", "3").toFixed(10)).toBe("33.3333333333");
  });

  it("throws on division by zero", () => {
    expect(() => decimalDiv("100.00", "0")).toThrow("Division by zero");
  });

  it("throws on division by zero Decimal", () => {
    expect(() => decimalDiv("100.00", ZERO)).toThrow("Division by zero");
  });
});

describe("percentageOf", () => {
  it("calculates VCC admin fee: R62.50 × 9.75%", () => {
    const fee = percentageOf("62.50", "0.0975");
    expect(roundZar(fee).toFixed(2)).toBe("6.09");
  });

  it("calculates VCC profit fee: R125.00 × 9.00%", () => {
    const fee = percentageOf("125.00", "0.0900");
    expect(roundZar(fee).toFixed(2)).toBe("11.25");
  });

  it("calculates Gold tier penalty: R250.00 × 15%", () => {
    const penalty = percentageOf("250.00", "0.15");
    expect(roundZar(penalty).toFixed(2)).toBe("37.50");
  });

  it("calculates Diamond tier penalty: R2500.00 × 15%", () => {
    const penalty = percentageOf("2500.00", "0.15");
    expect(roundZar(penalty).toFixed(2)).toBe("375.00");
  });
});

describe("roundZar", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundZar("123.456").toFixed(2)).toBe("123.46");
  });

  it("uses banker's rounding — round half to even", () => {
    // 0.5 rounds to 0 (even), 1.5 rounds to 2 (even)
    expect(roundZar("0.005").toFixed(2)).toBe("0.00");
    expect(roundZar("0.015").toFixed(2)).toBe("0.02");
    expect(roundZar("0.025").toFixed(2)).toBe("0.02");
    expect(roundZar("0.035").toFixed(2)).toBe("0.04");
  });

  it("preserves trailing zeros", () => {
    expect(roundZar("100").toFixed(2)).toBe("100.00");
  });
});

describe("roundTokenValue", () => {
  it("rounds to 5 decimal places", () => {
    expect(roundTokenValue("26773.907609").toFixed(5)).toBe("26773.90761");
  });

  it("preserves exact 5-digit values", () => {
    expect(roundTokenValue("26773.90760").toFixed(5)).toBe("26773.90760");
  });
});

describe("isNegative", () => {
  it("returns true for negative values", () => {
    expect(isNegative("-37.50")).toBe(true);
  });

  it("returns false for positive values", () => {
    expect(isNegative("250.00")).toBe(false);
  });

  it("returns false for zero", () => {
    expect(isNegative("0")).toBe(false);
  });
});

describe("isZero", () => {
  it("returns true for zero", () => {
    expect(isZero("0")).toBe(true);
    expect(isZero("0.00")).toBe(true);
  });

  it("returns false for non-zero", () => {
    expect(isZero("0.01")).toBe(false);
    expect(isZero("-0.01")).toBe(false);
  });
});

describe("absoluteValue", () => {
  it("returns positive for negative input", () => {
    expect(absoluteValue("-37.50").toString()).toBe("37.5");
  });

  it("returns same for positive input", () => {
    expect(absoluteValue("250.00").toString()).toBe("250");
  });
});

describe("decimalMin", () => {
  it("returns the smaller value", () => {
    expect(decimalMin("100.00", "200.00").toString()).toBe("100");
  });

  it("handles negative values", () => {
    expect(decimalMin("-10.00", "5.00").toString()).toBe("-10");
  });
});

describe("decimalMax", () => {
  it("returns the larger value", () => {
    expect(decimalMax("100.00", "200.00").toString()).toBe("200");
  });

  it("handles negative values", () => {
    expect(decimalMax("-10.00", "5.00").toString()).toBe("5");
  });
});

describe("formatZar", () => {
  it("formats a simple amount", () => {
    expect(formatZar("1250.00")).toBe("R 1,250.00");
  });

  it("formats the PRD example value: R33,283.91", () => {
    expect(formatZar("33283.91")).toBe("R 33,283.91");
  });

  it("formats negative amounts", () => {
    expect(formatZar("-37.50")).toBe("-R 37.50");
  });

  it("formats zero", () => {
    expect(formatZar("0")).toBe("R 0.00");
  });

  it("formats large amounts with proper comma grouping", () => {
    expect(formatZar("1000000.00")).toBe("R 1,000,000.00");
  });

  it("rounds before formatting", () => {
    expect(formatZar("1205.515")).toBe("R 1,205.52");
  });

  it("formats the PRD carry-over credit: R1,205.51", () => {
    expect(formatZar("1205.51")).toBe("R 1,205.51");
  });
});

describe("serializeDecimal", () => {
  it("serializes to fixed notation string", () => {
    const value = new Decimal("26773.90760");
    expect(serializeDecimal(value)).toBe("26773.9076");
  });

  it("never uses exponential notation", () => {
    const tiny = new Decimal("0.000000000001");
    const result = serializeDecimal(tiny);
    expect(result).not.toContain("e");
    expect(result).toBe("0.000000000001");
  });
});

describe("VCC-specific financial scenarios", () => {
  it("calculates all 8 tier penalties correctly at 15%", () => {
    const tierPenalties: Array<{ monthlySub: string; expectedPenalty: string }> = [
      { monthlySub: "62.50", expectedPenalty: "9.38" },    // Entry: 62.50 × 0.15 = 9.375 → banker's round = 9.38
      { monthlySub: "125.00", expectedPenalty: "18.75" },   // Silver
      { monthlySub: "250.00", expectedPenalty: "37.50" },   // Gold
      { monthlySub: "1000.00", expectedPenalty: "150.00" }, // Platinum
      { monthlySub: "2500.00", expectedPenalty: "375.00" }, // Diamond
      { monthlySub: "750.00", expectedPenalty: "112.50" },  // Group 1
      { monthlySub: "2250.00", expectedPenalty: "337.50" }, // Group 2
      { monthlySub: "5000.00", expectedPenalty: "750.00" }, // Group 3
    ];

    for (const { monthlySub, expectedPenalty } of tierPenalties) {
      const penalty = roundZar(percentageOf(monthlySub, "0.15"));
      expect(penalty.toFixed(2)).toBe(expectedPenalty);
    }
  });

  it("calculates admin fees for all individual tiers", () => {
    const adminFees: Array<{ monthlySub: string; rate: string; expected: string }> = [
      { monthlySub: "62.50", rate: "0.0975", expected: "6.09" },
      { monthlySub: "125.00", rate: "0.0950", expected: "11.88" },  // 11.875 → banker's = 11.88
      { monthlySub: "250.00", rate: "0.0885", expected: "22.12" },  // 22.125 → banker's = 22.12
      { monthlySub: "1000.00", rate: "0.0850", expected: "85.00" },
      { monthlySub: "2500.00", rate: "0.0815", expected: "203.75" },
    ];

    for (const { monthlySub, rate, expected } of adminFees) {
      const fee = roundZar(percentageOf(monthlySub, rate));
      expect(fee.toFixed(2)).toBe(expected);
    }
  });

  it("simulates a basic credit waterfall allocation", () => {
    // Member deposits R500 with:
    // - R37.50 outstanding penalty
    // - R250.00 missed installment (arrears)
    // - R250.00 current month installment
    // Expected: R500 - 37.50 - 250.00 = R212.50 applied to current, R37.50 remains as credit

    let deposit = toDecimal("500.00");

    // Step 1: Clear penalty
    const penalty = toDecimal("37.50");
    const penaltyPayment = decimalMin(deposit, penalty);
    deposit = decimalSub(deposit, penaltyPayment);
    expect(deposit.toString()).toBe("462.5");

    // Step 2: Clear arrears
    const arrears = toDecimal("250.00");
    const arrearsPayment = decimalMin(deposit, arrears);
    deposit = decimalSub(deposit, arrearsPayment);
    expect(deposit.toString()).toBe("212.5");

    // Step 3: Clear current installment
    const currentInstallment = toDecimal("250.00");
    const currentPayment = decimalMin(deposit, currentInstallment);
    deposit = decimalSub(deposit, currentPayment);
    expect(deposit.toString()).toBe("0");

    // Step 4: Remaining credit
    expect(isZero(deposit)).toBe(true);
  });

  it("handles the PRD carry-over credit scenario: R1,205.51", () => {
    // PRD 4.2: "Carry Over Credit from a previous year (e.g., R1,205.51)"
    let credit = toDecimal("1205.51");

    // Apply against 4 months of Gold tier installments (R250.00 each)
    for (let month = 0; month < 4; month++) {
      const installment = toDecimal("250.00");
      const payment = decimalMin(credit, installment);
      credit = decimalSub(credit, payment);
    }

    // After 4 months: 1205.51 - (4 × 250.00) = 205.51
    expect(roundZar(credit).toFixed(2)).toBe("205.51");

    // 5th month: partial payment
    const fifthInstallment = toDecimal("250.00");
    const fifthPayment = decimalMin(credit, fifthInstallment);
    credit = decimalSub(credit, fifthPayment);

    // Remaining: 205.51 - 205.51 = 0, with 44.49 still owed
    expect(isZero(credit)).toBe(true);
    const stillOwed = decimalSub(fifthInstallment, fifthPayment);
    expect(roundZar(stillOwed).toFixed(2)).toBe("44.49");
  });
});
