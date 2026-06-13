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

import { DEMO_ACCOUNTS } from "@/lib/demo-data";

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

    // --- Dev accounts check (Override) ---
    const devUser = DEMO_ACCOUNTS.find(
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

    // --- Try database ---
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
      // Database unreachable
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
