import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowRight, Check, Package, Truck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Check },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, address: true },
  });
  if (!order || order.userId !== user.id) notFound();

  const currentStepIdx = order.status === "CANCELLED" ? -1 : STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowRight className="h-4 w-4 rotate-180" /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={isCancelled ? "destructive" : "default"}>
            {order.status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline">
            Payment: {order.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Tracking timeline */}
      {!isCancelled && (
        <div className="rounded-lg border border-border p-5 mb-6">
          <h2 className="text-lg font-bold mb-5">Order Tracking</h2>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-border -z-0" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-primary -z-0 transition-all duration-500"
              style={{ width: `calc(${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}% - ${currentStepIdx === 0 ? 0 : 10}px)` }}
            />
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const completed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className={`text-[10px] sm:text-xs text-center max-w-[80px] ${completed ? "font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {(order.trackingNumber || order.shippingPartner) && (
            <div className="mt-6 pt-5 border-t grid sm:grid-cols-2 gap-4 text-sm">
              {order.trackingNumber && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracking Number</p>
                  <p className="font-mono font-semibold mt-1">{order.trackingNumber}</p>
                </div>
              )}
              {order.shippingPartner && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Shipping Partner</p>
                  <p className="font-semibold mt-1">{order.shippingPartner}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border">
            <div className="p-4 border-b">
              <h2 className="font-bold">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  { }
                  <img src={item.image} alt={item.name} className="h-20 w-16 sm:h-24 sm:w-20 object-cover rounded-md bg-muted" />
                  <div className="flex-1">
                    <Link href={`/product/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-sm font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size: <span className="font-medium text-foreground">{item.size}</span> · Color: <span className="font-medium text-foreground">{item.color}</span> · Qty: <span className="font-medium text-foreground">{item.quantity}</span>
                    </p>
                    <p className="mt-2 text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Shipping Address
            </h3>
            <p className="text-sm font-medium">{order.shipName}</p>
            <p className="text-sm text-muted-foreground">{order.shipPhone}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shipAddress}<br />
              {order.shipCity}, {order.shipState} {order.shipPincode}
              {order.shipLandmark ? <><br />Landmark: {order.shipLandmark}</> : null}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border p-5 sticky top-20">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span className="font-medium">−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(order.tax)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-black">{formatCurrency(order.total)}</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Payment: {order.paymentMethod} · {order.paymentStatus}
            </div>
            {order.paymentId && (
              <div className="mt-1 text-xs text-muted-foreground">
                Payment ID: <span className="font-mono">{order.paymentId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
