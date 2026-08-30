"use client";

import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ArrowRight,
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
} from "recharts";

interface DashboardData {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    deliveredOrders: number;
    lowStockProducts: number;
    todaySales: number;
  };
  charts: {
    daily: Array<{ date: string; total: number }>;
    weekly: Array<{ week: string; total: number }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
    itemCount: number;
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

export function DashboardClient({ data }: { data: DashboardData }) {
  const { stats, charts, recentOrders } = data;

  const cards = [
    { label: "Total Sales", value: formatCurrency(stats.totalSales), icon: IndianRupee, hint: `Today: ${formatCurrency(stats.todaySales)}` },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, hint: `${stats.pendingOrders} pending` },
    { label: "Total Products", value: stats.totalProducts, icon: Package, hint: `${stats.lowStockProducts} low stock` },
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, hint: "Registered users" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, hint: "Need attention" },
    { label: "Delivered Orders", value: stats.deliveredOrders, icon: CheckCircle2, hint: "Completed" },
    { label: "Low Stock", value: stats.lowStockProducts, icon: AlertTriangle, hint: "Variants ≤ 5" },
  ];

  // Format chart data
  const dailyChartData = charts.daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    Sales: d.total,
  }));
  const weeklyChartData = charts.weekly.map((w) => ({
    week: new Date(w.week).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    Sales: w.total,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-xl font-black">{c.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{c.hint}</p>
              </div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Daily Sales</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
                  formatter={(v: any) => [formatCurrency(v), "Sales"]}
                />
                <Area type="monotone" dataKey="Sales" stroke="#0a0a0a" strokeWidth={2} fill="url(#dailyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Weekly Sales</h3>
              <p className="text-xs text-muted-foreground">Last 12 weeks</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
                  formatter={(v: any) => [formatCurrency(v), "Sales"]}
                />
                <Bar dataKey="Sales" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Order ID</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Items</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-4 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-3 pr-4">{o.customerName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{o.itemCount}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(o.total)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className={PAYMENT_COLORS[o.paymentStatus]}>
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className={STATUS_COLORS[o.status]}>
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
