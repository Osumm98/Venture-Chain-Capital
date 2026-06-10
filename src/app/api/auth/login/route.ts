// =============================================================================
// POST /api/auth/login — Authenticate by Membership Number + Password
// =============================================================================
// In development (NODE_ENV !== "production"), if the database is unreachable,
// a set of demo accounts are available for testing the UI flows.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, buildAuthCookieHeader } from "@/lib/auth";
import type { RoleType } from "@/generated/prisma";

interface LoginRequestBody {
  readonly membershipNo: string;
  readonly password: string;
}

// ---------------------------------------------------------------------------
// Dev-mode demo accounts (only active when DB is unavailable)
// ---------------------------------------------------------------------------

interface DemoAccount {
  readonly userId: string;
  readonly membershipNo: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: RoleType;
  readonly password: string;
}

const DEV_ACCOUNTS: ReadonlyArray<DemoAccount> = [
  {
    userId: "dev-super-admin-001",
    membershipNo: "BWG2020M00001",
    firstName: "Thabiso",
    lastName: "Molefe",
    role: "SUPER_ADMIN",
    password: "admin123",
  },
  {
    userId: "dev-admin-crypto-001",
    membershipNo: "BWG2020M00002",
    firstName: "Naledi",
    lastName: "Dlamini",
    role: "ADMIN_CRYPTO",
    password: "admin123",
  },
  {
    userId: "dev-member-001",
    membershipNo: "BWG2020M00010",
    firstName: "Sipho",
    lastName: "Nkosi",
    role: "MEMBER",
    password: "member123",
  },
  {
    userId: "dev-member-002",
    membershipNo: "BWG2020M00011",
    firstName: "Zanele",
    lastName: "Mthembu",
    role: "MEMBER",
    password: "member123",
  },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequestBody;

    if (!body.membershipNo || !body.password) {
      return NextResponse.json(
        { error: "Membership number and password are required." },
        { status: 400 }
      );
    }

    const normalizedMembershipNo = body.membershipNo.trim().toUpperCase();

    // --- Try database first ---
    try {
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

      if (user) {
        if (user.status !== "ACTIVE") {
          return NextResponse.json(
            { error: "This account has been suspended or closed." },
            { status: 403 }
          );
        }

        if (!user.passwordHash) {
          return NextResponse.json(
            { error: "Account setup incomplete. Please contact support." },
            { status: 403 }
          );
        }

        const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "Invalid credentials." },
            { status: 401 }
          );
        }

        const token = await signToken({
          userId: user.userId,
          membershipNo: user.membershipNo,
          role: user.role,
          displayName: `${user.firstName} ${user.lastName}`,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            membershipNo: user.membershipNo,
            displayName: `${user.firstName} ${user.lastName}`,
            role: user.role,
          },
        });

        response.headers.set("Set-Cookie", buildAuthCookieHeader(token));
        return response;
      }
    } catch {
      // Database unreachable — fall through to dev accounts
    }

    // --- Dev accounts fallback (non-production only) ---
    if (process.env.NODE_ENV !== "production") {
      const devUser = DEV_ACCOUNTS.find(
        (account) => account.membershipNo === normalizedMembershipNo
      );

      if (devUser && devUser.password === body.password) {
        const token = await signToken({
          userId: devUser.userId,
          membershipNo: devUser.membershipNo,
          role: devUser.role,
          displayName: `${devUser.firstName} ${devUser.lastName}`,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            membershipNo: devUser.membershipNo,
            displayName: `${devUser.firstName} ${devUser.lastName}`,
            role: devUser.role,
          },
        });

        response.headers.set("Set-Cookie", buildAuthCookieHeader(token));
        return response;
      }
    }

    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: `Authentication failed: ${message}` },
      { status: 500 }
    );
  }
}
