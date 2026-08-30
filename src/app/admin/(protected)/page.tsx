import { db } from "@/lib/db";
import { DashboardClient } from "@/components/admin/dashboard-client";

export default async function AdminDashboardPage() {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last12Weeks = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const last12Months = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalSalesAgg,
    yesterdaySalesAgg,
    thisMonthSalesAgg,
    lastMonthSalesAgg,
    totalOrders,
    todayOrdersCount,
    totalProducts,
    activeProducts,
    totalCustomers,
    newCustomersThisMonth,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockCount,
    outOfStockCount,
    dailySalesOrders,
    weeklySalesOrders,
    monthlySalesOrders,
    todayOrders,
    recentOrders,
    topProducts,
    orderStatusBreakdown,
    lowStockProducts,
    recentCustomers,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfYesterday, lt: startOfToday } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: startOfToday } } }),
    db.product.count(),
    db.product.count({ where: { active: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
    db.order.count({ where: { status: { in: ["ORDER_PLACED", "CONFIRMED", "PACKED"] } } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.count({ where: { status: "CANCELLED" } }),
    db.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }),
    db.productVariant.count({ where: { stock: 0 } }),
    db.order.findMany({
      where: { createdAt: { gte: last30Days }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: last12Weeks }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: last12Months }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
    // Top selling products (by order item quantity)
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }).then(async (groups) => {
      const products = await db.product.findMany({
        where: { id: { in: groups.map((g) => g.productId) } },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true } },
        },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));
      return groups
        .map((g) => {
          const p = productMap.get(g.productId);
          if (!p) return null;
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.discountPrice ?? p.price,
            image: p.images[0]?.url ?? "",
            categoryName: p.category.name,
            unitsSold: g._sum.quantity,
            revenue: g._sum.quantity * (p.discountPrice ?? p.price),
          };
        })
        .filter(Boolean);
    }),
    // Order status breakdown
    db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Low stock products (variants with stock <= 5)
    db.productVariant.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: "asc" },
      include: {
        product: {
          select: { id: true, name: true, slug: true, sku: true },
        },
      },
    }),
    // Recent customers
    db.user.findMany({
      where: { role: "CUSTOMER" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  // Aggregate daily sales
  const dailyMap = new Map<string, number>();
  for (const o of dailySalesOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + o.total);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Aggregate weekly sales
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

  // Aggregate monthly sales
  const monthlyMap = new Map<string, number>();
  for (const o of monthlySalesOrders) {
    const month = o.createdAt.toISOString().slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + o.total);
  }
  const monthly = Array.from(monthlyMap.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const yesterdaySales = yesterdaySalesAgg._sum.total ?? 0;
  const thisMonthSales = thisMonthSalesAgg._sum.total ?? 0;
  const lastMonthSales = lastMonthSalesAgg._sum.total ?? 0;

  // Sales growth percentages
  const todayGrowth = yesterdaySales > 0
    ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
    : todaySales > 0 ? 100 : 0;
  const monthGrowth = lastMonthSales > 0
    ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
    : thisMonthSales > 0 ? 100 : 0;

  // Order status breakdown
  const statusBreakdown = orderStatusBreakdown.map((s) => ({
    status: s.status,
    count: s._count.status,
  }));

  const data = {
    stats: {
      totalSales: totalSalesAgg._sum.total ?? 0,
      todaySales,
      todayGrowth,
      thisMonthSales,
      monthGrowth,
      totalOrders,
      todayOrders: todayOrdersCount,
      totalProducts,
      activeProducts,
      totalCustomers,
      newCustomersThisMonth,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts: lowStockCount,
      outOfStockProducts: outOfStockCount,
    },
    charts: { daily, weekly, monthly },
    statusBreakdown,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name || o.user.email,
      customerEmail: o.user.email,
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.length,
    })),
    topProducts: topProducts.filter(Boolean),
    lowStockAlerts: lowStockProducts.map((v) => ({
      id: v.id,
      stock: v.stock,
      size: v.size,
      color: v.color,
      productId: v.product.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      productSku: v.product.sku,
    })),
    recentCustomers: recentCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
      orderCount: c._count.orders,
    })),
  };

  return <DashboardClient data={data} />;
}
