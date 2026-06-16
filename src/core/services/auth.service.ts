import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";
import type { RoleType } from "@/generated/prisma";

export interface NormalizedUser {
  readonly userId: string;
  readonly membershipNo: string;
  readonly role: RoleType;
  readonly displayName: string;
}

export class AuthService {
  /**
   * Validates user credentials. 
   * Always checks dev demo accounts first to guarantee access in environments without a DB (like Vercel previews).
   */
  static async verifyCredentials(membershipNo: string, password: string): Promise<NormalizedUser> {
    const normalizedMembershipNo = membershipNo.trim().toUpperCase();

    // 1. Dev / Demo Accounts Fallback (guarantees login works even if DB is offline)
    const devUser = DEMO_ACCOUNTS.find(
      (account) => account.membershipNo === normalizedMembershipNo
    );

    if (devUser && devUser.password === password) {
      return {
        userId: devUser.userId,
        membershipNo: devUser.membershipNo,
        role: devUser.role,
        displayName: `${devUser.firstName} ${devUser.lastName}`,
      };
    }

    // 2. Database verification
    try {
      // Dynamic import to avoid Prisma throwing globally if DATABASE_URL is missing
      const { prisma } = await import("@/lib/prisma");

      const user = await prisma.user.findUnique({
        where: { membershipNo: normalizedMembershipNo },
        select: {
          userId: true,
          membershipNo: true,
          firstName: true,
          lastName: true,
          passwordHash: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        throw new Error("Invalid credentials.");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("This account has been suspended or closed.");
      }

      if (!user.passwordHash) {
        throw new Error("Account setup incomplete. Please contact support.");
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials.");
      }

      return {
        userId: user.userId,
        membershipNo: user.membershipNo,
        role: user.role,
        displayName: `${user.firstName} ${user.lastName}`,
      };
    } catch (error) {
      // If error is our own thrown Error, rethrow it
      if (error instanceof Error && error.message !== "Invalid credentials.") {
        throw error;
      }
      
      // If it's a database connection issue or Prisma error, obscure it to prevent leakage,
      // but log it to the server console for debugging.
      console.error("[AuthService] DB verification failed:", error);
      throw new Error("Invalid credentials.");
    }
  }
}
