// =============================================================================
// VCC — Zod Validator Tests
// =============================================================================
// Validates all input schemas reject malformed data and accept valid input.
// =============================================================================

import { describe, it, expect } from "vitest";
import {
  MembershipNoSchema,
  TokenSerialSchema,
  DecimalStringSchema,
  PositiveDecimalStringSchema,
  CreateUserSchema,
  CreateMemberTokenSchema,
  CreateLedgerEntrySchema,
  LoginSchema,
  TokenTierSchema,
  RoleTypeSchema,
  TxTypeSchema,
  CreateTokenPricingSchema,
} from "./validators";

describe("MembershipNoSchema", () => {
  it("accepts valid membership numbers", () => {
    expect(MembershipNoSchema.safeParse("BWG2020M00001").success).toBe(true);
    expect(MembershipNoSchema.safeParse("VCC2026M00100").success).toBe(true);
    expect(MembershipNoSchema.safeParse("AB2020M00001").success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(MembershipNoSchema.safeParse("").success).toBe(false);
    expect(MembershipNoSchema.safeParse("12345").success).toBe(false);
    expect(MembershipNoSchema.safeParse("bwg2020m00001").success).toBe(false); // lowercase
    expect(MembershipNoSchema.safeParse("BWG2020X00001").success).toBe(false); // wrong separator
  });
});

describe("TokenSerialSchema", () => {
  it("accepts valid token serials", () => {
    expect(TokenSerialSchema.safeParse("VCC2026GT00004").success).toBe(true);
    expect(TokenSerialSchema.safeParse("VCC2026EN00001").success).toBe(true);
    expect(TokenSerialSchema.safeParse("VCC2026DM00100").success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(TokenSerialSchema.safeParse("").success).toBe(false);
    expect(TokenSerialSchema.safeParse("XYZ2026GT00004").success).toBe(false);
    expect(TokenSerialSchema.safeParse("VCC2026gt00004").success).toBe(false); // lowercase tier
  });
});

describe("DecimalStringSchema", () => {
  it("accepts valid decimal strings", () => {
    expect(DecimalStringSchema.safeParse("100.00").success).toBe(true);
    expect(DecimalStringSchema.safeParse("0").success).toBe(true);
    expect(DecimalStringSchema.safeParse("-37.50").success).toBe(true);
    expect(DecimalStringSchema.safeParse("26773.90760").success).toBe(true);
  });

  it("rejects non-decimal strings", () => {
    expect(DecimalStringSchema.safeParse("abc").success).toBe(false);
    expect(DecimalStringSchema.safeParse("12.34.56").success).toBe(false);
    expect(DecimalStringSchema.safeParse("").success).toBe(false);
  });
});

describe("PositiveDecimalStringSchema", () => {
  it("accepts positive decimal strings", () => {
    expect(PositiveDecimalStringSchema.safeParse("100.00").success).toBe(true);
    expect(PositiveDecimalStringSchema.safeParse("0.01").success).toBe(true);
  });

  it("rejects zero and negative values", () => {
    expect(PositiveDecimalStringSchema.safeParse("0").success).toBe(false);
    expect(PositiveDecimalStringSchema.safeParse("-10.00").success).toBe(false);
  });
});

describe("Enum schemas", () => {
  it("TokenTierSchema accepts all 8 tiers", () => {
    const tiers = ["ENTRY", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "GROUP_1", "GROUP_2", "GROUP_3"];
    for (const tier of tiers) {
      expect(TokenTierSchema.safeParse(tier).success).toBe(true);
    }
  });

  it("TokenTierSchema rejects invalid tiers", () => {
    expect(TokenTierSchema.safeParse("BRONZE").success).toBe(false);
    expect(TokenTierSchema.safeParse("").success).toBe(false);
  });

  it("RoleTypeSchema accepts all roles", () => {
    const roles = [
      "MEMBER", "ADMIN_CRYPTO", "ADMIN_STOCKS",
      "ADMIN_COMMODITIES", "ADMIN_FOREX", "ADMIN_HEDGE", "SUPER_ADMIN",
    ];
    for (const role of roles) {
      expect(RoleTypeSchema.safeParse(role).success).toBe(true);
    }
  });

  it("TxTypeSchema accepts all transaction types", () => {
    const types = ["PAYMENT", "PENALTY", "CREDIT_APPLIED", "ANNUAL_FEE", "ADMIN_FEE", "PROFIT_FEE"];
    for (const type of types) {
      expect(TxTypeSchema.safeParse(type).success).toBe(true);
    }
  });
});

describe("CreateUserSchema", () => {
  const validUser = {
    membershipNo: "BWG2020M00001",
    firstName: "Elias",
    lastName: "Nkabinde",
    joinDate: "2020-03-01",
  };

  it("accepts a valid user creation payload", () => {
    const result = CreateUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("defaults role to MEMBER", () => {
    const result = CreateUserSchema.parse(validUser);
    expect(result.role).toBe("MEMBER");
  });

  it("rejects missing required fields", () => {
    expect(CreateUserSchema.safeParse({}).success).toBe(false);
    expect(CreateUserSchema.safeParse({ membershipNo: "BWG2020M00001" }).success).toBe(false);
  });

  it("accepts optional email and allocatedShares", () => {
    const result = CreateUserSchema.safeParse({
      ...validUser,
      email: "elias@vcc.co.za",
      allocatedShares: "100.0000",
    });
    expect(result.success).toBe(true);
  });
});

describe("CreateMemberTokenSchema", () => {
  it("accepts a valid token creation payload", () => {
    const result = CreateMemberTokenSchema.safeParse({
      tokenSerial: "VCC2026GT00004",
      membershipNo: "BWG2020M00001",
      tier: "GOLD",
      issueYear: 2026,
    });
    expect(result.success).toBe(true);
  });

  it("rejects issueYear before 2020", () => {
    const result = CreateMemberTokenSchema.safeParse({
      tokenSerial: "VCC2019GT00001",
      membershipNo: "BWG2020M00001",
      tier: "GOLD",
      issueYear: 2019,
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateLedgerEntrySchema", () => {
  it("accepts a valid ledger entry", () => {
    const result = CreateLedgerEntrySchema.safeParse({
      membershipNo: "BWG2020M00001",
      tokenSerial: "VCC2026GT00004",
      type: "PAYMENT",
      amount: "250.00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts negative amounts (debits)", () => {
    const result = CreateLedgerEntrySchema.safeParse({
      membershipNo: "BWG2020M00001",
      type: "PENALTY",
      amount: "-37.50",
      referenceNote: "Missed March 2026 Gold installment",
    });
    expect(result.success).toBe(true);
  });
});

describe("CreateTokenPricingSchema", () => {
  it("accepts a valid pricing entry", () => {
    const result = CreateTokenPricingSchema.safeParse({
      dateEffective: "2026-01-06",
      tier: "GOLD",
      monthlySub: "250.00",
      adminFeePct: "0.0885",
      profitFeePct: "0.0875",
      cashoutValue: "26773.90760",
      buyInPrice: "27500.00000",
    });
    expect(result.success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = LoginSchema.safeParse({
      membershipNo: "BWG2020M00001",
      password: "SecureP@ss123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = LoginSchema.safeParse({
      membershipNo: "BWG2020M00001",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty membership number", () => {
    const result = LoginSchema.safeParse({
      membershipNo: "",
      password: "SecureP@ss123",
    });
    expect(result.success).toBe(false);
  });
});
