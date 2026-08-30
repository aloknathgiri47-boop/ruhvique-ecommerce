"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist, useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const remove = useWishlist((s) => s.remove);
  const add = useCart((s) => s.add);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/wishlist");
      return;
    }
    if (status !== "authenticated") return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, router]);

  if (status === "unauthenticated") return null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your favorite items here for later.
          </p>
          <Link
            href="/tshirts"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <Link href={`/product/${item.slug}`} className="block aspect-[4/5] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover hover:scale-105 transition-transform" />
              </Link>
              <div className="p-3 sm:p-4">
                <Link href={`/product/${item.slug}`} className="text-sm font-semibold line-clamp-1 hover:underline">
                  {item.name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold">{formatCurrency(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(item.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => {
                      add({
                        productId: item.id,
                        name: item.name,
                        slug: item.slug,
                        image: item.image,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        size: "M",
                        color: "Black",
                        quantity: 1,
                        stock: 10,
                      });
                      toast.success("Added to cart");
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={async () => {
                      await fetch("/api/wishlist", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId: item.id }),
                      });
                      remove(item.id);
                      toast.success("Removed from wishlist");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
