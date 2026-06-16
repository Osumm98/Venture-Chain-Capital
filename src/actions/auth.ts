"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/core/services/auth.service";
import { signToken, buildAuthCookieHeader, AUTH_COOKIE_NAME } from "@/lib/auth";

export interface LoginActionResult {
  readonly success: boolean;
  readonly error?: string;
}

export async function loginUser(membershipNo: string, password: string): Promise<LoginActionResult> {
  if (!membershipNo || !password) {
    return { success: false, error: "Membership number and password are required." };
  }

  try {
    const user = await AuthService.verifyCredentials(membershipNo, password);

    const token = await signToken({
      userId: user.userId,
      membershipNo: user.membershipNo,
      role: user.role,
      displayName: user.displayName,
    });

    const cookieStore = await cookies();
    // Using cookies() API natively from Next.js headers
    const maxAge = 8 * 60 * 60; // 8 hours
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return { success: false, error: message };
  }
}
