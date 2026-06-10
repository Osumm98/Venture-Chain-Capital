// =============================================================================
// VCC — Server-side session helper for Server Components & Server Actions
// =============================================================================

import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME, type VccTokenPayload } from "@/lib/auth";

/**
 * Retrieves the current authenticated user's JWT payload from the cookie.
 * Use this in Server Components and Server Actions.
 *
 * @returns The decoded token payload, or null if not authenticated.
 */
export async function getSession(): Promise<VccTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Retrieves the session or throws — for protected Server Actions
 * where authentication is mandatory.
 */
export async function requireSession(): Promise<VccTokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required. Please log in.");
  }
  return session;
}
