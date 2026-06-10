// =============================================================================
// VCC — Stateless JWT Authentication
// =============================================================================
// PRD 2: "Stateless JWT mapped to the user's Membership Number"
// Uses `jose` for edge-compatible JWT (works in Next.js Middleware).
// =============================================================================

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { RoleType } from "@/generated/prisma";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET_RAW = process.env.JWT_SECRET ?? "vcc-dev-secret-change-in-production";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const JWT_ISSUER = "vcc-platform";
const JWT_AUDIENCE = "vcc-members";
const TOKEN_EXPIRY = "8h";

// ---------------------------------------------------------------------------
// Token Payload Type
// ---------------------------------------------------------------------------

export interface VccTokenPayload extends JWTPayload {
  /** The member's unique membership number (e.g., BWG2020M00001). */
  readonly membershipNo: string;
  /** The member's database UUID. */
  readonly userId: string;
  /** The member's RBAC role. */
  readonly role: RoleType;
  /** Display name. */
  readonly displayName: string;
}

// ---------------------------------------------------------------------------
// Sign — Creates a new JWT for a verified member.
// ---------------------------------------------------------------------------

export async function signToken(payload: Omit<VccTokenPayload, "iss" | "aud" | "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// ---------------------------------------------------------------------------
// Verify — Validates and decodes a JWT, returning the typed payload.
// ---------------------------------------------------------------------------

export async function verifyToken(token: string): Promise<VccTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as VccTokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie Helpers
// ---------------------------------------------------------------------------

export const AUTH_COOKIE_NAME = "vcc-auth-token";

export function buildAuthCookieHeader(token: string): string {
  const maxAge = 8 * 60 * 60; // 8 hours in seconds
  return `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function buildLogoutCookieHeader(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Role Hierarchy — for RBAC checks
// ---------------------------------------------------------------------------

const ADMIN_ROLES: ReadonlySet<string> = new Set([
  "ADMIN_CRYPTO",
  "ADMIN_STOCKS",
  "ADMIN_COMMODITIES",
  "ADMIN_FOREX",
  "ADMIN_HEDGE",
  "SUPER_ADMIN",
]);

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}
