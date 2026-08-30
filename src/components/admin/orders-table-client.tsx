"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  trackingNumber: string | null;
  shippingPartner: string | null;
  itemCount: number;
  createdAt: string;
}

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "ORDER_PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrdersTableClient({
  items,
  currentStatus,
  currentQuery,
}: {
  items: OrderItem[];
  currentStatus: string;
  currentQuery: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(currentQuery);

  const setTab = (status: string) => {
    const params = new URLSearchParams(sp.toString());
    if (status === "ALL") params.delete("status");
    else params.set("status", status);
    if (q) params.set("q", q); else params.delete("q");
    router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const search = () => {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q); else params.delete("q");
    router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">{items.length} orders</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto ru-no-scrollbar pb-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              currentStatus === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent border border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                items.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{o.itemCount}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(o.total)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{o.paymentStatus}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[o.status]}`}>
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${o.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
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
