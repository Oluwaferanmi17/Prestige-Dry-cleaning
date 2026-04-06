/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { withAdmin, ok } from "../../../lib/middleware";

export const GETAdminOrders = withAdmin(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const status = searchParams.get("status") ?? undefined;
  const serviceType = searchParams.get("serviceType") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const where: any = {
    ...(status ? { status } : {}),
    ...(serviceType ? { serviceType } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            // { user: { lastName: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        pickupAddress: true,
        deliveryAddress: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ok({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
