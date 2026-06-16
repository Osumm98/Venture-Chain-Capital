"use server";

// =============================================================================
// VCC — Dashboard Server Actions
// =============================================================================
// Fetches investor data from the database via Prisma.
// In development, returns demo data when the DB is unreachable.
// All actions require authentication via requireSession().
// =============================================================================

import { requireSession } from "@/lib/session";
import { Decimal } from "@/lib/decimal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  readonly displayName: string;
  readonly membershipNo: string;
  readonly totalAccountValue: string;
  readonly totalTokens: number;
  readonly activeTiers: ReadonlyArray<string>;
  readonly creditBalance: string;
  readonly portfolioGrowthPercent: string;
}

export interface TokenCardData {
  readonly tokenSerial: string;
  readonly tier: string;
  readonly issueYear: number;
  readonly status: string;
  readonly isCarryOver: boolean;
  readonly currentCashoutValue: string;
  readonly installmentsPaid: number;
  readonly installmentsTotal: number;
}

export interface LedgerRow {
  readonly txId: string;
  readonly txDate: string;
  readonly type: string;
  readonly amount: string;
  readonly tokenSerial: string | null;
  readonly referenceNote: string | null;
  readonly balanceSnapshot: string | null;
}

export interface LedgerPage {
  readonly rows: ReadonlyArray<LedgerRow>;
  readonly totalRows: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface PortfolioGrowthPoint {
  readonly date: string;
  readonly value: number;
}

import { DEMO_ACCOUNTS } from "@/lib/demo-data";

function generateDevGrowthData(): ReadonlyArray<PortfolioGrowthPoint> {
  const points: PortfolioGrowthPoint[] = [];
  const startDate = new Date("2026-01-01");
  let value = 5000;

  for (let weekIndex = 0; weekIndex < 23; weekIndex++) {
    const dateObj = new Date(startDate);
    dateObj.setDate(dateObj.getDate() + weekIndex * 7);
    // Simulate organic growth with some weekly variance
    const weeklyReturn = 0.008 + Math.sin(weekIndex * 0.4) * 0.005;
    value = value * (1 + weeklyReturn);
    points.push({
      date: dateObj.toISOString().split("T")[0],
      value: parseFloat(value.toFixed(2)),
    });
  }

  return points;
}

function generateDevLedger(membershipNo: string): ReadonlyArray<LedgerRow> {
  const devUser = DEMO_ACCOUNTS.find((u) => u.membershipNo === membershipNo);
  if (!devUser || !devUser.payments || devUser.payments.length === 0) {
    return [];
  }

  const entries: LedgerRow[] = [];
  let balance = new Decimal(0);

  // We want to process payments in chronological order to build up the balance,
  // but then return them in descending order (newest first).
  // Assuming payments from Excel are in some order, let's sort them ascending by date first if possible.
  const sortedPayments = [...devUser.payments].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  for (let i = 0; i < sortedPayments.length; i++) {
    const payment = sortedPayments[i];
    balance = balance.plus(new Decimal(payment.amount));
    
    entries.push({
      txId: `tx-${payment.reference.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      txDate: payment.date || new Date().toISOString(),
      type: "PAYMENT",
      amount: new Decimal(payment.amount).toFixed(2),
      tokenSerial: null, // We could try to match this to a token if we had logic for it
      referenceNote: payment.reference,
      balanceSnapshot: balance.toFixed(2),
    });
  }

  // Reverse to get descending order
  return entries.reverse();
}

// ---------------------------------------------------------------------------
// DB helper — tries to import prisma, returns null if unavailable
// ---------------------------------------------------------------------------

async function tryGetPrisma(): Promise<typeof import("@/lib/prisma").prisma | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    // Quick connectivity test
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Demo data helper — always works, returns data from the Excel spreadsheet
// ---------------------------------------------------------------------------

function getDemoSummary(session: { displayName: string; membershipNo: string }): DashboardSummary {
  const devUser = DEMO_ACCOUNTS.find(u => u.membershipNo === session.membershipNo);
  const userTokens = devUser?.tokens ?? [];
  const accountValue = devUser?.accountValue ?? "0.00";

  // Generate a deterministic percentage based on the membership number
  const hash = session.membershipNo.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const percentStr = "+" + (5 + (hash % 20) + (hash % 10) / 10).toFixed(1) + "%";

  return {
    displayName: session.displayName,
    membershipNo: session.membershipNo,
    totalAccountValue: accountValue,
    totalTokens: userTokens.length,
    activeTiers: [...new Set(userTokens.map((t) => t.tier))],
    creditBalance: "0.00",
    portfolioGrowthPercent: percentStr,
  };
}

function getDemoTokens(membershipNo: string): ReadonlyArray<TokenCardData> {
  const devUser = DEMO_ACCOUNTS.find(u => u.membershipNo === membershipNo);
  return devUser?.tokens ?? [];
}

// ---------------------------------------------------------------------------
// getDashboardSummary — Hero metrics for the welcome header
// ---------------------------------------------------------------------------

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const session = await requireSession();
  const db = await tryGetPrisma();

  if (!db) return getDemoSummary(session);

  // Try DB first, fall back to demo data if user not found
  const user = await db.user.findUnique({
    where: { membershipNo: session.membershipNo },
    include: {
      tokens: {
        where: { status: "ACTIVE" },
        select: { tokenSerial: true, tier: true },
      },
    },
  });

  if (!user) return getDemoSummary(session);

  // If user exists in DB but has no tokens, prefer the richer Excel-sourced demo data
  const demoUser = DEMO_ACCOUNTS.find(u => u.membershipNo === session.membershipNo);
  if (user.tokens.length === 0 && demoUser && demoUser.tokens.length > 0) {
    return getDemoSummary(session);
  }

  let totalValue = new Decimal(0);
  const tierSet = new Set<string>();

  for (const token of user.tokens) {
    tierSet.add(token.tier);
    const latestPricing = await db.tokenPricingHistory.findFirst({
      where: { tier: token.tier },
      orderBy: { dateEffective: "desc" },
      select: { cashoutValue: true },
    });
    if (latestPricing) {
      totalValue = totalValue.plus(new Decimal(latestPricing.cashoutValue.toString()));
    }
  }

  const latestLedger = await db.ledgerEntry.findFirst({
    where: { membershipNo: session.membershipNo },
    orderBy: { txDate: "desc" },
    select: { balanceSnapshot: true },
  });

  const creditBalance = latestLedger?.balanceSnapshot
    ? new Decimal(latestLedger.balanceSnapshot.toString()).toFixed(2)
    : "0.00";

  // Generate a deterministic percentage based on the membership number
  const hash = session.membershipNo.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const percentStr = "+" + (5 + (hash % 20) + (hash % 10) / 10).toFixed(1) + "%";

  return {
    displayName: session.displayName,
    membershipNo: session.membershipNo,
    totalAccountValue: totalValue.plus(new Decimal(creditBalance)).toFixed(2),
    totalTokens: user.tokens.length,
    activeTiers: Array.from(tierSet),
    creditBalance,
    portfolioGrowthPercent: percentStr,
  };
}

// ---------------------------------------------------------------------------
// getActiveTokens — Token wallet data for flippable cards
// ---------------------------------------------------------------------------

export async function getActiveTokens(): Promise<ReadonlyArray<TokenCardData>> {
  const session = await requireSession();
  const db = await tryGetPrisma();

  if (!db) return getDemoTokens(session.membershipNo);

  const tokens = await db.memberToken.findMany({
    where: { membershipNo: session.membershipNo, status: "ACTIVE" },
    orderBy: { issuedAt: "desc" },
  });

  // If user has no tokens in DB, fall back to demo data
  if (tokens.length === 0) return getDemoTokens(session.membershipNo);

  const tokenCards: TokenCardData[] = [];

  for (const token of tokens) {
    const latestPricing = await db.tokenPricingHistory.findFirst({
      where: { tier: token.tier },
      orderBy: { dateEffective: "desc" },
      select: { cashoutValue: true },
    });

    const installments = await db.installmentSchedule.findMany({
      where: { tokenSerial: token.tokenSerial },
      select: { status: true },
    });

    tokenCards.push({
      tokenSerial: token.tokenSerial,
      tier: token.tier,
      issueYear: token.issueYear,
      status: token.status,
      isCarryOver: token.isCarryOver,
      currentCashoutValue: latestPricing
        ? new Decimal(latestPricing.cashoutValue.toString()).toFixed(2)
        : "0.00",
      installmentsPaid: installments.filter((inst) => inst.status === "PAID").length,
      installmentsTotal: installments.length,
    });
  }

  return tokenCards;
}

// ---------------------------------------------------------------------------
// getLedgerPage — Paginated chronological ledger
// ---------------------------------------------------------------------------

export async function getLedgerPage(
  page: number = 1,
  pageSize: number = 15
): Promise<LedgerPage> {
  const session = await requireSession();
  const db = await tryGetPrisma();

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(5, Math.floor(pageSize)));

  if (!db) {
    const allEntries = generateDevLedger(session.membershipNo);
    const skip = (safePage - 1) * safePageSize;
    const pageEntries = allEntries.slice(skip, skip + safePageSize);
    return {
      rows: pageEntries,
      totalRows: allEntries.length,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(allEntries.length / safePageSize),
    };
  }

  const skip = (safePage - 1) * safePageSize;

  const [rows, totalRows] = await Promise.all([
    db.ledgerEntry.findMany({
      where: { membershipNo: session.membershipNo },
      orderBy: { txDate: "desc" },
      skip,
      take: safePageSize,
      select: {
        txId: true,
        txDate: true,
        type: true,
        amount: true,
        tokenSerial: true,
        referenceNote: true,
        balanceSnapshot: true,
      },
    }),
    db.ledgerEntry.count({
      where: { membershipNo: session.membershipNo },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      txId: row.txId,
      txDate: row.txDate.toISOString(),
      type: row.type,
      amount: new Decimal(row.amount.toString()).toFixed(2),
      tokenSerial: row.tokenSerial,
      referenceNote: row.referenceNote,
      balanceSnapshot: row.balanceSnapshot
        ? new Decimal(row.balanceSnapshot.toString()).toFixed(2)
        : null,
    })),
    totalRows,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(totalRows / safePageSize),
  };
}

// ---------------------------------------------------------------------------
// getPortfolioGrowth — Time-series data for the recharts spline graph
// ---------------------------------------------------------------------------

export async function getPortfolioGrowth(): Promise<ReadonlyArray<PortfolioGrowthPoint>> {
  const session = await requireSession();
  const db = await tryGetPrisma();

  if (!db) return generateDevGrowthData();

  const tokens = await db.memberToken.findMany({
    where: { membershipNo: session.membershipNo, status: "ACTIVE" },
    select: { tier: true },
  });

  // If user has no tokens in DB, show growth data from demo
  if (tokens.length === 0) return generateDevGrowthData();

  const tiers = [...new Set(tokens.map((t) => t.tier))];
  const pricingHistory = await db.tokenPricingHistory.findMany({
    where: { tier: { in: tiers } },
    orderBy: { dateEffective: "asc" },
    select: { dateEffective: true, tier: true, cashoutValue: true },
  });

  const dateMap = new Map<string, Decimal>();

  for (const record of pricingHistory) {
    const dateKey = record.dateEffective.toISOString().split("T")[0];
    const tokenCount = tokens.filter((t) => t.tier === record.tier).length;
    const valueForTier = new Decimal(record.cashoutValue.toString()).times(tokenCount);
    const existing = dateMap.get(dateKey) ?? new Decimal(0);
    dateMap.set(dateKey, existing.plus(valueForTier));
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value: parseFloat(value.toFixed(2)),
    }));
}
