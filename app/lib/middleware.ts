// lib/middleware.ts
// ─── Route protection middleware for Next.js App Router ──────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken, JwtPayload } from "./auth";

type Handler = (
  req: NextRequest,
  context: { params: Record<string, string>; user: JwtPayload },
) => Promise<NextResponse> | NextResponse;

// ─── withAuth — requires valid JWT ────────────────────────────────────────────

export function withAuth(handler: Handler) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> },
  ) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorised. No token provided." },
        { status: 401 },
      );
    }

    try {
      const user = verifyToken(token);
      return handler(req, { ...context, user });
    } catch {
      return NextResponse.json(
        { error: "Unauthorised. Invalid or expired token." },
        { status: 401 },
      );
    }
  };
}

// ─── withAdmin — requires ADMIN role ─────────────────────────────────────────

export function withAdmin(handler: Handler) {
  return withAuth(async (req, context) => {
    if (context.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }
    return handler(req, context);
  });
}

// ─── apiResponse helpers ──────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
