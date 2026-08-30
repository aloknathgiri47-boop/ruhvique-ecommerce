"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, MapPin, Package } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string | null;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  trackingNumber: string | null;
  shippingPartner: string | null;
  couponCode: string | null;
  notes: string | null;
  createdAt: string;
  shipName: string;
  shipPhone: string;
  shipAddress: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  shipLandmark: string | null;
  user: { id: string; name: string | null; email: string; phone: string | null };
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    size: string;
    color: string;
  }>;
}

const STATUS_OPTIONS = [
  { value: "ORDER_PLACED", label: "Order Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [shippingPartner, setShippingPartner] = useState(order.shippingPartner || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, trackingNumber, shippingPartner }),
      });
      if (res.ok) {
        toast.success("Order updated");
        router.refresh();
      } else {
        toast.error("Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items + customer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-bold mb-4">Items ({order.items.length})</h3>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-16 w-14 object-cover rounded-md bg-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: <span className="font-medium text-foreground">{item.size}</span> · Color: <span className="font-medium text-foreground">{item.color}</span> · Qty: <span className="font-medium text-foreground">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-muted-foreground line-through">{formatCurrency(item.originalPrice * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Shipping Address</h3>
            <p className="text-sm font-medium">{order.shipName}</p>
            <p className="text-sm text-muted-foreground">{order.shipPhone}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shipAddress}<br />
              {order.shipCity}, {order.shipState} {order.shipPincode}
              {order.shipLandmark ? <><br />Landmark: {order.shipLandmark}</> : null}
            </p>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">Customer</p>
              <Link href={`/admin/customers/${order.user.id}`} className="text-sm font-medium hover:underline">
                {order.user.name || order.user.email}
              </Link>
              <p className="text-xs text-muted-foreground">{order.user.email}</p>
            </div>
          </Card>
        </div>

        {/* Update status */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold">Update Order</h3>
            <div>
              <Label>Order Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tracking Number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1.5 font-mono text-xs"
                placeholder="TRK123456789"
              />
            </div>
            <div>
              <Label>Shipping Partner</Label>
              <Input
                value={shippingPartner}
                onChange={(e) => setShippingPartner(e.target.value)}
                className="mt-1.5"
                placeholder="Delhivery, Bluedart, etc."
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Card>

          <Card className="p-5 space-y-2">
            <h3 className="font-bold flex items-center gap-2"><Package className="h-4 w-4" /> Payment</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">Customer Notes</p>
                <p className="text-sm mt-1">{order.notes}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
