import { db } from "@/lib/db";
import { CustomersTableClient } from "@/components/admin/customers-table-client";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

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
    include: { orders: { select: { id: true, total: true, status: true } } },
  });

  const items = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    totalOrders: u.orders.length,
    totalSpending: u.orders.reduce((s, o) => s + (o.status !== "CANCELLED" ? o.total : 0), 0),
  }));

  return <CustomersTableClient items={items} currentQuery={q} />;
}
