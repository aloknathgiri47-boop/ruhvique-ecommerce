"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart, IndianRupee, Calendar } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  status: string;
  createdAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{ id: string; name: string; quantity: number; price: number }>;
  }>;
  addresses: Array<{
    id: string;
    name: string;
    phone: string;
    house: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string | null;
    isDefault: boolean;
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

export function CustomerDetailClient({ user }: { user: UserDetail }) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(user.status === "BLOCKED");
  const [updating, setUpdating] = useState(false);

  const totalSpending = user.orders.reduce((s, o) => s + (o.status !== "CANCELLED" ? o.total : 0), 0);

  const toggleBlock = async () => {
    setUpdating(true);
    const next = !blocked;
    try {
      const res = await fetch(`/api/admin/customers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "BLOCKED" : "ACTIVE" }),
      });
      if (res.ok) {
        setBlocked(next);
        toast.success(next ? "Customer blocked" : "Customer unblocked");
        router.refresh();
      } else {
        toast.error("Update failed");
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{user.name || "Customer"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <ShoppingCart className="h-3.5 w-3.5" /> Orders
              </div>
              <p className="mt-1 text-xl font-black">{user.orders.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <IndianRupee className="h-3.5 w-3.5" /> Spending
              </div>
              <p className="mt-1 text-xl font-black">{formatCurrency(totalSpending)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" /> Joined
              </div>
              <p className="mt-1 text-sm font-bold">{formatDate(user.createdAt)}</p>
            </Card>
          </div>

          {/* Orders */}
          <Card className="p-5">
            <h3 className="font-bold mb-4">Order History</h3>
            {user.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {user.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="block rounded-md border border-border p-3 hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs">{o.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)} · {o.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(o.total)}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[o.status]}`}>
                            {o.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone || "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Saved Addresses</h3>
            {user.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses.</p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((a) => (
                  <div key={a.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="font-medium">{a.name}</p>
                      {a.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-5">
                      {a.house}, {a.street}{a.area ? `, ${a.area}` : ""}<br />
                      {a.city}, {a.state} {a.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Account Status</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="block" className="cursor-pointer">
                  {blocked ? "Blocked" : "Active"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {blocked ? "Cannot place orders" : "Can place orders"}
                </p>
              </div>
              <Switch
                id="block"
                checked={blocked}
                onCheckedChange={toggleBlock}
                disabled={updating}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
