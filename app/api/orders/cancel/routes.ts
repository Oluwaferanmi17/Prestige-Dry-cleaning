import { prisma } from "../../../lib/prisma";
import { withAuth, ok, err } from "../../../lib/middleware";
const CANCELLABLE: string[] = ["PENDING", "CONFIRMED"];

export const POSTCancelOrder = withAuth(async (req, { user, params }) => {
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.sub },
  });

  if (!order) return err("Order not found.", 404);
  if (!CANCELLABLE.includes(order.status)) {
    return err(`Order cannot be cancelled at status: ${order.status}.`, 409);
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CANCELLED",
      note: "Cancelled by customer.",
      changedBy: user.sub,
    },
  });

  return ok(updated);
});
