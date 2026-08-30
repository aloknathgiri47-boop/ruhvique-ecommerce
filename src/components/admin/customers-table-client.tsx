"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

interface CustomerItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  totalOrders: number;
  totalSpending: number;
}

export function CustomersTableClient({
  items,
  currentQuery,
}: {
  items: CustomerItem[];
  currentQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(currentQuery);

  const search = () => {
    router.push(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">{items.length} customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-10 w-72"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Total Spent</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">
                          {(c.name || c.email).slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4 font-medium">{c.totalOrders}</td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(c.totalSpending)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === "ACTIVE" ? "default" : "destructive"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/customers/${c.id}`}>
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
