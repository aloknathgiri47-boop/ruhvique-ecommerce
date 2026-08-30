"use client";

import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Boxes,
  UserPlus,
  Eye,
  Star,
  Zap,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface DashboardData {
  stats: {
    totalSales: number;
    todaySales: number;
    todayGrowth: number;
    thisMonthSales: number;
    monthGrowth: number;
    totalOrders: number;
    todayOrders: number;
    totalProducts: number;
    activeProducts: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  charts: {
    daily: Array<{ date: string; total: number }>;
    weekly: Array<{ week: string; total: number }>;
    monthly: Array<{ month: string; total: number }>;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
  }>;
  lowStockAlerts: Array<{
    id: string;
    stock: number;
    size: string;
    color: string;
    productId: string;
    productName: string;
    productSlug: string;
    productSku: string;
  }>;
  recentCustomers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    orderCount: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

// Pie chart colors for order status breakdown
const PIE_COLORS = ["#3b82f6", "#3b82f6", "#f59e0b", "#a855f7", "#f97316", "#10b981", "#ef4444"];

export function DashboardClient({ data }: { data: DashboardData }) {
  const { stats, charts, statusBreakdown, recentOrders, topProducts, lowStockAlerts, recentCustomers } = data;

  const dailyChartData = charts.daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    Sales: d.total,
  }));
  const weeklyChartData = charts.weekly.map((w) => ({
    week: new Date(w.week).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    Sales: w.total,
  }));
  const monthlyChartData = charts.monthly.map((m) => ({
    month: new Date(m.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    Sales: m.total,
  }));

  // Pie chart data
  const pieData = statusBreakdown.map((s) => ({
    name: s.status.replace(/_/g, " "),
    value: s.count,
  }));

  // Quick action cards
  const quickActions = [
    { label: "Add Product", href: "/admin/products/new", icon: Package, color: "bg-black text-white" },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Manage Inventory", href: "/admin/inventory", icon: Boxes, color: "bg-amber-50 text-amber-600" },
    { label: "Customers", href: "/admin/customers", icon: Users, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back — here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero stat cards - 4 primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-black/5 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div className={`inline-flex items-center gap-0.5 text-xs font-bold ${stats.todayGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {stats.todayGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.todayGrowth).toFixed(1)}%
              </div>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Total Sales</p>
            <p className="mt-1 text-2xl font-black">{formatCurrency(stats.totalSales)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-bold">{formatCurrency(stats.todaySales)}</span>
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-blue-50 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                {stats.todayOrders} today
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Total Orders</p>
            <p className="mt-1 text-2xl font-black">{formatNumber(stats.totalOrders)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-bold text-amber-600">{stats.pendingOrders}</span>
            </div>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-emerald-50 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                +{stats.newCustomersThisMonth} this month
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Total Customers</p>
            <p className="mt-1 text-2xl font-black">{formatNumber(stats.totalCustomers)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Avg order value:</span>
              <span className="font-bold">
                {stats.totalOrders > 0 ? formatCurrency(stats.totalSales / stats.totalOrders) : "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-purple-50 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Package className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                {stats.activeProducts} active
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Total Products</p>
            <p className="mt-1 text-2xl font-black">{formatNumber(stats.totalProducts)}</p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="font-bold text-amber-600">{stats.lowStockProducts}</span>
                <span className="text-muted-foreground">low</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                <span className="font-bold text-red-600">{stats.outOfStockProducts}</span>
                <span className="text-muted-foreground">out</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SecondaryStat
          label="This Month"
          value={formatCurrency(stats.thisMonthSales)}
          growth={stats.monthGrowth}
          icon={TrendingUp}
          color="bg-black text-white"
        />
        <SecondaryStat
          label="Delivered"
          value={formatNumber(stats.deliveredOrders)}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />
        <SecondaryStat
          label="Cancelled"
          value={formatNumber(stats.cancelledOrders)}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
        <SecondaryStat
          label="Low Stock"
          value={formatNumber(stats.lowStockProducts)}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-600"
          href="/admin/inventory?lowStock=true"
        />
      </div>

      {/* Charts row 1: Daily + Monthly */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Daily Sales - takes 2 cols */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Sales Trend</h3>
              <p className="text-xs text-muted-foreground">Daily revenue · last 30 days</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  formatter={(v: any) => [formatCurrency(v), "Sales"]}
                />
                <Area type="monotone" dataKey="Sales" stroke="#0a0a0a" strokeWidth={2.5} fill="url(#dailyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Breakdown - Pie chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Order Status</h3>
              <p className="text-xs text-muted-foreground">All orders breakdown</p>
            </div>
          </div>
          {pieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    formatter={(v: any, n: any) => [`${v} orders`, n]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Charts row 2: Weekly + Monthly */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Weekly Sales</h3>
              <p className="text-xs text-muted-foreground">Last 12 weeks</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(v: any) => [formatCurrency(v), "Sales"]}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Bar dataKey="Sales" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Monthly Revenue</h3>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(v: any) => [formatCurrency(v), "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="Sales"
                  stroke="#0a0a0a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0a0a0a" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Products + Low Stock Alerts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Top Selling Products</h3>
                <p className="text-xs text-muted-foreground">By units sold</p>
              </div>
            </div>
            <Link href="/admin/products" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No sales data yet. Top products will appear here once orders come in.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  { }
                  <img src={p.image} alt={p.name} className="h-12 w-10 rounded-md object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.categoryName} · {formatCurrency(p.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.unitsSold} <span className="text-xs font-normal text-muted-foreground">sold</span></p>
                    <p className="text-xs text-emerald-600 font-medium">{formatCurrency(p.revenue)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Low Stock Alerts</h3>
                <p className="text-xs text-muted-foreground">Variants running low (≤ 5 units)</p>
              </div>
            </div>
            <Link href="/admin/inventory?lowStock=true" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          </div>
          {lowStockAlerts.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              All stock levels are healthy.
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockAlerts.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/inventory`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors"
                >
                  <div className={`flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold ${
                    v.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {v.stock}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{v.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.size} · {v.color} · {v.productSku}
                    </p>
                  </div>
                  <Badge variant={v.stock === 0 ? "destructive" : "outline"} className="text-[10px]">
                    {v.stock === 0 ? "Out of stock" : "Low"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest 6 orders</p>
            </div>
          </div>
          <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto ru-scrollbar -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-5 font-medium">Order ID</th>
                <th className="py-2 px-3 font-medium">Customer</th>
                <th className="py-2 px-3 font-medium">Items</th>
                <th className="py-2 px-3 font-medium">Amount</th>
                <th className="py-2 px-3 font-medium">Payment</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 px-3 font-medium">Date</th>
                <th className="py-2 px-5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    No orders yet. Orders will appear here once customers start purchasing.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-5 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-3 px-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{o.itemCount}</td>
                    <td className="py-3 px-3 font-bold">{formatCurrency(o.total)}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={PAYMENT_COLORS[o.paymentStatus]}>
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={STATUS_COLORS[o.status]}>
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                    <td className="py-3 px-5">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        <Eye className="h-3 w-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Customers + Quick Actions (mobile) */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Customers */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">New Customers</h3>
                <p className="text-xs text-muted-foreground">Recently registered</p>
              </div>
            </div>
            <Link href="/admin/customers" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentCustomers.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No customers yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/customers/${c.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">
                    {(c.name || c.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{c.name || "—"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{c.orderCount}</p>
                    <p className="text-[10px] text-muted-foreground">orders</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">Jump to common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Product", desc: "Create new item", href: "/admin/products/new", icon: Package, color: "bg-black text-white" },
              { label: "View Orders", desc: `${stats.pendingOrders} pending`, href: "/admin/orders", icon: ShoppingBag, color: "bg-blue-600 text-white" },
              { label: "Inventory", desc: `${stats.lowStockProducts} low stock`, href: "/admin/inventory", icon: Boxes, color: "bg-amber-500 text-white" },
              { label: "Banners", desc: "Manage home slider", href: "/admin/banners", icon: Eye, color: "bg-purple-600 text-white" },
              { label: "Coupons", desc: "Create discount code", href: "/admin/coupons", icon: Star, color: "bg-emerald-600 text-white" },
              { label: "Messages", desc: "Customer queries", href: "/admin/contact", icon: Clock, color: "bg-red-500 text-white" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col gap-2 rounded-lg border border-border p-3 hover:border-foreground/30 hover:shadow-sm transition-all"
              >
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecondaryStat({
  label,
  value,
  growth,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string;
  growth?: number;
  icon: any;
  color: string;
  href?: string;
}) {
  const content = (
    <Card className="p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg font-black">{value}</p>
        </div>
        {growth !== undefined && (
          <div className={`inline-flex items-center gap-0.5 text-xs font-bold ${growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {growth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(growth).toFixed(0)}%
          </div>
        )}
      </div>
    </Card>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
