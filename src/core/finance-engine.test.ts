// =============================================================================
// VCC — Core Financial Engine: Exhaustive Test Suite
// =============================================================================
// PRD 7.1: "100% Code Coverage is mandatory on the Financial Math Engine.
// Every permutation of the Credit Waterfall logic, 15% penalty generation,
// and percentage-based fee deductions must be asserted. Floating-point
// deviations will immediately fail the CI/CD pipeline."
//
// Test organization:
//   1. Penalty Calculation — all 8 tiers, edge cases
//   2. Fee Calculations — admin & profit fees for all tiers
//   3. Annual Fee — flat R15 charge
//   4. Token Serial Generation — format, bounds, errors
//   5. Credit Waterfall — the exhaustive permutation matrix
//   6. Batch Penalties — CRON-style bulk processing
//   7. Account Valuation — total value calculation
// =============================================================================

import { describe, it, expect } from "vitest";
import type { TokenTier } from "@prisma/client";
import {
  calculatePenalty,
  calculateAdminFee,
  calculateProfitFee,
  calculateAnnualFee,
  generateTokenSerial,
  executeCreditWaterfall,
  calculateBatchPenalties,
  calculateTotalAccountValue,
  getTierConfig,
} from "./finance-engine";
import type {
  OutstandingPenalty,
  ArrearsInstallment,
  CurrentInstallment,
} from "./finance-engine";
import { BusinessRuleError, FinancialIntegrityError } from "@/lib/errors";

// ---------------------------------------------------------------------------
// Helper: shortcut to create arrears with dates
// ---------------------------------------------------------------------------
function makeArrears(
  id: string,
  amount: string,
  dueDate: string
): ArrearsInstallment {
  return { referenceId: id, amountOwed: amount, dueDate: new Date(dueDate) };
}

function makePenalty(id: string, amount: string): OutstandingPenalty {
  return { referenceId: id, amountOwed: amount };
}

function makeCurrent(id: string, amount: string): CurrentInstallment {
  return { referenceId: id, amountDue: amount };
}

// =============================================================================
// 1. PENALTY CALCULATION
// =============================================================================

describe("calculatePenalty", () => {
  describe("calculates correct 15% penalty for all 8 tiers", () => {
    const expectedPenalties: Array<{
      tier: TokenTier;
      monthlySub: string;
      expectedPenalty: string;
    }> = [
      { tier: "ENTRY", monthlySub: "62.50", expectedPenalty: "9.38" },
      { tier: "SILVER", monthlySub: "125.00", expectedPenalty: "18.75" },
      { tier: "GOLD", monthlySub: "250.00", expectedPenalty: "37.50" },
      { tier: "PLATINUM", monthlySub: "1000.00", expectedPenalty: "150.00" },
      { tier: "DIAMOND", monthlySub: "2500.00", expectedPenalty: "375.00" },
      { tier: "GROUP_1", monthlySub: "750.00", expectedPenalty: "112.50" },
      { tier: "GROUP_2", monthlySub: "2250.00", expectedPenalty: "337.50" },
      { tier: "GROUP_3", monthlySub: "5000.00", expectedPenalty: "750.00" },
    ];

    for (const { tier, monthlySub, expectedPenalty } of expectedPenalties) {
      it(`${tier}: R${monthlySub} × 15% = R${expectedPenalty}`, () => {
        const result = calculatePenalty(tier);
        expect(result.tier).toBe(tier);
        expect(result.installmentAmount.toFixed(2)).toBe(monthlySub);
        expect(result.penaltyRate.toFixed(2)).toBe("0.15");
        expect(result.penaltyAmount.toFixed(2)).toBe(expectedPenalty);
      });
    }
  });

  it("accepts a custom installment amount override", () => {
    // A member upgraded mid-year; penalty based on the actual amount owed
    const result = calculatePenalty("GOLD", "300.00");
    expect(result.penaltyAmount.toFixed(2)).toBe("45.00"); // 300 × 0.15
    expect(result.installmentAmount.toFixed(2)).toBe("300.00");
  });

  it("handles fractional installment amounts with banker's rounding", () => {
    // 333.33 × 0.15 = 49.9995 → banker's rounds to 50.00
    const result = calculatePenalty("GOLD", "333.33");
    expect(result.penaltyAmount.toFixed(2)).toBe("50.00");
  });

  it("handles very small installment amounts", () => {
    // 1.00 × 0.15 = 0.15
    const result = calculatePenalty("ENTRY", "1.00");
    expect(result.penaltyAmount.toFixed(2)).toBe("0.15");
  });

  it("handles very large installment amounts", () => {
    // 99999.99 × 0.15 = 14999.9985 → rounds to 15000.00
    const result = calculatePenalty("GROUP_3", "99999.99");
    expect(result.penaltyAmount.toFixed(2)).toBe("15000.00");
  });

  it("throws BusinessRuleError for zero installment amount", () => {
    expect(() => calculatePenalty("GOLD", "0")).toThrow(BusinessRuleError);
    expect(() => calculatePenalty("GOLD", "0")).toThrow("must be positive");
  });

  it("throws BusinessRuleError for negative installment amount", () => {
    expect(() => calculatePenalty("GOLD", "-250.00")).toThrow(BusinessRuleError);
  });
});

