import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalSales,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    dailySales,
    weeklySales,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true } }),
    db.order.count(),
    db.product.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.count({ where: { status: { in: ["ORDER_PLACED", "CONFIRMED", "PACKED"] } } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.productVariant.count({ where: { stock: { lte: 5 } } }),
    // Daily sales last 30 days
    db.order.findMany({
      where: { createdAt: { gte: last30Days }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    // Weekly sales last 12 weeks
    db.order.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    }),
  ]);

  // Aggregate daily sales
  const dailyMap = new Map<string, number>();
  for (const o of dailySales) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + o.total);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Aggregate weekly sales
  const weeklyMap = new Map<string, number>();
  for (const o of weeklySales) {
    const d = new Date(o.createdAt);
    const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + o.total);
  }
  const weekly = Array.from(weeklyMap.entries())
    .map(([week, total]) => ({ week, total }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  // Today's sales
  const todayOrders = await db.order.findMany({
    where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
    select: { total: true },
  });
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);

  return NextResponse.json({
    stats: {
      totalSales: totalSales._sum.total ?? 0,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      todaySales,
    },
    charts: {
      daily,
      weekly,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name || o.user.email,
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
      itemCount: o.items.length,
    })),
  });
}
