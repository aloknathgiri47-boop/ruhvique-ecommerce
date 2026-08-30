import { db } from "@/lib/db";
import { DashboardClient } from "@/components/admin/dashboard-client";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  // Fetch all dashboard data server-side
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last12Weeks = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalSalesAgg,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    deliveredOrders,
    lowStockCount,
    dailySalesOrders,
    weeklySalesOrders,
    todayOrders,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.count(),
    db.product.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.count({ where: { status: { in: ["ORDER_PLACED", "CONFIRMED", "PACKED"] } } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.productVariant.count({ where: { stock: { lte: 5 } } }),
    db.order.findMany({
      where: { createdAt: { gte: last30Days }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: last12Weeks }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ]);

  // Aggregate daily
  const dailyMap = new Map<string, number>();
  for (const o of dailySalesOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + o.total);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Aggregate weekly
  const weeklyMap = new Map<string, number>();
  for (const o of weeklySalesOrders) {
    const d = new Date(o.createdAt);
    const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + o.total);
  }
  const weekly = Array.from(weeklyMap.entries())
    .map(([week, total]) => ({ week, total }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);

  const data = {
    stats: {
      totalSales: totalSalesAgg._sum.total ?? 0,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      lowStockProducts: lowStockCount,
      todaySales,
    },
    charts: { daily, weekly },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name || o.user.email,
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.length,
    })),
  };

  return <DashboardClient data={data} />;
}