// =============================================================================
// 2. FEE CALCULATIONS
// =============================================================================

describe("calculateAdminFee", () => {
  const expectedAdminFees: Array<{
    tier: TokenTier;
    rate: string;
    expectedFee: string;
  }> = [
    { tier: "ENTRY", rate: "0.0975", expectedFee: "6.09" },
    { tier: "SILVER", rate: "0.0950", expectedFee: "11.88" },
    { tier: "GOLD", rate: "0.0885", expectedFee: "22.12" },
    { tier: "PLATINUM", rate: "0.0850", expectedFee: "85.00" },
    { tier: "DIAMOND", rate: "0.0815", expectedFee: "203.75" },
    { tier: "GROUP_1", rate: "0.0860", expectedFee: "64.50" },
    { tier: "GROUP_2", rate: "0.0825", expectedFee: "185.62" },
    { tier: "GROUP_3", rate: "0.0800", expectedFee: "400.00" },
  ];

  for (const { tier, rate, expectedFee } of expectedAdminFees) {
    it(`${tier}: admin fee at ${rate} = R${expectedFee}`, () => {
      const result = calculateAdminFee(tier);
      expect(result.tier).toBe(tier);
      expect(result.feeRate.toFixed(4)).toBe(rate);
      expect(result.feeAmount.toFixed(2)).toBe(expectedFee);
    });
  }

  it("accepts a custom base amount", () => {
    const result = calculateAdminFee("GOLD", "500.00");
    // 500 × 0.0885 = 44.25
    expect(result.feeAmount.toFixed(2)).toBe("44.25");
    expect(result.baseAmount.toFixed(2)).toBe("500.00");
  });
});

describe("calculateProfitFee", () => {
  const expectedProfitFees: Array<{
    tier: TokenTier;
    rate: string;
    expectedFee: string;
  }> = [
    { tier: "ENTRY", rate: "0.0915", expectedFee: "5.72" },
    { tier: "SILVER", rate: "0.0900", expectedFee: "11.25" },
    { tier: "GOLD", rate: "0.0875", expectedFee: "21.88" },
    { tier: "PLATINUM", rate: "0.0850", expectedFee: "85.00" },
    { tier: "DIAMOND", rate: "0.0815", expectedFee: "203.75" },
    { tier: "GROUP_1", rate: "0.0875", expectedFee: "65.62" },
    { tier: "GROUP_2", rate: "0.0825", expectedFee: "185.62" },
    { tier: "GROUP_3", rate: "0.0800", expectedFee: "400.00" },
  ];

  for (const { tier, rate, expectedFee } of expectedProfitFees) {
    it(`${tier}: profit fee at ${rate} = R${expectedFee}`, () => {
      const result = calculateProfitFee(tier);
      expect(result.tier).toBe(tier);
      expect(result.feeRate.toFixed(4)).toBe(rate);
      expect(result.feeAmount.toFixed(2)).toBe(expectedFee);
    });
  }

  it("accepts a custom base amount", () => {
    const result = calculateProfitFee("SILVER", "1000.00");
    // 1000 × 0.0900 = 90.00
    expect(result.feeAmount.toFixed(2)).toBe("90.00");
  });
});

// =============================================================================
// 3. ANNUAL FEE
// =============================================================================

describe("calculateAnnualFee", () => {
  it("returns exactly R15.00", () => {
    const fee = calculateAnnualFee();
    expect(fee.toFixed(2)).toBe("15.00");
  });
});

// =============================================================================
// 4. TIER CONFIG LOOKUP
// =============================================================================

describe("getTierConfig", () => {
  it("returns correct config for all 8 tiers", () => {
    const tiers: TokenTier[] = [
      "ENTRY", "SILVER", "GOLD", "PLATINUM",
      "DIAMOND", "GROUP_1", "GROUP_2", "GROUP_3",
    ];
    for (const tier of tiers) {
      const config = getTierConfig(tier);
      expect(config.tier).toBe(tier);
      expect(config.monthlySubZar).toBeTruthy();
      expect(config.serialPrefix).toBeTruthy();
    }
  });

  it("throws BusinessRuleError for unknown tier", () => {
    // Force an invalid tier string to test the guard
    expect(() => getTierConfig("BRONZE" as TokenTier)).toThrow(BusinessRuleError);
    expect(() => getTierConfig("BRONZE" as TokenTier)).toThrow("Unknown token tier");
  });
});

// =============================================================================
// 5. TOKEN SERIAL GENERATION
// =============================================================================

