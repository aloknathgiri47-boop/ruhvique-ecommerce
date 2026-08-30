"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, discountPercent } from "@/lib/format";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
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
    router.push(`/product/${p.slug}`);
    setLoading(false);
  };

  const hasDiscount = p.discountPrice && p.discountPrice < p.price;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card ru-card-lift"
    >
      <div className="ru-zoom relative aspect-[4/5] overflow-hidden bg-muted">
        { }
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {/* Discount badge - top left */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            -{discountPercent(p.price, p.discountPrice)}%
          </span>
        )}

        {/* NEW badge if no discount */}
        {!hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
            NEW
          </span>
        )}

        {/* Wishlist button - top right */}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(p.id);
            toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur hover:bg-background hover:scale-110 transition-all shadow-sm"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              inWishlist ? "fill-destructive text-destructive scale-110" : "text-foreground"
            )}
          />
        </button>

        {/* Quick view eye icon - appears on hover, middle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow-lg">
            <Eye className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Hover quick add - bottom slide up */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={onQuickAdd}
            disabled={loading}
            className="ru-btn-shine flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" /> View Product
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm font-semibold group-hover:text-primary transition-colors">
          {p.name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold">{p.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold">
            {formatCurrency(p.discountPrice ?? p.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(p.price)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                Save {formatCurrency(p.price - (p.discountPrice as number))}
              </span>
            </>
          )}
        </div>

        {/* Buy Now button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/product/${p.slug}`);
          }}
          className="mt-2.5 w-full rounded-md bg-primary py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Buy Now
        </button>
      </div>
    </Link>
  );
}
