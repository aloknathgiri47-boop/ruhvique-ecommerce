import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      address: true,
    },
  });
  if (!order) notFound();
  return <OrderDetailClient order={JSON.parse(JSON.stringify(order))} />;
}
