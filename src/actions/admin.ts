"use server";

// =============================================================================
// VCC — Admin Server Actions
// =============================================================================
// Portfolio Head operations: yield input, portfolio viewing.
// In development, returns demo data when the DB is unreachable.
// =============================================================================

import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/auth";
import { Decimal } from "@/lib/decimal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortfolioSummary {
  readonly portfolioId: string;
  readonly assetClass: string;
  readonly totalAllocatedCapital: string;
  readonly currentMarketValue: string;
  readonly lastUpdated: string | null;
  readonly holdingsCount: number;
}

export interface WeeklyYieldInput {
  readonly portfolioId: string;
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly yieldPercentage: string;
  readonly absoluteReturn: string;
  readonly notes?: string;
}

export interface YieldSubmitResult {
  readonly success: boolean;
  readonly message: string;
  readonly logId?: string;
}

// ---------------------------------------------------------------------------
// Dev-mode demo portfolios
// ---------------------------------------------------------------------------

const DEV_PORTFOLIOS: ReadonlyArray<PortfolioSummary> = [
  {
    portfolioId: "dev-pf-crypto",
    assetClass: "Cryptocurrency",
    totalAllocatedCapital: "485000.00",
    currentMarketValue: "612450.00",
    lastUpdated: new Date("2026-06-07").toISOString(),
    holdingsCount: 8,
  },
  {
    portfolioId: "dev-pf-stocks",
    assetClass: "Stocks & Equities",
    totalAllocatedCapital: "720000.00",
    currentMarketValue: "798360.00",
    lastUpdated: new Date("2026-06-07").toISOString(),
    holdingsCount: 15,
  },
  {
    portfolioId: "dev-pf-commodities",
    assetClass: "Commodities",
    totalAllocatedCapital: "310000.00",
    currentMarketValue: "335800.00",
    lastUpdated: new Date("2026-06-06").toISOString(),
    holdingsCount: 6,
  },
  {
    portfolioId: "dev-pf-forex",
    assetClass: "Forex",
    totalAllocatedCapital: "250000.00",
    currentMarketValue: "271250.00",
    lastUpdated: new Date("2026-06-07").toISOString(),
    holdingsCount: 12,
  },
  {
    portfolioId: "dev-pf-hedge",
    assetClass: "Hedge Strategies",
    totalAllocatedCapital: "190000.00",
    currentMarketValue: "203300.00",
    lastUpdated: new Date("2026-06-05").toISOString(),
    holdingsCount: 4,
  },
];

// ---------------------------------------------------------------------------
// requireAdmin — helper to enforce admin role
// ---------------------------------------------------------------------------

async function requireAdmin(): Promise<ReturnType<typeof requireSession> extends Promise<infer T> ? T : never> {
  const session = await requireSession();
  if (!isAdminRole(session.role)) {
    throw new Error("Insufficient permissions. Admin role required.");
  }
  return session;
}

// ---------------------------------------------------------------------------
// DB helper
// ---------------------------------------------------------------------------

async function tryGetPrisma(): Promise<typeof import("@/lib/prisma").prisma | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// getAdminPortfolios — Portfolios visible to this admin
// ---------------------------------------------------------------------------

export async function getAdminPortfolios(): Promise<ReadonlyArray<PortfolioSummary>> {
  await requireAdmin();
  const db = await tryGetPrisma();

  if (!db) return DEV_PORTFOLIOS;

  const portfolios = await db.portfolio.findMany({
    include: { _count: { select: { holdings: true } } },
    orderBy: { assetClass: "asc" },
  });

  return portfolios.map((portfolio) => ({
    portfolioId: portfolio.portfolioId,
    assetClass: portfolio.assetClass,
    totalAllocatedCapital: portfolio.totalAllocatedCapital
      ? new Decimal(portfolio.totalAllocatedCapital.toString()).toFixed(2)
      : "0.00",
    currentMarketValue: portfolio.currentMarketValue
      ? new Decimal(portfolio.currentMarketValue.toString()).toFixed(2)
      : "0.00",
    lastUpdated: portfolio.lastUpdated?.toISOString() ?? null,
    holdingsCount: portfolio._count.holdings,
  }));
}

// ---------------------------------------------------------------------------
// submitWeeklyYield — Portfolio heads input yield metrics
// ---------------------------------------------------------------------------

export async function submitWeeklyYield(
  input: WeeklyYieldInput
): Promise<YieldSubmitResult> {
  const session = await requireAdmin();
  const db = await tryGetPrisma();

  const yieldPct = new Decimal(input.yieldPercentage);
  const absReturn = new Decimal(input.absoluteReturn);
  const weekStart = new Date(input.weekStartDate);
  const weekEnd = new Date(input.weekEndDate);

  if (weekEnd <= weekStart) {
    return { success: false, message: "Week end date must be after start date." };
  }

  if (yieldPct.isNaN() || absReturn.isNaN()) {
    return { success: false, message: "Yield and return values must be valid numbers." };
  }

  if (!db) {
    // Dev mode: simulate success
    return {
      success: true,
      message: `[DEV] Weekly yield of ${yieldPct.toFixed(3)}% (R${absReturn.toFixed(2)}) recorded successfully.`,
      logId: `dev-log-${Date.now()}`,
    };
  }

  const existing = await db.weeklyPerformanceLog.findUnique({
    where: {
      portfolioId_weekStartDate: {
        portfolioId: input.portfolioId,
        weekStartDate: weekStart,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: `Yield data for week starting ${input.weekStartDate} has already been submitted.`,
    };
  }

  const log = await db.weeklyPerformanceLog.create({
    data: {
      portfolioId: input.portfolioId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      yieldPercentage: yieldPct.toFixed(5),
      absoluteReturn: absReturn.toFixed(2),
      submittedBy: session.userId,
      notes: input.notes ?? null,
    },
  });

  await db.portfolio.update({
    where: { portfolioId: input.portfolioId },
    data: {
      lastUpdated: new Date(),
      currentMarketValue: {
        increment: parseFloat(absReturn.toFixed(2)),
      },
    },
  });

  return {
    success: true,
    message: "Weekly yield data submitted successfully.",
    logId: log.id,
  };
}
