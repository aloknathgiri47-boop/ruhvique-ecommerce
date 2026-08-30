"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronLeft, ChevronRight, CreditCard, Wallet, Banknote, CheckCircle2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Address {
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
}

const STEPS = [
  { num: 1, label: "Customer" },
  { num: 2, label: "Address" },
  { num: 3, label: "Summary" },
  { num: 4, label: "Payment" },
];

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({
    id: "",
    name: "", phone: "", house: "", street: "", area: "", city: "", state: "", pincode: "", landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/checkout");
      return;
    }
    if (status !== "authenticated" || !session) return;
    // pre-fill from session
    setCustomer((c) => ({
      ...c,
      name: (session.user as any)?.name || c.name,
      email: (session.user as any)?.email || c.email,
    }));
    // load saved addresses
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        setAddresses(d.items || []);
        const def = (d.items || []).find((a: Address) => a.isDefault) || (d.items || [])[0];
        if (def) {
          setAddress({ id: def.id, name: def.name, phone: def.phone, house: def.house, street: def.street, area: def.area, city: def.city, state: def.state, pincode: def.pincode, landmark: def.landmark || "" });
        } else {
          setAddress((a) => ({ ...a, name: (session.user as any)?.name || "", email: "", phone: "" }));
        }
        setLoadingAddresses(false);
      })
      .catch(() => setLoadingAddresses(false));
    // restore coupon from sessionStorage
    const savedCoupon = sessionStorage.getItem("ruhvique-coupon");
    if (savedCoupon) {
      setCouponCode(savedCoupon);
      // auto-apply
      setTimeout(() => applyCoupon(savedCoupon), 100);
    }
  }, [status, session, router]);

  // Empty cart guard
  if (status === "authenticated" && items.length === 0 && !placedOrder) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add items before checking out.</p>
        <Link href="/tshirts" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (placedOrder) {
    return <OrderSuccess order={placedOrder} />;
  }

  const discount = appliedCoupon?.discount ?? 0;
  const shipping = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;

  const applyCoupon = async (code?: string) => {
    const c = (code || couponCode).toUpperCase().trim();
    if (!c) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
        toast.success(data.message);
      } else {
        toast.error(data.message);
        setAppliedCoupon(null);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const validateStep = (n: number): boolean => {
    if (n === 1) {
      if (!customer.name || !customer.email || !customer.phone) {
        toast.error("Fill all customer fields");
        return false;
      }
      if (!/^\d{10}$/.test(customer.phone.replace(/\D/g, "").slice(-10))) {
        toast.error("Enter a valid 10-digit mobile number");
        return false;
      }
    }
    if (n === 2) {
      // name & phone fall back to customer info from step 1
      const name = address.name || customer.name;
      const phone = address.phone || customer.phone;
      if (!name || !phone || !address.house || !address.city || !address.state || !address.pincode) {
        toast.error("Fill all required address fields");
        return false;
      }
      if (!/^\d{6}$/.test(address.pincode)) {
        toast.error("Enter a valid 6-digit pincode");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const finalAddress = {
        ...address,
        name: address.name || customer.name,
        phone: address.phone || customer.phone,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          address: finalAddress,
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        clear();
        sessionStorage.removeItem("ruhvique-coupon");
        setPlacedOrder(data.order);
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 max-w-2xl">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  step >= s.num
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <p className={cn("text-[10px] sm:text-xs", step >= s.num ? "font-semibold" : "text-muted-foreground")}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 mb-5", step > s.num ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Customer */}
          {step === 1 && (
            <div className="rounded-lg border border-border p-5 space-y-4">
              <h2 className="font-bold">Customer Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="mt-1.5" placeholder="Your name" />
                </div>
                <div>
                  <Label>Mobile Number <span className="text-destructive">*</span></Label>
                  <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-1.5" placeholder="10-digit mobile" maxLength={10} />
                </div>
              </div>
              <div>
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="mt-1.5" placeholder="you@email.com" />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="rounded-lg border border-border p-5 space-y-4">
              <h2 className="font-bold">Shipping Address</h2>

              {addresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Saved Addresses</p>
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAddress({
                        id: a.id, name: a.name, phone: a.phone, house: a.house, street: a.street,
                        area: a.area, city: a.city, state: a.state, pincode: a.pincode, landmark: a.landmark || "",
                      })}
                      className={cn(
                        "w-full text-left rounded-md border p-3 transition-colors",
                        address.id === a.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
                      )}
                    >
                      <p className="text-sm font-semibold">{a.name} <span className="text-muted-foreground font-normal">· {a.phone}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.house}, {a.street}{a.area ? `, ${a.area}` : ""}, {a.city}, {a.state} {a.pincode}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={() => setAddress({ id: "", name: customer.name, phone: customer.phone, house: "", street: "", area: "", city: "", state: "", pincode: "", landmark: "" })}
                    className="text-xs text-primary hover:underline"
                  >
                    + Enter a new address
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>House / Flat <span className="text-destructive">*</span></Label>
                  <Input value={address.house} onChange={(e) => setAddress({ ...address, house: e.target.value })} className="mt-1.5" placeholder="Flat 402, ABC Apartments" />
                </div>
                <div>
                  <Label>Street <span className="text-destructive">*</span></Label>
                  <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="mt-1.5" placeholder="Street name" />
                </div>
                <div>
                  <Label>Area</Label>
                  <Input value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} className="mt-1.5" placeholder="Area / Locality" />
                </div>
                <div>
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="mt-1.5" placeholder="City" />
                </div>
                <div>
                  <Label>State <span className="text-destructive">*</span></Label>
                  <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="mt-1.5" placeholder="State" />
                </div>
                <div>
                  <Label>Pincode <span className="text-destructive">*</span></Label>
                  <Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="mt-1.5" placeholder="6-digit pincode" maxLength={6} />
                </div>
              </div>
              <div>
                <Label>Landmark</Label>
                <Input value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} className="mt-1.5" placeholder="Near..." />
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="rounded-lg border border-border p-5 space-y-4">
              <h2 className="font-bold">Order Summary</h2>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="py-3 flex gap-3">
                    { }
                    <img src={item.image} alt={item.name} className="h-16 w-14 object-cover rounded-md bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} · {item.color} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-bold">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600">−{formatCurrency(appliedCoupon.discount)}</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="uppercase"
                    />
                    <Button variant="secondary" onClick={() => applyCoupon()} disabled={couponLoading || !couponCode.trim()}>
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="rounded-lg border border-border p-5 space-y-4">
              <h2 className="font-bold">Payment Method</h2>
              <div className="space-y-2">
                {[
                  { id: "COD", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives" },
                  { id: "CARD", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
                  { id: "UPI", label: "UPI", icon: Wallet, desc: "GPay, PhonePe, Paytm" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md border p-3 transition-colors",
                      paymentMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
                    )}
                  >
                    <m.icon className="h-5 w-5" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    <div className={cn("h-4 w-4 rounded-full border-2", paymentMethod === m.id ? "border-primary bg-primary" : "border-border")} />
                  </button>
                ))}
              </div>
              {(paymentMethod === "CARD" || paymentMethod === "UPI") && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  Payment gateway integration is ready. For this demo, the order will be created with payment status &quot;PAID&quot; and a generated Payment ID.
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-5 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={back}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            ) : (
              <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> Back to Cart
              </Link>
            )}
            {step < 4 ? (
              <Button onClick={next}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={placing} size="lg">
                {placing ? "Placing Order..." : `Place Order · ${formatCurrency(total)}`}
              </Button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border p-5 sticky top-20">
            <h3 className="font-bold mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-black">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSuccess({ order }: { order: any }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          { }
          <img
            src="/ruhvique-logo.jpeg"
            alt="RUHVIQUE"
            className="h-11 w-11 rounded-md object-cover"
          />
          <span className="text-xl font-black tracking-[0.2em]">RUHVIQUE</span>
        </Link>
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Order Successfully Placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your purchase. We&apos;ve sent a confirmation to your email.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-border p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</p>
            <p className="font-mono font-bold mt-1">{order.orderNumber}</p>
          </div>
          {order.paymentId && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Payment ID</p>
              <p className="font-mono font-bold mt-1">{order.paymentId}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Amount</p>
            <p className="font-bold mt-1">{formatCurrency(order.total)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Payment Method</p>
            <p className="font-bold mt-1">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Delivery Address</p>
          <p className="text-sm font-medium">{order.shipName}</p>
          <p className="text-sm text-muted-foreground">
            {order.shipAddress}<br />
            {order.shipCity}, {order.shipState} {order.shipPincode}
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Items</p>
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="line-clamp-1">{item.name} ({item.size}, {item.color}) × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/account/orders/${order.id}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          View Order
        </Link>
        <Link href="/tshirts" className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-bold hover:bg-accent">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
