"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, discountPercent } from "@/lib/format";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: string[];
  image: string;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const router = useRouter();
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);
  const [loading, setLoading] = useState(false);
  const inWishlist = has(p.id);

  const onQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    // Quick add to cart with default size
    router.push(`/product/${p.slug}`);
    setLoading(false);
  };

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg"
    >
      <div className="ru-zoom relative aspect-[4/5] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {p.discountPrice && p.discountPrice < p.price && (
          <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            -{discountPercent(p.price, p.discountPrice)}%
          </span>
        )}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(p.id);
            toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur hover:bg-background transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              inWishlist ? "fill-destructive text-destructive" : "text-foreground"
            )}
          />
        </button>
        {/* Hover quick add */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={onQuickAdd}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" /> View Product
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm font-semibold">{p.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold">
            {formatCurrency(p.discountPrice ?? p.price)}
          </span>
          {p.discountPrice && p.discountPrice < p.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(p.price)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs">★</span>
            <span className="text-xs font-medium">
              {p.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({p.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {p.sizes.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
