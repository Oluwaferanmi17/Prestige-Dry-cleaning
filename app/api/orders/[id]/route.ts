import { prisma } from "../../../lib/prisma";
import { withAuth, ok, err } from "../../../lib/middleware";
export const GETOrderById = withAuth(async (req, { user, params }) => {
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.sub },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      pickupAddress: true,
      deliveryAddress: true,
    },
  });

  if (!order) return err("Order not found.", 404);
  return ok(order);
});
