import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/storefront/account-tabs";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?callbackUrl=/account");

  const [dbUser, orders, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
    }),
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {dbUser?.name || "Customer"}</p>
      </div>

      <AccountTabs
        user={dbUser ? JSON.parse(JSON.stringify(dbUser)) : null}
        orders={JSON.parse(JSON.stringify(orders))}
        addresses={JSON.parse(JSON.stringify(addresses))}
      />
    </div>
  );
}
