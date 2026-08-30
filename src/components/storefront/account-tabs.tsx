"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Package, MapPin, LogOut, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface AccountTabsProps {
  user: { id: string; name: string | null; email: string; phone: string | null; image: string | null; createdAt: string } | null;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{ id: string; name: string; image: string; quantity: number; size: string; color: string; price: number }>;
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

export function AccountTabs({ user, orders, addresses }: AccountTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState("orders");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1 mb-6">
        <TabsTrigger value="orders" className="gap-1.5">
          <Package className="h-4 w-4" /> Orders
        </TabsTrigger>
        <TabsTrigger value="profile" className="gap-1.5">
          <User className="h-4 w-4" /> Profile
        </TabsTrigger>
        <TabsTrigger value="addresses" className="gap-1.5">
          <MapPin className="h-4 w-4" /> Addresses
        </TabsTrigger>
      </TabsList>

      {/* Orders */}
      <TabsContent value="orders">
        <h2 className="text-xl font-bold mb-4">My Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-dashed">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-3 font-semibold">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Your future orders will show up here.</p>
            <Link href="/tshirts" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-lg border border-border p-4 hover:border-foreground/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge className={STATUS_COLORS[order.status] || "bg-muted"}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.image} alt={item.name} className="h-10 w-10 rounded-md border-2 border-background object-cover" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Profile */}
      <TabsContent value="profile">
        <h2 className="text-xl font-bold mb-4">Profile Details</h2>
        <div className="max-w-md space-y-4 rounded-lg border border-border p-5">
          <div>
            <Label>Name</Label>
            <Input defaultValue={user?.name || ""} className="mt-1.5" readOnly />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email || ""} className="mt-1.5" readOnly />
          </div>
          <div>
            <Label>Phone</Label>
            <Input defaultValue={user?.phone || ""} placeholder="Not set" className="mt-1.5" readOnly />
          </div>
          <p className="text-xs text-muted-foreground">
            Member since {user ? formatDate(user.createdAt) : "—"}
          </p>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </TabsContent>

      {/* Addresses */}
      <TabsContent value="addresses">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Saved Addresses ({addresses.length})</h2>
        </div>
        {addresses.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No saved addresses</p>
            <p className="mt-1 text-sm text-muted-foreground">You can add addresses during checkout.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{addr.name}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                  </div>
                  {addr.isDefault && <Badge>Default</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {addr.house}, {addr.street}{addr.area ? `, ${addr.area}` : ""}<br />
                  {addr.city}, {addr.state} {addr.pincode}
                  {addr.landmark ? ` — Landmark: ${addr.landmark}` : ""}
                </p>
                <button
                  onClick={async () => {
                    await fetch(`/api/addresses?id=${addr.id}`, { method: "DELETE" });
                    toast.success("Address deleted");
                    router.refresh();
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
