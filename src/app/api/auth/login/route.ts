import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/core/services/auth.service";
import { signToken, buildAuthCookieHeader, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipNo, password } = body;

    if (!membershipNo || !password) {
      return NextResponse.json(
        { success: false, error: "Membership number and password are required." },
        { status: 400 }
      );
    }

    const user = await AuthService.verifyCredentials(membershipNo, password);

    const token = await signToken({
      userId: user.userId,
      membershipNo: user.membershipNo,
      role: user.role,
      displayName: user.displayName,
    });

    const response = NextResponse.json({ success: true });
    
    const maxAge = 8 * 60 * 60; // 8 hours
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
