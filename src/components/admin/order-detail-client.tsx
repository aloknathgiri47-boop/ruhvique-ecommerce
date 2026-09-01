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
import { ArrowLeft, Save, MapPin, Package, Download, Printer } from "lucide-react";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/format";
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

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

const PAYMENT_LABEL: Record<string, string> = Object.fromEntries(
  PAYMENT_OPTIONS.map((p) => [p.value, p.label])
);

export function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [shippingPartner, setShippingPartner] = useState(order.shippingPartner || "");
  const [saving, setSaving] = useState(false);
  // Slip download is unlocked only after admin has entered tracking info
  // AND saved the order. On initial load, if tracking info already exists
  // (e.g. admin saved earlier and re-opened the order), keep it unlocked.
  const [slipReady, setSlipReady] = useState(
    Boolean(order.trackingNumber && order.shippingPartner)
  );

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
        // Unlock slip download only if tracking info is present
        const hasTracking = Boolean(trackingNumber.trim() && shippingPartner.trim());
        setSlipReady(hasTracking);
        if (hasTracking) {
          toast.success("Slip ready to download");
        } else {
          toast.info("Add tracking number & shipping partner to enable slip download");
        }
        router.refresh();
      } else {
        toast.error("Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- Order Slip Download ----
  // Uses the browser's native print-to-PDF: opens a clean popup with
  // a slip layout, triggers print, then closes the popup.
  // Uses the LATEST tracking info from state (so freshly-saved values appear).
  const handleDownloadSlip = () => {
    const mergedOrder = { ...order, trackingNumber, shippingPartner };
    const slipHtml = buildSlipHtml(mergedOrder);
    const printWin = window.open("", "_blank", "width=820,height=900");
    if (!printWin) {
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }
    printWin.document.open();
    printWin.document.write(slipHtml);
    printWin.document.close();
    // Wait for images to load before printing
    printWin.onload = () => {
      setTimeout(() => {
        printWin.focus();
        printWin.print();
        // Close after print dialog (most browsers will keep the dialog open)
        setTimeout(() => printWin.close(), 300);
      }, 400);
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
        <div className="flex items-center gap-2">
          {slipReady ? (
            <Button variant="outline" onClick={handleDownloadSlip}>
              <Download className="h-4 w-4 mr-2" /> Download Slip
            </Button>
          ) : (
            <Button variant="outline" disabled title="Enter tracking number & shipping partner, then Save Changes to enable slip download">
              <Download className="h-4 w-4 mr-2 opacity-40" /> Download Slip
              <span className="ml-2 text-xs font-normal text-muted-foreground">(locked)</span>
            </Button>
          )}
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
                  { }
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
                defaultValue="Delhivery"
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

// ============================================================
//  Order Slip Builder — generates a standalone HTML document
//  that opens in a popup window and triggers the browser's
//  print dialog (which can save as PDF).
// ============================================================
function buildSlipHtml(order: Order): string {
  const itemsRows = order.items
    .map(
      (item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>
            <div class="item-cell">
              <img src="${item.image}" alt="" />
              <div>
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">
                  ${item.size ? `Size: <strong>${escapeHtml(item.size)}</strong>` : ""}
                  ${item.color ? ` · Color: <strong>${escapeHtml(item.color)}</strong>` : ""}
                </div>
              </div>
            </div>
          </td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatCurrency(item.price)}</td>
          <td class="right bold">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const slipNo = `SLIP-${order.orderNumber}`;
  const dateStr = formatDate(order.createdAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Slip — ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0a0a0a;
      background: #fff;
      padding: 32px 36px;
      font-size: 13px;
      line-height: 1.5;
    }
    .slip {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      overflow: hidden;
    }
    .header {
      background: #0a0a0a;
      color: #fff;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.18em;
    }
    .brand-tag {
      font-size: 9px;
      letter-spacing: 0.3em;
      color: #a3a3a3;
      margin-top: 2px;
    }
    .slip-meta { text-align: right; }
    .slip-no { font-size: 18px; font-weight: 700; letter-spacing: 0.05em; }
    .slip-date { font-size: 11px; color: #a3a3a3; margin-top: 4px; }

    .section { padding: 20px 32px; }
    .section + .section { border-top: 1px solid #f0f0f0; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .block-title {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 8px;
    }
    .block-body { font-size: 12.5px; color: #171717; }
    .block-body p + p { margin-top: 4px; }
    .block-body .name { font-weight: 700; font-size: 14px; }
    .block-body .muted { color: #737373; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead th {
      text-align: left;
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #737373;
      padding: 10px 8px;
      border-bottom: 2px solid #0a0a0a;
    }
    tbody td {
      padding: 10px 8px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }
    tbody tr:last-child td { border-bottom: none; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }

    .item-cell { display: flex; align-items: center; gap: 10px; }
    .item-cell img {
      width: 42px; height: 48px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
      background: #f5f5f5;
    }
    .item-name { font-weight: 600; font-size: 12.5px; }
    .item-meta { font-size: 10.5px; color: #737373; margin-top: 2px; }

    .totals {
      margin-left: auto;
      width: 280px;
      margin-top: 14px;
    }
    .totals .row {
      display: flex; justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
      color: #404040;
    }
    .totals .row.grand {
      border-top: 2px solid #0a0a0a;
      margin-top: 6px;
      padding-top: 10px;
      font-size: 15px;
      font-weight: 800;
      color: #0a0a0a;
    }
    .totals .row.discount { color: #059669; }

    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 14px 32px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 11px;
    }
    .status-bar .pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .pill.ok { background: #dcfce7; color: #166534; }
    .pill.warn { background: #fef3c7; color: #92400e; }
    .pill.bad { background: #fee2e2; color: #991b1b; }

    .footer {
      padding: 18px 32px;
      background: #0a0a0a;
      color: #a3a3a3;
      font-size: 10.5px;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .footer .thx { color: #fff; font-weight: 700; letter-spacing: 0.2em; margin-bottom: 4px; }

    .signature {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    .sign-box {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: #737373;
    }
    .sign-line {
      border-top: 1px solid #404040;
      margin-bottom: 6px;
      padding-top: 4px;
    }

    @media print {
      body { padding: 0; }
      .slip { border: none; max-width: 100%; }
      @page { margin: 14mm; }
    }
  </style>
</head>
<body>
  <div class="slip">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand">RUHVIQUE</div>
        <div class="brand-tag">PREMIUM FASHION &middot; STREETWEAR</div>
      </div>
      <div class="slip-meta">
        <div class="slip-no">${slipNo}</div>
        <div class="slip-date">Date: ${dateStr}</div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="status-bar">
      <div>
        Order Status:&nbsp;
        <span class="pill ${order.status === "DELIVERED" ? "ok" : order.status === "CANCELLED" ? "bad" : "warn"}">
          ${STATUS_LABEL[order.status] || order.status}
        </span>
      </div>
      <div>
        Payment:&nbsp;
        <span class="pill ${order.paymentStatus === "PAID" ? "ok" : order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED" ? "bad" : "warn"}">
          ${PAYMENT_LABEL[order.paymentStatus] || order.paymentStatus}
        </span>
      </div>
      <div>
        Method:&nbsp;<strong>${escapeHtml(order.paymentMethod)}</strong>
      </div>
    </div>

    <!-- Bill To / Ship To -->
    <div class="section">
      <div class="grid-2">
        <div>
          <div class="block-title">Bill To</div>
          <div class="block-body">
            <p class="name">${escapeHtml(order.user.name || order.user.email)}</p>
            <p class="muted">${escapeHtml(order.user.email)}</p>
            ${order.user.phone ? `<p class="muted">${escapeHtml(order.user.phone)}</p>` : ""}
          </div>
        </div>
        <div>
          <div class="block-title">Ship To</div>
          <div class="block-body">
            <p class="name">${escapeHtml(order.shipName)}</p>
            <p class="muted">${escapeHtml(order.shipPhone)}</p>
            <p>${escapeHtml(order.shipAddress)}</p>
            <p>${escapeHtml(order.shipCity)}, ${escapeHtml(order.shipState)} ${escapeHtml(order.shipPincode)}</p>
            ${order.shipLandmark ? `<p class="muted">Landmark: ${escapeHtml(order.shipLandmark)}</p>` : ""}
          </div>
        </div>
      </div>
    </div>

    <!-- Items -->
    <div class="section">
      <table>
        <thead>
          <tr>
            <th class="center" style="width: 32px;">#</th>
            <th>Item</th>
            <th class="center" style="width: 50px;">Qty</th>
            <th class="right" style="width: 80px;">Price</th>
            <th class="right" style="width: 100px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div class="row discount"><span>Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</span><span>−${formatCurrency(order.discount)}</span></div>` : ""}
        <div class="row"><span>Shipping</span><span>${order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}</span></div>
        <div class="row"><span>Tax</span><span>${formatCurrency(order.tax)}</span></div>
        <div class="row grand"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
      </div>
    </div>

    <!-- Shipping / Tracking -->
    ${(order.trackingNumber || order.shippingPartner) ? `
    <div class="section" style="background: #fafafa;">
      <div class="grid-2">
        ${order.shippingPartner ? `<div><div class="block-title">Shipping Partner</div><div class="block-body"><strong>${escapeHtml(order.shippingPartner)}</strong></div></div>` : "<div></div>"}
        ${order.trackingNumber ? `<div><div class="block-title">Tracking Number</div><div class="block-body"><span style="font-family: monospace; font-size: 13px;">${escapeHtml(order.trackingNumber)}</span></div></div>` : "<div></div>"}
      </div>
    </div>` : ""}

    ${order.notes ? `
    <div class="section">
      <div class="block-title">Order Notes</div>
      <div class="block-body" style="font-style: italic; color: #525252;">${escapeHtml(order.notes)}</div>
    </div>` : ""}

    <!-- Signature -->
    <div class="section">
      <div class="signature">
        <div class="sign-box">
          <div class="sign-line">Customer Signature</div>
        </div>
        <div class="sign-box">
          <div class="sign-line">Authorized by RUHVIQUE</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thx">THANK YOU FOR YOUR ORDER</div>
      <div>RUHVIQUE &middot; Premium Fashion & Streetwear &middot; support@ruhvique.com</div>
    </div>
  </div>
  <script>
    // Auto-trigger print on load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
