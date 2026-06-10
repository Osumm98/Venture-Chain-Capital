// =============================================================================
// VCC — Zod Validation Schemas
// =============================================================================
// Production-grade input validation for all API boundaries.
// Mirrors the Prisma schema enums and model shapes exactly.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum Schemas — Strict string unions matching Prisma enums
// ---------------------------------------------------------------------------

export const RoleTypeSchema = z.enum([
  "MEMBER",
  "ADMIN_CRYPTO",
  "ADMIN_STOCKS",
  "ADMIN_COMMODITIES",
  "ADMIN_FOREX",
  "ADMIN_HEDGE",
  "SUPER_ADMIN",
]);

export const TokenTierSchema = z.enum([
  "ENTRY",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "GROUP_1",
  "GROUP_2",
  "GROUP_3",
]);

export const TxTypeSchema = z.enum([
  "PAYMENT",
  "PENALTY",
  "CREDIT_APPLIED",
  "ANNUAL_FEE",
  "ADMIN_FEE",
  "PROFIT_FEE",
]);

export const UserStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]);
export const TokenStatusSchema = z.enum(["ACTIVE", "REDEEMED", "CANCELLED"]);
export const InstallmentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "MISSED",
  "PENALTY_APPLIED",
  "UPGRADED",
]);
export const PayoutDecisionSchema = z.enum(["WITHDRAW", "CARRY_OVER"]);

// ---------------------------------------------------------------------------
// Shared field validators
// ---------------------------------------------------------------------------

/** VCC membership number format: BWG2020M00001 */
const membershipNoRegex = /^[A-Z]{2,5}\d{4}M\d{5}$/;

export const MembershipNoSchema = z
  .string()
  .min(1, "Membership number is required")
  .max(20, "Membership number too long")
  .regex(membershipNoRegex, "Invalid membership number format (e.g., BWG2020M00001)");

/** VCC token serial format: VCC2026GT00004 */
const tokenSerialRegex = /^VCC\d{4}[A-Z]{1,3}\d{5}$/;

export const TokenSerialSchema = z
  .string()
  .min(1, "Token serial is required")
  .max(50, "Token serial too long")
  .regex(tokenSerialRegex, "Invalid token serial format (e.g., VCC2026GT00004)");

/**
 * Decimal string validator — ensures the value is a valid decimal number string.
 * Used for all financial fields that cross API boundaries as strings
 * (to prevent floating-point corruption in JSON transport).
 */
export const DecimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a valid decimal number string");

export const PositiveDecimalStringSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Must be a positive decimal number string")
  .refine((val) => parseFloat(val) > 0, "Must be greater than zero");

// ---------------------------------------------------------------------------
// User Schemas
// ---------------------------------------------------------------------------

export const CreateUserSchema = z.object({
  membershipNo: MembershipNoSchema,
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255).optional(),
  role: RoleTypeSchema.optional().default("MEMBER"),
  joinDate: z.coerce.date(),
  allocatedShares: DecimalStringSchema.optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional().nullable(),
  role: RoleTypeSchema.optional(),
  allocatedShares: DecimalStringSchema.optional().nullable(),
  status: UserStatusSchema.optional(),
});

// ---------------------------------------------------------------------------
// Token Pricing History Schemas
// ---------------------------------------------------------------------------

export const CreateTokenPricingSchema = z.object({
  dateEffective: z.coerce.date(),
  tier: TokenTierSchema,
  monthlySub: PositiveDecimalStringSchema,
  adminFeePct: DecimalStringSchema,
  profitFeePct: DecimalStringSchema,
  cashoutValue: PositiveDecimalStringSchema,
  buyInPrice: PositiveDecimalStringSchema,
});

// ---------------------------------------------------------------------------
// Member Token Schemas
// ---------------------------------------------------------------------------

export const CreateMemberTokenSchema = z.object({
  tokenSerial: TokenSerialSchema,
  membershipNo: MembershipNoSchema,
  tier: TokenTierSchema,
  issueYear: z.number().int().min(2020).max(2100),
  isCarryOver: z.boolean().optional().default(false),
});