describe("generateTokenSerial", () => {
  it("generates correct format: VCC{year}{prefix}{seq}", () => {
    expect(generateTokenSerial("GOLD", 2026, 4)).toBe("VCC2026GT00004");
    expect(generateTokenSerial("ENTRY", 2026, 1)).toBe("VCC2026EN00001");
    expect(generateTokenSerial("DIAMOND", 2025, 100)).toBe("VCC2025DM00100");
    expect(generateTokenSerial("SILVER", 2024, 99999)).toBe("VCC2024SV99999");
  });

  it("generates correct prefixes for all 8 tiers", () => {
    const expectedPrefixes: Array<{ tier: TokenTier; prefix: string }> = [
      { tier: "ENTRY", prefix: "EN" },
      { tier: "SILVER", prefix: "SV" },
      { tier: "GOLD", prefix: "GT" },
      { tier: "PLATINUM", prefix: "PT" },
      { tier: "DIAMOND", prefix: "DM" },
      { tier: "GROUP_1", prefix: "G1" },
      { tier: "GROUP_2", prefix: "G2" },
      { tier: "GROUP_3", prefix: "G3" },
    ];

    for (const { tier, prefix } of expectedPrefixes) {
      const serial = generateTokenSerial(tier, 2026, 1);
      expect(serial).toBe(`VCC2026${prefix}00001`);
    }
  });

  it("pads sequence numbers with leading zeros", () => {
    expect(generateTokenSerial("GOLD", 2026, 1)).toBe("VCC2026GT00001");
    expect(generateTokenSerial("GOLD", 2026, 42)).toBe("VCC2026GT00042");
    expect(generateTokenSerial("GOLD", 2026, 999)).toBe("VCC2026GT00999");
    expect(generateTokenSerial("GOLD", 2026, 10000)).toBe("VCC2026GT10000");
  });

  it("throws for year before 2020", () => {
    expect(() => generateTokenSerial("GOLD", 2019, 1)).toThrow(BusinessRuleError);
    expect(() => generateTokenSerial("GOLD", 2019, 1)).toThrow("Invalid issuance year");
  });

  it("throws for year after 2100", () => {
    expect(() => generateTokenSerial("GOLD", 2101, 1)).toThrow(BusinessRuleError);
  });

  it("throws for sequence number 0", () => {
    expect(() => generateTokenSerial("GOLD", 2026, 0)).toThrow(BusinessRuleError);
    expect(() => generateTokenSerial("GOLD", 2026, 0)).toThrow("between 1 and 99999");
  });

  it("throws for sequence number > 99999", () => {
    expect(() => generateTokenSerial("GOLD", 2026, 100000)).toThrow(BusinessRuleError);
  });

  it("throws for non-integer sequence number", () => {
    expect(() => generateTokenSerial("GOLD", 2026, 1.5)).toThrow(BusinessRuleError);
    expect(() => generateTokenSerial("GOLD", 2026, 1.5)).toThrow("must be an integer");
  });

  it("throws for negative sequence number", () => {
    expect(() => generateTokenSerial("GOLD", 2026, -1)).toThrow(BusinessRuleError);
  });

  it("accepts boundary values: year 2020, sequence 1", () => {
    expect(generateTokenSerial("ENTRY", 2020, 1)).toBe("VCC2020EN00001");
  });

  it("accepts boundary values: year 2100, sequence 99999", () => {
    expect(generateTokenSerial("GROUP_3", 2100, 99999)).toBe("VCC2100G399999");
  });
});

// =============================================================================
// 6. CREDIT WATERFALL — THE EXHAUSTIVE PERMUTATION MATRIX
// =============================================================================

