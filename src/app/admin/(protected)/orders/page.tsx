import { db } from "@/lib/db";
import { OrdersTableClient } from "@/components/admin/orders-table-client";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "ALL";
  const q = typeof sp.q === "string" ? sp.q : "";

  const where: any = {};
  if (status !== "ALL") where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { user: { name: { contains: q } } },
      { user: { email: { contains: q } } },
      { shipName: { contains: q } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  const items = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user.name || o.user.email,
    customerEmail: o.user.email,
    total: o.total,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    status: o.status,
    trackingNumber: o.trackingNumber,
    shippingPartner: o.shippingPartner,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
  }));

  return <OrdersTableClient items={items} currentStatus={status} currentQuery={q} />;
}
