import { prisma } from "../../../../../lib/prisma";
import { withAdmin, ok, err } from "../../../../../lib/middleware";
import { sendOrderStatusEmail } from "../../../../../lib/email";
import { z } from "zod";

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED: "your order has been confirmed and is scheduled for collection.",
  COLLECTED:
    "our driver has collected your garments. They're on the way to our facility.",
  PROCESSING: "your garments are now being expertly cleaned at our facility.",
  READY: "your garments are cleaned and ready for delivery.",
  OUT_FOR_DELIVERY:
    "your garments are out for delivery and will arrive shortly.",
  DELIVERED:
    "your garments have been delivered. We hope you're delighted with the results.",
  CANCELLED:
    "your order has been cancelled. Please contact us if you have any questions.",
};

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "COLLECTED",
    "PROCESSING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().optional(),
});

export const PATCHOrderStatus = withAdmin(
  async (req, { user: admin, params }) => {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const { status, note } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!order) return err("Order not found.", 404);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
    });

    // Log to status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        note: note ?? `Status updated to ${status}`,
        changedBy: admin.sub,
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        title: `Order ${order.orderNumber} — ${status.replace(/_/g, " ")}`,
        body:
          STATUS_MESSAGES[status] ??
          `Your order status has been updated to ${status}.`,
      },
    });

    // Send email notification
    if (order.user) {
      await sendOrderStatusEmail({
        to: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        status: status.replace(/_/g, " "),
        message:
          STATUS_MESSAGES[status] ??
          `Your order has been updated to ${status}.`,
      }).catch(console.error);
    }

    return ok(updated);
  },
);
