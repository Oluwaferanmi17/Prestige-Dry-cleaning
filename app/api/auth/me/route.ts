import { withAuth } from "../../../lib/middleware";
import { ok, err } from "../../../lib/middleware";
import { prisma } from "../../../lib/prisma";
export const GETMe = withAuth(async (_req, { user }) => {
  const profile = await prisma.user.findUnique({
    where: { id: user.sub },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  if (!profile) return err("User not found.", 404);
  return ok(profile);
});
