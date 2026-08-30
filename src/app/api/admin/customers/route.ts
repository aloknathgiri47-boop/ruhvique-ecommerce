import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  const where: any = { role: "CUSTOMER" };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      orders: { select: { id: true, total: true, status: true, createdAt: true } },
    },
  });

  const items = users.map((u) => {
    const totalSpending = u.orders.reduce((s, o) => s + (o.status !== "CANCELLED" ? o.total : 0), 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
      totalOrders: u.orders.length,
      totalSpending,
    };
  });

  return NextResponse.json({ items });
}
