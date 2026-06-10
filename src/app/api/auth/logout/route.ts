// =============================================================================
// POST /api/auth/logout — Clear the auth cookie
// =============================================================================

import { NextResponse } from "next/server";
import { buildLogoutCookieHeader } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", buildLogoutCookieHeader());
  return response;
}
