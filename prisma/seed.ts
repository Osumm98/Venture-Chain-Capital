// =============================================================================
// VCC — Database Seed Script
// =============================================================================
// Seeds the database with:
// 1. The 5 portfolios (CRYPTO, STOCKS, COMMODITIES, FOREX, HEDGE)
// 2. Initial token pricing history for all 8 tiers
// 3. A SUPER_ADMIN user for system bootstrap
//
// Run with: npx prisma db seed
// =============================================================================

import { PrismaClient } from "../src/generated/prisma";
import { TIER_CONFIGS, ASSET_CLASSES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  // eslint-disable-next-line no-console
  console.info("🌱 Seeding VCC database...");

  // -------------------------------------------------------------------------
  // 1. Upsert the 5 core portfolios
  // -------------------------------------------------------------------------
  for (const assetClass of ASSET_CLASSES) {
    await prisma.portfolio.upsert({
      where: { assetClass },
      update: {},
      create: {
        assetClass,
        totalAllocatedCapital: 0,
        currentMarketValue: 0,
      },
    });
  }
  // eslint-disable-next-line no-console
  console.info("  ✅ Portfolios seeded (5 asset classes)");

  // -------------------------------------------------------------------------
  // 2. Seed initial token pricing for all 8 tiers
  //    Using a baseline date. Cashout/BuyIn values set to 0 until first
  //    weekly valuation is submitted by portfolio heads.
  // -------------------------------------------------------------------------
  const baselineDate = new Date("2026-01-01");

  for (const [, config] of TIER_CONFIGS) {
    await prisma.tokenPricingHistory.upsert({
      where: {
        dateEffective_tier: {
          dateEffective: baselineDate,
          tier: config.tier,
        },
      },
      update: {},
      create: {
        dateEffective: baselineDate,
        tier: config.tier,
        monthlySub: parseFloat(config.monthlySubZar),
        adminFeePct: parseFloat(config.adminFeePct),
        profitFeePct: parseFloat(config.profitFeePct),
        cashoutValue: 0,
        buyInPrice: parseFloat(config.monthlySubZar),
      },
    });
  }
  // eslint-disable-next-line no-console
  console.info("  ✅ Token pricing history seeded (8 tiers × baseline)");

  // -------------------------------------------------------------------------
  // 3. Create SUPER_ADMIN bootstrap user
  // -------------------------------------------------------------------------
  await prisma.user.upsert({
    where: { membershipNo: "BWG2020M00001" },
    update: {},
    create: {
      membershipNo: "BWG2020M00001",
      firstName: "System",
      lastName: "Administrator",
      role: "SUPER_ADMIN",
      joinDate: new Date("2020-03-01"),
      allocatedShares: 100.0,
      status: "ACTIVE",
    },
  });
  // eslint-disable-next-line no-console
  console.info("  ✅ SUPER_ADMIN bootstrap user created (BWG2020M00001)");

  // eslint-disable-next-line no-console
  console.info("🎉 Database seeding complete.");
}

seed()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
