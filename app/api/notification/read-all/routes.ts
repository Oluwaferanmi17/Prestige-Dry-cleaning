import { prisma } from "../../../lib/prisma";
import { withAuth, ok } from "../../../lib/middleware";
export const POSTMarkAllRead = withAuth(async (_req, { user }) => {
  const { count } = await prisma.notification.updateMany({
    where: { userId: user.sub, read: false },
    data: { read: true },
  });

  return ok({ marked: count });
});
