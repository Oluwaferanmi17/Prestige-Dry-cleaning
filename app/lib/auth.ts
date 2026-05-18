// lib/auth.ts
// ─── Auth utilities: JWT signing/verification + password hashing ──────────────

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

// ─── Token types ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Extract token from request ──────────────────────────────────────────────

// export function getTokenFromRequest(req: NextRequest): string | null {
//   // 1. Try Authorization header: Bearer <token>
//   const authHeader = req.headers.get("authorization");
//   if (authHeader?.startsWith("Bearer ")) {
//     return authHeader.slice(7);
//   }

//   // 2. Try HttpOnly cookie
//   const cookie = req.cookies.get("prestige_token");
//   if (cookie?.value) return cookie.value;

//   return null;
// }

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get("prestige_token");
  if (cookie?.value) return cookie.value;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

// ─── Decode without throwing (for optional auth) ──────────────────────────────

export function decodeToken(token: string): JwtPayload | null {
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
