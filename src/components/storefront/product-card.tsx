"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, discountPercent } from "@/lib/format";
import { Heart, Star, Eye, ShoppingBag } from "lucide-react";
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

  const hasDiscount = p.discountPrice && p.discountPrice < p.price;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image — fixed aspect ratio, all same size */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted flex-shrink-0">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            -{discountPercent(p.price, p.discountPrice)}%
          </span>
        )}

        {/* NEW badge */}
        {!hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            NEW
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(p.id);
            toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md hover:bg-white hover:scale-110 transition-all"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              inWishlist ? "fill-red-500 text-red-500 scale-110" : "text-black"
            )}
          />
        </button>

        {/* Quick view — center on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-xl scale-50 group-hover:scale-100 transition-transform duration-300">
            <Eye className="h-6 w-6 text-black" />
          </div>
        </div>

        {/* Slide up "View Product" on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLoading(true);
              router.push(`/product/${p.slug}`);
              setLoading(false);
            }}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-black/90 backdrop-blur py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black"
          >
            <ShoppingBag className="h-4 w-4" /> View Product
          </button>
        </div>
      </div>

      {/* Product info — fixed height section, all cards equal */}
      <div className="flex flex-col flex-1 p-4">
        {/* Name — fixed height with line-clamp */}
        <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-black transition-colors min-h-[1.25rem]">
          {p.name}
        </h3>

        {/* Rating — fixed height */}
        <div className="mt-1.5 flex items-center gap-1 min-h-[1.25rem]">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{p.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
        </div>

        {/* Price — fixed height, always shows both lines */}
        <div className="mt-2 flex items-center gap-2 min-h-[1.5rem]">
          <span className="text-base font-black text-foreground">
            {formatCurrency(p.discountPrice ?? p.price)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(p.price)}
            </span>
          ) : (
            <span className="text-xs text-transparent">.</span>
          )}
        </div>

        {/* Save amount — fixed height, empty space if no discount */}
        <div className="mt-0.5 min-h-[1rem]">
          {hasDiscount ? (
            <p className="text-[10px] font-bold text-emerald-600">
              You save {formatCurrency(p.price - (p.discountPrice as number))}
            </p>
          ) : (
            <p className="text-[10px] text-transparent">.</p>
          )}
        </div>

        {/* Buy Now button — at bottom, always aligned */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/product/${p.slug}`);
          }}
          className="mt-3 w-full rounded-lg bg-black py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition-all hover:shadow-md"
        >
          Buy Now
        </button>
      </div>
    </Link>
  );
}
