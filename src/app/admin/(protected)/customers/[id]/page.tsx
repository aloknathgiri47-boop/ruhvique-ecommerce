import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/admin/customer-detail-client";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      addresses: true,
    },
  });
  if (!user) notFound();
  return <CustomerDetailClient user={JSON.parse(JSON.stringify(user))} />;
}
