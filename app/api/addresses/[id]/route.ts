// import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { withAuth, ok, err } from "../../../lib/middleware";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().default("GB"),
  isDefault: z.boolean().optional(),
});

export const PATCHAddress = withAuth(async (req, { user, params }) => {
  const existing = await prisma.address.findFirst({
    where: { id: params.id, userId: user.sub },
  });
  if (!existing) return err("Address not found.", 404);

  const body = await req.json();
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const { isDefault, ...data } = parsed.data;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.sub },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: { ...data, ...(isDefault !== undefined ? { isDefault } : {}) },
  });

  return ok(updated);
});

export const DELETEAddress = withAuth(async (_req, { user, params }) => {
  const existing = await prisma.address.findFirst({
    where: { id: params.id, userId: user.sub },
  });
  if (!existing) return err("Address not found.", 404);

  await prisma.address.delete({ where: { id: params.id } });
  return ok({ deleted: true });
});
