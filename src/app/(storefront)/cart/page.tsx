"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, Heart, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const [hydrated, setHydrated] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/tshirts"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const discount = appliedCoupon?.discount ?? 0;
  const shipping = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!session) {
      router.push("/signin?callbackUrl=/checkout");
      return;
    }
    // store coupon in sessionStorage for checkout page
    if (appliedCoupon) {
      sessionStorage.setItem("ruhvique-coupon", appliedCoupon.code);
    } else {
      sessionStorage.removeItem("ruhvique-coupon");
    }
    router.push("/checkout");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 rounded-lg border border-border p-4"
            >
              <Link
                href={`/product/${item.slug}`}
                className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 overflow-hidden rounded-md bg-muted"
              >
                { }
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold hover:underline line-clamp-1"
                >
                  {item.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Size: <span className="font-medium text-foreground">{item.size}</span></span>
                  <span>·</span>
                  <span>Color: <span className="font-medium text-foreground">{item.color}</span></span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold">{formatCurrency(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(item.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center border border-border rounded-md">
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity - 1)}
                      className="h-8 w-8 inline-flex items-center justify-center hover:bg-accent"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="h-8 w-8 inline-flex items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity + 1)}
                      className="h-8 w-8 inline-flex items-center justify-center hover:bg-accent"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      remove(item.productId, item.size, item.color);
                      toast.success("Item removed from cart");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                  <button
                    onClick={() => {
                      remove(item.productId, item.size, item.color);
                      toast.success("Moved to wishlist");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Heart className="h-3.5 w-3.5" /> Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/tshirts"
              className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
            >
              <ArrowRight className="h-4 w-4 rotate-180" /> Continue Shopping
            </Link>
            <button
              onClick={() => {
                clear();
                toast.success("Cart cleared");
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border p-5 sticky top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                Coupon Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold">{appliedCoupon.code}</span>
                    <span className="text-xs text-emerald-600">−{formatCurrency(appliedCoupon.discount)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCoupon("");
                      toast.success("Coupon removed");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="RUHVIQUE10"
                    className="uppercase"
                  />
                  <Button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !coupon.trim()}
                    variant="secondary"
                  >
                    Apply
                  </Button>
                </div>
              )}
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Try <span className="font-mono font-bold">RUHVIQUE10</span> or <span className="font-mono font-bold">FLAT200</span>
              </p>
            </div>

            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">−{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-black">{formatCurrency(total)}</span>
            </div>

            <Button
              className="w-full mt-5 h-12"
              size="lg"
              onClick={handleCheckout}
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {subtotal < 1999 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Add <span className="font-bold text-foreground">{formatCurrency(1999 - subtotal)}</span> more for FREE shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
