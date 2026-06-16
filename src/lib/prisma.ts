// =============================================================================
// Prisma Client Singleton — Prevents connection pool exhaustion in dev/prod
// =============================================================================
// In development, Next.js hot-reloads modules which would create multiple
// PrismaClient instances. This singleton pattern attaches the client to
// globalThis to survive hot-reloads.
// =============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