describe("executeCreditWaterfall", () => {
  // -------------------------------------------------------------------------
  // 6.1 — Zero deposit (edge case)
  // -------------------------------------------------------------------------
  describe("zero deposit", () => {
    it("returns zero allocations when deposit is R0.00", () => {
      const result = executeCreditWaterfall("0.00", [], [], null);
      expect(result.depositAmount.toFixed(2)).toBe("0.00");
      expect(result.allocations).toHaveLength(0);
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("0.00");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("0.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("0.00");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
      expect(result.totalConsumed.toFixed(2)).toBe("0.00");
    });

    it("returns zero allocations when deposit is R0.00 with obligations", () => {
      const result = executeCreditWaterfall(
        "0.00",
        [makePenalty("pen-1", "37.50")],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.allocations).toHaveLength(0);
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.2 — No obligations (pure credit)
  // -------------------------------------------------------------------------
  describe("no obligations — pure credit", () => {
    it("holds entire deposit as credit when no obligations exist", () => {
      const result = executeCreditWaterfall("500.00", [], [], null);
      expect(result.allocations).toHaveLength(0);
      expect(result.remainingCredit.toFixed(2)).toBe("500.00");
      expect(result.totalConsumed.toFixed(2)).toBe("0.00");
    });

    it("handles massive carry-over credit with no obligations", () => {
      const result = executeCreditWaterfall("100000.00", [], [], null);
      expect(result.remainingCredit.toFixed(2)).toBe("100000.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.3 — Penalties only
  // -------------------------------------------------------------------------
  describe("penalties only", () => {
    it("clears a single penalty exactly", () => {
      const result = executeCreditWaterfall(
        "37.50",
        [makePenalty("pen-1", "37.50")],
        [],
        null
      );
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].referenceId).toBe("pen-1");
      expect(result.allocations[0].step).toBe("PENALTY");
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("37.50");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("0.00");
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("37.50");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("partially clears a penalty when funds are insufficient", () => {
      const result = executeCreditWaterfall(
        "20.00",
        [makePenalty("pen-1", "37.50")],
        [],
        null
      );
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("20.00");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("17.50");
      expect(result.allocations[0].fullyCleared).toBe(false);
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("clears multiple penalties in order", () => {
      const result = executeCreditWaterfall(
        "100.00",
        [
          makePenalty("pen-1", "37.50"),
          makePenalty("pen-2", "18.75"),
          makePenalty("pen-3", "9.38"),
        ],
        [],
        null
      );
      // 37.50 + 18.75 + 9.38 = 65.63 consumed, 34.37 credit
      expect(result.allocations).toHaveLength(3);
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.allocations[1].fullyCleared).toBe(true);
      expect(result.allocations[2].fullyCleared).toBe(true);
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("65.63");
      expect(result.remainingCredit.toFixed(2)).toBe("34.37");
    });

    it("partially clears the second penalty when funds run out mid-list", () => {
      const result = executeCreditWaterfall(
        "50.00",
        [
          makePenalty("pen-1", "37.50"),
          makePenalty("pen-2", "18.75"),
        ],
        [],
        null
      );
      expect(result.allocations).toHaveLength(2);
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("37.50");
      expect(result.allocations[1].fullyCleared).toBe(false);
      expect(result.allocations[1].amountApplied.toFixed(2)).toBe("12.50");
      expect(result.allocations[1].remainingOwed.toFixed(2)).toBe("6.25");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.4 — Arrears only
  // -------------------------------------------------------------------------
  describe("arrears only", () => {
    it("clears a single arrear exactly", () => {
      const result = executeCreditWaterfall(
        "250.00",
        [],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        null
      );
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].step).toBe("ARREARS");
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("clears multiple arrears oldest first", () => {
      const result = executeCreditWaterfall(
        "1000.00",
        [],
        [
          makeArrears("arr-jan", "250.00", "2026-01-01"),
          makeArrears("arr-feb", "250.00", "2026-02-01"),
          makeArrears("arr-mar", "250.00", "2026-03-01"),
        ],
        null
      );
      expect(result.allocations).toHaveLength(3);
      expect(result.allocations[0].referenceId).toBe("arr-jan");
      expect(result.allocations[1].referenceId).toBe("arr-feb");
      expect(result.allocations[2].referenceId).toBe("arr-mar");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("750.00");
      expect(result.remainingCredit.toFixed(2)).toBe("250.00");
    });

    it("partially clears an arrear when funds run out", () => {
      const result = executeCreditWaterfall(
        "100.00",
        [],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        null
      );
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("100.00");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("150.00");
      expect(result.allocations[0].fullyCleared).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 6.5 — Current installment only
  // -------------------------------------------------------------------------
  describe("current installment only", () => {
    it("clears current installment exactly", () => {
      const result = executeCreditWaterfall(
        "250.00",
        [],
        [],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].step).toBe("CURRENT_INSTALLMENT");
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("partially clears current installment", () => {
      const result = executeCreditWaterfall(
        "100.00",
        [],
        [],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("100.00");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("150.00");
      expect(result.allocations[0].fullyCleared).toBe(false);
    });

    it("overpays current installment — remainder becomes credit", () => {
      const result = executeCreditWaterfall(
        "500.00",
        [],
        [],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("250.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.6 — Full waterfall cascade: Penalties → Arrears → Current → Credit
  // -------------------------------------------------------------------------
  describe("full waterfall cascade", () => {
    it("PRD example: R500 deposit against penalty + arrears + current", () => {
      // Member deposits R500 with:
      // - R37.50 outstanding penalty (Gold tier missed installment)
      // - R250.00 missed installment (Jan arrears)
      // - R250.00 current month installment (Feb)
      // Expected: 37.50 → penalty, 250.00 → arrears, 212.50 → current (partial)
      const result = executeCreditWaterfall(
        "500.00",
        [makePenalty("pen-gold", "37.50")],
        [makeArrears("arr-jan", "250.00", "2026-01-01")],
        makeCurrent("cur-feb", "250.00")
      );

      expect(result.allocations).toHaveLength(3);

      // Step 1: Penalty cleared
      expect(result.allocations[0].step).toBe("PENALTY");
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("37.50");
      expect(result.allocations[0].fullyCleared).toBe(true);

      // Step 2: Arrears cleared
      expect(result.allocations[1].step).toBe("ARREARS");
      expect(result.allocations[1].amountApplied.toFixed(2)).toBe("250.00");
      expect(result.allocations[1].fullyCleared).toBe(true);

      // Step 3: Current partially paid (500 - 37.50 - 250.00 = 212.50)
      expect(result.allocations[2].step).toBe("CURRENT_INSTALLMENT");
      expect(result.allocations[2].amountApplied.toFixed(2)).toBe("212.50");
      expect(result.allocations[2].remainingOwed.toFixed(2)).toBe("37.50");
      expect(result.allocations[2].fullyCleared).toBe(false);

      // Summary
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("37.50");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("250.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("212.50");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
      expect(result.totalConsumed.toFixed(2)).toBe("500.00");
    });

    it("generous deposit clears everything with credit remaining", () => {
      const result = executeCreditWaterfall(
        "1000.00",
        [makePenalty("pen-1", "37.50")],
        [
          makeArrears("arr-jan", "250.00", "2026-01-01"),
          makeArrears("arr-feb", "250.00", "2026-02-01"),
        ],
        makeCurrent("cur-mar", "250.00")
      );

      // Total obligations: 37.50 + 250.00 + 250.00 + 250.00 = 787.50
      // Credit: 1000.00 - 787.50 = 212.50
      expect(result.allocations).toHaveLength(4);
      expect(result.allocations.every((a) => a.fullyCleared)).toBe(true);
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("37.50");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("500.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("212.50");
      expect(result.totalConsumed.toFixed(2)).toBe("787.50");
    });

    it("funds exhausted at penalty stage — nothing cascades further", () => {
      const result = executeCreditWaterfall(
        "30.00",
        [makePenalty("pen-1", "37.50"), makePenalty("pen-2", "18.75")],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        makeCurrent("cur-1", "250.00")
      );

      // Only partially clears first penalty
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].step).toBe("PENALTY");
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("30.00");
      expect(result.allocations[0].fullyCleared).toBe(false);
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("0.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("0.00");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("funds exhausted at arrears stage — current not touched", () => {
      const result = executeCreditWaterfall(
        "300.00",
        [makePenalty("pen-1", "37.50")],
        [makeArrears("arr-jan", "250.00", "2026-01-01")],
        makeCurrent("cur-feb", "250.00")
      );

      // Penalty: 37.50 ✓, Arrears: 250.00 ✓, remaining: 12.50 → current partial
      expect(result.allocations).toHaveLength(3);
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("37.50");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("250.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("12.50");
      expect(result.allocations[2].remainingOwed.toFixed(2)).toBe("237.50");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.7 — PRD carry-over credit scenario: R1,205.51
  // -------------------------------------------------------------------------
  describe("PRD carry-over credit scenario", () => {
    it("R1,205.51 carry-over covers 4 full Gold installments + partial 5th", () => {
      // PRD 4.2: "Carry Over Credit from a previous year (e.g., R1,205.51)"
      // Using waterfall to process carry-over against monthly installments
      const result = executeCreditWaterfall(
        "1205.51",
        [],
        [
          makeArrears("jan", "250.00", "2026-01-01"),
          makeArrears("feb", "250.00", "2026-02-01"),
          makeArrears("mar", "250.00", "2026-03-01"),
          makeArrears("apr", "250.00", "2026-04-01"),
        ],
        makeCurrent("may", "250.00")
      );

      // 4 × 250 = 1000 arrears, 250 current = 1250 total needed
      // 1205.51 - 1000.00 = 205.51 for current
      expect(result.allocations).toHaveLength(5);

      // All 4 arrears fully cleared
      for (let i = 0; i < 4; i++) {
        expect(result.allocations[i].step).toBe("ARREARS");
        expect(result.allocations[i].fullyCleared).toBe(true);
        expect(result.allocations[i].amountApplied.toFixed(2)).toBe("250.00");
      }

      // Current partially paid: 1205.51 - 1000.00 = 205.51
      expect(result.allocations[4].step).toBe("CURRENT_INSTALLMENT");
      expect(result.allocations[4].amountApplied.toFixed(2)).toBe("205.51");
      expect(result.allocations[4].remainingOwed.toFixed(2)).toBe("44.49");
      expect(result.allocations[4].fullyCleared).toBe(false);

      expect(result.totalAppliedToArrears.toFixed(2)).toBe("1000.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("205.51");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("R1,205.51 with penalties deducted first", () => {
      // Carry-over but member also has a penalty from last year
      const result = executeCreditWaterfall(
        "1205.51",
        [makePenalty("pen-late", "37.50")],
        [
          makeArrears("jan", "250.00", "2026-01-01"),
          makeArrears("feb", "250.00", "2026-02-01"),
          makeArrears("mar", "250.00", "2026-03-01"),
        ],
        makeCurrent("apr", "250.00")
      );

      // Available after penalty: 1205.51 - 37.50 = 1168.01
      // 3 arrears = 750.00, remaining: 1168.01 - 750.00 = 418.01
      // Current: min(418.01, 250.00) = 250.00, credit: 168.01
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("37.50");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("750.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("168.01");
    });
  });

  // -------------------------------------------------------------------------
  // 6.8 — Fractional payments and banker's rounding edge cases
  // -------------------------------------------------------------------------
  describe("fractional and rounding edge cases", () => {
    it("handles R0.01 deposit against large obligations", () => {
      const result = executeCreditWaterfall(
        "0.01",
        [makePenalty("pen-1", "37.50")],
        [],
        null
      );
      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("0.01");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("37.49");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("handles fractional penalty amount: R9.38 (Entry tier)", () => {
      // Entry tier penalty: 62.50 × 0.15 = 9.375 → banker's rounds to 9.38
      const result = executeCreditWaterfall(
        "9.38",
        [makePenalty("pen-entry", "9.38")],
        [],
        null
      );
      expect(result.allocations[0].fullyCleared).toBe(true);
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("handles deposit of R0.005 (rounds to R0.01)", () => {
      const result = executeCreditWaterfall(
        "0.005",
        [],
        [],
        null
      );
      // 0.005 rounds to 0.00 with banker's rounding (even)
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });

    it("handles high-precision amounts consistently", () => {
      // 333.33 × 3 = 999.99, deposit 1000.00 → 0.01 credit
      const result = executeCreditWaterfall(
        "1000.00",
        [],
        [
          makeArrears("a1", "333.33", "2026-01-01"),
          makeArrears("a2", "333.33", "2026-02-01"),
          makeArrears("a3", "333.33", "2026-03-01"),
        ],
        null
      );
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("999.99");
      expect(result.remainingCredit.toFixed(2)).toBe("0.01");
    });
  });

  // -------------------------------------------------------------------------
  // 6.9 — Complex multi-penalty, multi-arrears scenarios
  // -------------------------------------------------------------------------
  describe("complex multi-obligation scenarios", () => {
    it("5 penalties + 3 arrears + current: everything clears with credit", () => {
      const result = executeCreditWaterfall(
        "5000.00",
        [
          makePenalty("pen-1", "37.50"),
          makePenalty("pen-2", "18.75"),
          makePenalty("pen-3", "9.38"),
          makePenalty("pen-4", "150.00"),
          makePenalty("pen-5", "375.00"),
        ],
        [
          makeArrears("arr-1", "1000.00", "2026-01-01"),
          makeArrears("arr-2", "1000.00", "2026-02-01"),
          makeArrears("arr-3", "1000.00", "2026-03-01"),
        ],
        makeCurrent("cur-1", "250.00")
      );

      // Penalties: 37.50 + 18.75 + 9.38 + 150.00 + 375.00 = 590.63
      // Arrears: 3000.00
      // Current: 250.00
      // Total: 3840.63
      // Credit: 5000.00 - 3840.63 = 1159.37
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("590.63");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("3000.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("250.00");
      expect(result.remainingCredit.toFixed(2)).toBe("1159.37");
      expect(result.allocations).toHaveLength(9); // 5 + 3 + 1
    });

    it("Diamond member: massive carry-over settles entire year", () => {
      // Diamond: R2,500/month × 12 = R30,000 + penalties
      const monthlyArrears = Array.from({ length: 11 }, (_, i) => {
        const month = String(i + 1).padStart(2, "0");
        return makeArrears(`arr-${month}`, "2500.00", `2026-${month}-01`);
      });

      const result = executeCreditWaterfall(
        "35000.00",
        [makePenalty("pen-1", "375.00")],
        monthlyArrears,
        makeCurrent("cur-dec", "2500.00")
      );

      // Penalty: 375.00
      // Arrears: 11 × 2500 = 27500.00
      // Current: 2500.00
      // Total: 30375.00
      // Credit: 35000 - 30375 = 4625.00
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("375.00");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("27500.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("2500.00");
      expect(result.remainingCredit.toFixed(2)).toBe("4625.00");
      expect(result.allocations).toHaveLength(13); // 1 + 11 + 1
    });

    it("Group 3 member: single massive penalty eats all funds", () => {
      const result = executeCreditWaterfall(
        "500.00",
        [makePenalty("pen-g3", "750.00")], // Group 3 penalty: 5000 × 15%
        [makeArrears("arr-1", "5000.00", "2026-01-01")],
        makeCurrent("cur-1", "5000.00")
      );

      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].step).toBe("PENALTY");
      expect(result.allocations[0].amountApplied.toFixed(2)).toBe("500.00");
      expect(result.allocations[0].remainingOwed.toFixed(2)).toBe("250.00");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("0.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("0.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.10 — Integrity verification
  // -------------------------------------------------------------------------
  describe("integrity verification", () => {
    it("deposit = consumed + credit for every scenario", () => {
      // Run a battery of random-ish scenarios and verify invariant
      const scenarios: Array<{
        deposit: string;
        penalties: OutstandingPenalty[];
        arrears: ArrearsInstallment[];
        current: CurrentInstallment | null;
      }> = [
        {
          deposit: "1.00",
          penalties: [makePenalty("p1", "0.50")],
          arrears: [makeArrears("a1", "0.30", "2026-01-01")],
          current: makeCurrent("c1", "0.25"),
        },
        {
          deposit: "99999.99",
          penalties: [],
          arrears: [],
          current: makeCurrent("c1", "100000.00"),
        },
        {
          deposit: "0.01",
          penalties: [makePenalty("p1", "0.01")],
          arrears: [],
          current: null,
        },
        {
          deposit: "787.50",
          penalties: [makePenalty("p1", "37.50")],
          arrears: [
            makeArrears("a1", "250.00", "2026-01-01"),
            makeArrears("a2", "250.00", "2026-02-01"),
          ],
          current: makeCurrent("c1", "250.00"),
        },
      ];

      for (const scenario of scenarios) {
        const result = executeCreditWaterfall(
          scenario.deposit,
          scenario.penalties,
          scenario.arrears,
          scenario.current
        );

        const sum = result.totalConsumed.plus(result.remainingCredit);
        expect(sum.toFixed(2)).toBe(result.depositAmount.toFixed(2));
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6.11 — Input validation errors
  // -------------------------------------------------------------------------
  describe("input validation", () => {
    it("throws BusinessRuleError for negative deposit", () => {
      expect(() =>
        executeCreditWaterfall("-100.00", [], [], null)
      ).toThrow(BusinessRuleError);
      expect(() =>
        executeCreditWaterfall("-100.00", [], [], null)
      ).toThrow("non-negative");
    });

    it("throws BusinessRuleError for unsorted arrears", () => {
      expect(() =>
        executeCreditWaterfall(
          "1000.00",
          [],
          [
            makeArrears("arr-feb", "250.00", "2026-02-01"),
            makeArrears("arr-jan", "250.00", "2026-01-01"), // Wrong order!
          ],
          null
        )
      ).toThrow(BusinessRuleError);
      expect(() =>
        executeCreditWaterfall(
          "1000.00",
          [],
          [
            makeArrears("arr-feb", "250.00", "2026-02-01"),
            makeArrears("arr-jan", "250.00", "2026-01-01"),
          ],
          null
        )
      ).toThrow("sorted by dueDate ascending");
    });

    it("throws BusinessRuleError for zero penalty amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [makePenalty("pen-1", "0")],
          [],
          null
        )
      ).toThrow(BusinessRuleError);
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [makePenalty("pen-1", "0")],
          [],
          null
        )
      ).toThrow("must be positive");
    });

    it("throws BusinessRuleError for negative penalty amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [makePenalty("pen-1", "-5.00")],
          [],
          null
        )
      ).toThrow(BusinessRuleError);
    });

    it("throws BusinessRuleError for zero arrears amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [],
          [makeArrears("arr-1", "0", "2026-01-01")],
          null
        )
      ).toThrow(BusinessRuleError);
    });

    it("throws BusinessRuleError for negative arrears amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [],
          [makeArrears("arr-1", "-250.00", "2026-01-01")],
          null
        )
      ).toThrow(BusinessRuleError);
    });

    it("throws BusinessRuleError for zero current installment amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [],
          [],
          makeCurrent("cur-1", "0")
        )
      ).toThrow(BusinessRuleError);
    });

    it("throws BusinessRuleError for negative current installment amount", () => {
      expect(() =>
        executeCreditWaterfall(
          "100.00",
          [],
          [],
          makeCurrent("cur-1", "-250.00")
        )
      ).toThrow(BusinessRuleError);
    });

    it("accepts same-date arrears without throwing", () => {
      // Same date is allowed (e.g., multiple tokens due same day)
      const result = executeCreditWaterfall(
        "500.00",
        [],
        [
          makeArrears("arr-a", "125.00", "2026-01-01"),
          makeArrears("arr-b", "250.00", "2026-01-01"),
        ],
        null
      );
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("375.00");
      expect(result.remainingCredit.toFixed(2)).toBe("125.00");
    });
  });

  // -------------------------------------------------------------------------
  // 6.12 — Exact-amount boundary scenarios
  // -------------------------------------------------------------------------
  describe("exact-amount boundaries", () => {
    it("deposit exactly equals total of all obligations — zero credit", () => {
      const result = executeCreditWaterfall(
        "537.50",
        [makePenalty("pen-1", "37.50")],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.totalConsumed.toFixed(2)).toBe("537.50");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
      expect(result.allocations.every((a) => a.fullyCleared)).toBe(true);
    });

    it("deposit exactly covers penalties only, nothing for arrears", () => {
      const result = executeCreditWaterfall(
        "56.25",
        [makePenalty("pen-1", "37.50"), makePenalty("pen-2", "18.75")],
        [makeArrears("arr-1", "250.00", "2026-01-01")],
        makeCurrent("cur-1", "250.00")
      );
      expect(result.totalAppliedToPenalties.toFixed(2)).toBe("56.25");
      expect(result.totalAppliedToArrears.toFixed(2)).toBe("0.00");
      expect(result.totalAppliedToCurrent.toFixed(2)).toBe("0.00");
      expect(result.remainingCredit.toFixed(2)).toBe("0.00");
    });
  });
});

// =============================================================================
// 7. BATCH PENALTIES
// =============================================================================

describe("calculateBatchPenalties", () => {
  it("calculates penalties for a batch of missed installments", () => {
    const results = calculateBatchPenalties([
      {
        membershipNo: "BWG2020M00001",
        tokenSerial: "VCC2026GT00001",
        tier: "GOLD",
      },
      {
        membershipNo: "BWG2020M00002",
        tokenSerial: "VCC2026EN00001",
        tier: "ENTRY",
      },
      {
        membershipNo: "BWG2020M00003",
        tokenSerial: "VCC2026DM00001",
        tier: "DIAMOND",
      },
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].penaltyAmount.toFixed(2)).toBe("37.50");
    expect(results[0].membershipNo).toBe("BWG2020M00001");
    expect(results[1].penaltyAmount.toFixed(2)).toBe("9.38");
    expect(results[2].penaltyAmount.toFixed(2)).toBe("375.00");
  });

  it("handles custom amounts in batch", () => {
    const results = calculateBatchPenalties([
      {
        membershipNo: "BWG2020M00001",
        tokenSerial: "VCC2026GT00001",
        tier: "GOLD",
        customAmount: "500.00",
      },
    ]);

    expect(results[0].penaltyAmount.toFixed(2)).toBe("75.00");
    expect(results[0].installmentAmount.toFixed(2)).toBe("500.00");
  });

  it("returns empty array for empty input", () => {
    const results = calculateBatchPenalties([]);
    expect(results).toHaveLength(0);
  });
});

// =============================================================================
// 8. ACCOUNT VALUATION
// =============================================================================

describe("calculateTotalAccountValue", () => {
  it("calculates total value from multiple token holdings", () => {
    const total = calculateTotalAccountValue(
      [
        {
          tokenSerial: "VCC2026GT00001",
          tier: "GOLD",
          currentCashoutValue: "26773.90",
        },
        {
          tokenSerial: "VCC2026EN00001",
          tier: "ENTRY",
          currentCashoutValue: "6510.01",
        },
      ],
      "0.00"
    );
    // 26773.90 + 6510.01 = 33283.91
    expect(total.toFixed(2)).toBe("33283.91");
  });

  it("matches PRD example: R33,283.91", () => {
    // PRD 5.1: "Total Account Value (e.g., R33,283.91)"
    const total = calculateTotalAccountValue(
      [
        {
          tokenSerial: "VCC2026GT00001",
          tier: "GOLD",
          currentCashoutValue: "33283.91",
        },
      ],
      "0.00"
    );
    expect(total.toFixed(2)).toBe("33283.91");
  });

  it("includes credit balance in total value", () => {
    const total = calculateTotalAccountValue(
      [
        {
          tokenSerial: "VCC2026GT00001",
          tier: "GOLD",
          currentCashoutValue: "26773.90",
        },
      ],
      "1205.51"
    );
    expect(total.toFixed(2)).toBe("27979.41");
  });

  it("returns zero for empty holdings with zero credit", () => {
    const total = calculateTotalAccountValue([], "0.00");
    expect(total.toFixed(2)).toBe("0.00");
  });

  it("returns just credit when no tokens held", () => {
    const total = calculateTotalAccountValue([], "1205.51");
    expect(total.toFixed(2)).toBe("1205.51");
  });

  it("throws FinancialIntegrityError for negative cashout value", () => {
    expect(() =>
      calculateTotalAccountValue(
        [
          {
            tokenSerial: "VCC2026GT00001",
            tier: "GOLD",
            currentCashoutValue: "-100.00",
          },
        ],
        "0.00"
      )
    ).toThrow(FinancialIntegrityError);
    expect(() =>
      calculateTotalAccountValue(
        [
          {
            tokenSerial: "VCC2026GT00001",
            tier: "GOLD",
            currentCashoutValue: "-100.00",
          },
        ],
        "0.00"
      )
    ).toThrow("Negative cashout value");
  });

  it("handles many tokens accurately without float drift", () => {
    // 100 tokens each worth R333.33 = R33,333.00 (not R33,332.99999...)
    const holdings = Array.from({ length: 100 }, (_, i) => ({
      tokenSerial: `VCC2026EN${String(i + 1).padStart(5, "0")}`,
      tier: "ENTRY" as TokenTier,
      currentCashoutValue: "333.33",
    }));

    const total = calculateTotalAccountValue(holdings, "0.00");
    expect(total.toFixed(2)).toBe("33333.00");
  });
});
