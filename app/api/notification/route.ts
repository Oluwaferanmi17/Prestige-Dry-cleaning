import { prisma } from "../../lib/prisma";
import { withAuth, ok } from "../../lib/middleware";
export const GETNotifications = withAuth(async (req, { user }) => {
  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.sub, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId: user.sub, read: false } }),
  ]);

  return ok({ notifications, unreadCount });
});
