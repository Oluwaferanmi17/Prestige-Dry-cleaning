// import { NextRequest } from "next/server";
import { prisma } from "../../lib/prisma";
import { OrderStatus } from "@/app/generated/prisma/client";
import { withAuth, ok, err } from "../../lib/middleware";
import {
  generateOrderNumber,
  SLOT_LABELS,
  SERVICE_LABELS,
  addressToString,
} from "../../lib/utils";
import { sendOrderConfirmedEmail } from "../../lib/email";
import { z } from "zod";

export const GETOrders = withAuth(async (req, { user }) => {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
  const status = searchParams.get("status") as OrderStatus | undefined;

  const where = {
    userId: user.sub,
    ...(status ? { status } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        serviceType: true,
        status: true,
        pickupDate: true,
        pickupSlot: true,
        estimatedDelivery: true,
        finalPrice: true,
        estimatedPrice: true,
        currency: true,
        itemCount: true,
        createdAt: true,
        pickupAddressSnap: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ok({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const createOrderSchema = z.object({
  serviceType: z.enum([
    "WASH_FOLD",
    "DRY_CLEAN",
    "PRESS_ONLY",
    "HOUSEHOLD",
    "ALTERATIONS",
    "LEATHER_CARE",
  ]),
  pickupAddressId: z.string().min(1),
  deliveryAddressId: z.string().min(1),
  pickupDate: z.string().datetime(),
  pickupSlot: z.enum([
    "SLOT_08_10",
    "SLOT_10_12",
    "SLOT_14_16",
    "SLOT_16_18",
    "SLOT_18_20",
  ]),
  notes: z.string().max(300).optional(),
  itemCount: z.number().int().positive().optional(),
});

export const POSTOrders = withAuth(async (req, { user }) => {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const {
    serviceType,
    pickupAddressId,
    deliveryAddressId,
    pickupDate,
    pickupSlot,
    notes,
    itemCount,
  } = parsed.data;

  // Verify addresses belong to this user
  const [pickup, delivery] = await Promise.all([
    prisma.address.findFirst({
      where: { id: pickupAddressId, userId: user.sub },
    }),
    prisma.address.findFirst({
      where: { id: deliveryAddressId, userId: user.sub },
    }),
  ]);

  if (!pickup) return err("Pickup address not found.", 404);
  if (!delivery) return err("Delivery address not found.", 404);

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.sub,
      serviceType,
      pickupAddressId,
      deliveryAddressId,
      pickupAddressSnap: { ...pickup },
      deliveryAddressSnap: { ...delivery },
      pickupDate: new Date(pickupDate),
      pickupSlot,
      notes,
      itemCount,
      status: "PENDING",
    },
  });

  // Log initial status
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "PENDING",
      note: "Order placed by customer.",
    },
  });

  // Send confirmation email
  const fullUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (fullUser) {
    await sendOrderConfirmedEmail({
      to: fullUser.email,
      firstName: fullUser.firstName,
      orderNumber,
      service: SERVICE_LABELS[serviceType],
      pickupDate: new Date(pickupDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      pickupSlot: SLOT_LABELS[pickupSlot],
      pickupAddress: addressToString(pickup),
    }).catch(console.error);
  }

  return ok(order, 201);
});
