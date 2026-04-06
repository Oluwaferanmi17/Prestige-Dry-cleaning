// import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { withAdmin, ok } from "../../../lib/middleware";
import { SERVICE_LABELS } from "../../../lib/utils";
export const GETAdminStats = withAdmin(async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    pendingOrders,
    activeOrders,
    completedToday,
    revenueThisMonth,
    totalUsers,
    recentOrders,
    ordersByService,
    ordersByStatus,
  ] = await Promise.all([
    // Total orders ever
    prisma.order.count(),

    // Awaiting action
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),

    // In progress
    prisma.order.count({
      where: {
        status: {
          in: ["COLLECTED", "PROCESSING", "READY", "OUT_FOR_DELIVERY"],
        },
      },
    }),

    // Delivered today
    prisma.order.count({
      where: { status: "DELIVERED", updatedAt: { gte: today } },
    }),

    // Revenue this month (finalPrice)
    prisma.order.aggregate({
      _sum: { finalPrice: true },
      where: {
        status: "DELIVERED",
        updatedAt: { gte: monthStart },
        finalPrice: { not: null },
      },
    }),

    // Total customers
    prisma.user.count({ where: { role: "CUSTOMER" } }),

    // 5 most recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),

    // Orders grouped by service type
    prisma.order.groupBy({
      by: ["serviceType"],
      _count: { serviceType: true },
      orderBy: { _count: { serviceType: "desc" } },
    }),

    // Orders grouped by status
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  return ok({
    summary: {
      totalOrders,
      pendingOrders,
      activeOrders,
      completedToday,
      revenueThisMonth: Number(revenueThisMonth._sum.finalPrice ?? 0),
      totalUsers,
    },
    recentOrders,
    ordersByService: ordersByService.map((s) => ({
      service: SERVICE_LABELS[s.serviceType] ?? s.serviceType,
      count: s._count.serviceType,
    })),
    ordersByStatus: ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
  });
});
