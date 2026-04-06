import { prisma } from "../../../../lib/prisma";
import { withAuth, ok, err } from "../../../../lib/middleware";
export const POSTMarkRead = withAuth(async (_req, { user, params }) => {
  const notif = await prisma.notification.findFirst({
    where: { id: params.id, userId: user.sub },
  });
  if (!notif) return err("Notification not found.", 404);

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });

  return ok(updated);
});
