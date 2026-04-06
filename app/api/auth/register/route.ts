// POST / api / auth / register;
// Body: { firstName, lastName, email, password }

import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hashPassword, signToken } from "../../../lib/auth";
import { sendWelcomeEmail } from "../../../lib/email";
import { generateSecureToken } from "../../../lib/utils";
import { ok, err } from "../../../lib/middleware";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return err(parsed.error.issues[0].message, 422);
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return err("An account with this email already exists.", 409);

  const passwordHash = await hashPassword(password);
  const verifyToken = generateSecureToken();

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, verifyToken },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verifyToken}`;
  await sendWelcomeEmail({ to: email, firstName, verifyUrl }).catch(
    console.error,
  );

  const response = ok(
    {
      token,
      user: { id: user.id, firstName, lastName, email, role: user.role },
    },
    201,
  );

  // Also set HttpOnly cookie
  response.cookies.set("prestige_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