// ---------------------------------------------------------------------------
// Ledger Entry Schemas
// ---------------------------------------------------------------------------

export const CreateLedgerEntrySchema = z.object({
  membershipNo: MembershipNoSchema,
  tokenSerial: TokenSerialSchema.optional().nullable(),
  type: TxTypeSchema,
  amount: DecimalStringSchema,
  referenceNote: z.string().max(1000).optional().nullable(),
  balanceSnapshot: DecimalStringSchema.optional().nullable(),
});

// ---------------------------------------------------------------------------
// Portfolio Schemas
// ---------------------------------------------------------------------------

export const AssetClassSchema = z.enum([
  "CRYPTO",
  "STOCKS",
  "COMMODITIES",
  "FOREX",
  "HEDGE",
]);

export const CreatePortfolioSchema = z.object({
  assetClass: AssetClassSchema,
  headAdminId: z.string().uuid().optional().nullable(),
  totalAllocatedCapital: DecimalStringSchema.optional(),
  currentMarketValue: DecimalStringSchema.optional(),
});

export const CreatePortfolioHoldingSchema = z.object({
  portfolioId: z.string().uuid(),
  ticker: z.string().min(1).max(20),
  assetName: z.string().min(1).max(255),
  quantity: PositiveDecimalStringSchema,
  avgBuyPrice: PositiveDecimalStringSchema,
  currentPrice: DecimalStringSchema.optional().nullable(),
});

// ---------------------------------------------------------------------------
// Weekly Performance Log Schemas
// ---------------------------------------------------------------------------

export const CreateWeeklyPerformanceSchema = z.object({
  portfolioId: z.string().uuid(),
  weekStartDate: z.coerce.date(),
  weekEndDate: z.coerce.date(),
  yieldPercentage: DecimalStringSchema,
  absoluteReturn: DecimalStringSchema,
  submittedBy: z.string().uuid(),
  notes: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Installment Schedule Schemas
// ---------------------------------------------------------------------------

export const CreateInstallmentSchema = z.object({
  tokenSerial: TokenSerialSchema,
  dueDate: z.coerce.date(),
  amountDue: PositiveDecimalStringSchema,
});

export const UpdateInstallmentSchema = z.object({
  amountPaid: DecimalStringSchema.optional(),
  status: InstallmentStatusSchema.optional(),
  penaltyAmount: DecimalStringSchema.optional().nullable(),
  ledgerTxId: z.string().uuid().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Payout Record Schemas
// ---------------------------------------------------------------------------

export const CreatePayoutRecordSchema = z.object({
  membershipNo: MembershipNoSchema,
  payoutYear: z.number().int().min(2020).max(2100),
  decision: PayoutDecisionSchema,
  grossAmount: PositiveDecimalStringSchema,
  feesDeducted: DecimalStringSchema,
  netAmount: DecimalStringSchema,
  processedBy: z.string().uuid().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Login / Auth Schemas
// ---------------------------------------------------------------------------

export const LoginSchema = z.object({
  membershipNo: MembershipNoSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

// ---------------------------------------------------------------------------
// Type exports — inferred from Zod schemas for type-safe usage
// ---------------------------------------------------------------------------

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateTokenPricingInput = z.infer<typeof CreateTokenPricingSchema>;
export type CreateMemberTokenInput = z.infer<typeof CreateMemberTokenSchema>;
export type CreateLedgerEntryInput = z.infer<typeof CreateLedgerEntrySchema>;
export type CreatePortfolioInput = z.infer<typeof CreatePortfolioSchema>;
export type CreatePortfolioHoldingInput = z.infer<typeof CreatePortfolioHoldingSchema>;
export type CreateWeeklyPerformanceInput = z.infer<typeof CreateWeeklyPerformanceSchema>;
export type CreateInstallmentInput = z.infer<typeof CreateInstallmentSchema>;
export type UpdateInstallmentInput = z.infer<typeof UpdateInstallmentSchema>;
export type CreatePayoutRecordInput = z.infer<typeof CreatePayoutRecordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
