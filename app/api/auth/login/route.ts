// POST /api/auth/login
// Body: { email, password }
import { NextRequest } from "next/server";
import { comparePassword, signToken } from "../../../lib/auth";
import { ok, err } from "../../../lib/middleware";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POSTLogin(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return err("Invalid credentials.", 422);

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return err("Invalid email or password.", 401);

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return err("Invalid email or password.", 401);

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  const response = ok({
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set("prestige_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
