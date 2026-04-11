// POST /api/auth/forgot-password
// Body: { email }

import { sendPasswordResetEmail } from "../../../lib/email";
import { NextRequest } from "next/server";
import { generateSecureToken } from "../../../lib/utils";
import { ok, err } from "../../../lib/middleware";
import { prisma } from "../../../lib/prisma";
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return err("Email is required.", 400);

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 — don't reveal whether the email exists
  if (!user)
    return ok({ message: "If that email exists, a reset link has been sent." });

  const resetToken = generateSecureToken();
  const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: resetExpiry },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?token=${resetToken}`;
  await sendPasswordResetEmail({
    to: email,
    firstName: user.firstName,
    resetUrl,
  });

  return ok({
    message: "If that email exists, a reset link has been sent.",
    // token: resetToken,
  });
}
