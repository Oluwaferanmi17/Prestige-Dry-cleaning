import { NextRequest } from "next/server";
import { hashPassword } from "../../../lib/auth";
import { ok, err } from "../../../lib/middleware";
import { prisma } from "../../../lib/prisma";
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) return err("Token and password are required.", 400);
  if (password.length < 8)
    return err("Password must be at least 8 characters.", 422);

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return err("Reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return ok({ message: "Password updated successfully." });
}
