import { prisma } from "../../lib/prisma";
import { withAuth, ok, err } from "../../lib/middleware";
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

// GET /api/addresses
export const GET = withAuth(async (_req, { user }) => {
  const addresses = await prisma.address.findMany({
    where: { userId: user.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return ok(addresses);
});

// POST /api/addresses
export const POST = withAuth(async (req, { user }) => {
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const { isDefault, ...data } = parsed.data;

  // If setting as default, unset all others first
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.sub },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...data, userId: user.sub, isDefault: isDefault ?? false },
  });

  return ok(address, 201);
});
