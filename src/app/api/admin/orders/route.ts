import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { user: { name: { contains: q } } },
      { user: { email: { contains: q } } },
      { shipName: { contains: q } },
      { trackingNumber: { contains: q } },
    ];
  }

  const [total, items] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
      },
    }),
  ]);

  return NextResponse.json({
    items: items.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name || o.user.email,
      customerEmail: o.user.email,
      customerPhone: o.user.phone,
      total: o.total,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      status: o.status,
      trackingNumber: o.trackingNumber,
      shippingPartner: o.shippingPartner,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
