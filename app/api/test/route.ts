export const runtime = "nodejs";

import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();

  return Response.json({ users });
}
