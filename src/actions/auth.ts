"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthService } from "@/core/services/auth.service";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export interface LoginState {
  readonly success: boolean;
  readonly error: string | null;
}

export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const membershipNo = formData.get("membershipNo") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

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

  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return { success: false, error: message };
  }

  // Redirect must be called outside the try/catch block
  // because Next.js implements redirect() by throwing a NEXT_REDIRECT error.
  redirect(redirectTo);
}
