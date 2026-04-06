import { NextRequest, NextResponse } from "next/server";
import { err } from "../../../lib/middleware";
import { prisma } from "../../../lib/prisma";
export async function GETVerifyEmail(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return err("Missing token.", 400);

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) return err("Invalid or expired verification token.", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });

  // Redirect to dashboard with success
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?verified=true`,
  );
}
