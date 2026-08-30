"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Zap, Minus, Plus, Check, AlertCircle } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency, discountPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    discountPrice: number | null;
    description: string;
    rating: number;
    reviewCount: number;
    images: { id: string; url: string; alt?: string | null }[];
    variants: {
      id: string;
      size: string;
      color: string;
      colorHex: string | null;
      stock: number;
    }[];
    category: { name: string; slug: string };
  };
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE"];

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size)))
      .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)),
    [product.variants]
  );
  const colors = useMemo(
    () => Array.from(new Map(product.variants.map((v) => [v.color, v.colorHex])).entries()),
    [product.variants]
  );

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>(colors[0]?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const currentVariant = product.variants.find(
    (v) => v.size === size && v.color === color
  );
  const stock = currentVariant?.stock ?? 0;
  const inWishlist = has(product.id);

  const availableSizesForColor = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of product.variants) {
      if (v.color === color) map.set(v.size, (map.get(v.size) ?? 0) + v.stock);
    }
    return map;
  }, [product.variants, color]);

  const handleAddToCart = (buyNow = false) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    if (stock <= 0) {
      toast.error("Selected combination is out of stock");
      return;
    }
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? "",
      price: product.discountPrice ?? product.price,
      originalPrice: product.price,
      size,
      color,
      quantity: Math.min(qty, stock),
      stock,
    });
    toast.success(`${product.name} added to cart`);

    if (buyNow) {
      router.push("/checkout");
    }
  };

  const handleWishlist = async () => {
    if (!session) {
      toast.info("Please sign in to use wishlist");
      router.push("/signin?callbackUrl=/product/" + product.slug);
      return;
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: inWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        toggle(product.id);
        toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
      } else {
        toast.error("Failed to update wishlist");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image gallery */}
      <div className="flex flex-col-reverse lg:flex-row gap-3">
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 overflow-hidden rounded-md border-2 transition-colors",
                  activeImage === i ? "border-primary" : "border-border hover:border-foreground"
                )}
              >
                { }
                <img src={img.url} alt={img.alt || product.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {/* Main image */}
        <div className="flex-1">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted cursor-zoom-in"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={(e) => {
              const t = e.currentTarget;
              const r = t.getBoundingClientRect();
              const x = ((e.clientX - r.left) / r.width) * 100;
              const y = ((e.clientY - r.top) / r.height) * 100;
              t.style.setProperty("--x", `${x}%`);
              t.style.setProperty("--y", `${y}%`);
            }}
          >
            { }
            <img
              src={product.images[activeImage]?.url}
              alt={product.name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-200",
                zoomed && "scale-150"
              )}
              style={zoomed ? { transformOrigin: "var(--x) var(--y)" } : undefined}
            />
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                -{discountPercent(product.price, product.discountPrice)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product info */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.category.name}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">{product.name}</h1>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm">★</span>
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black">
            {formatCurrency(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <>
              <span className="text-base text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
              <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                {discountPercent(product.price, product.discountPrice)}% OFF
              </span>
            </>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {/* Color */}
        {colors.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Color</span>
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map(([name, hex]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setColor(name)}
                  aria-label={name}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-all",
                    color === name ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                  style={{ background: hex ?? "#ccc" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Size <span className="text-destructive">*</span></span>
            <span className="text-xs text-muted-foreground">Required</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const stockForSize = availableSizesForColor.get(s) ?? 0;
              const disabled = stockForSize === 0;
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-11 min-w-12 rounded-md border-2 px-3 text-sm font-medium transition-all relative",
                    selected && "border-primary bg-primary text-primary-foreground",
                    !selected && !disabled && "border-border hover:border-foreground",
                    disabled && "border-border opacity-40 line-through cursor-not-allowed"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {size && stock > 0 && stock <= 5 && (
            <p className="mt-2 text-xs text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Only {stock} left in stock!
            </p>
          )}
          {size && stock === 0 && (
            <p className="mt-2 text-xs text-destructive font-medium">Out of stock in this combination</p>
          )}
          {size && stock > 0 && (
            <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> In stock
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="mt-6">
          <span className="block text-sm font-semibold mb-2">Quantity</span>
          <div className="inline-flex items-center border border-border rounded-md">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 inline-flex items-center justify-center hover:bg-accent"
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={qty}
              readOnly
              className="h-10 w-12 text-center text-sm font-medium bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="h-10 w-10 inline-flex items-center justify-center hover:bg-accent"
              disabled={qty >= 10}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={() => handleAddToCart(false)}
            className="sm:col-span-1 h-12"
          >
            <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
          <Button
            size="lg"
            variant="default"
            onClick={() => handleAddToCart(true)}
            className="sm:col-span-1 h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            <Zap className="h-4 w-4 mr-2" /> Buy Now
          </Button>
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleWishlist}
            className="w-full h-12"
          >
            <Heart className={cn("h-4 w-4 mr-2", inWishlist && "fill-destructive text-destructive")} />
            {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center border-t pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Free Shipping</p>
            <p className="mt-1 text-[11px] text-muted-foreground">On orders over ₹1999</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Easy Returns</p>
            <p className="mt-1 text-[11px] text-muted-foreground">7-day return policy</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Secure Payment</p>
            <p className="mt-1 text-[11px] text-muted-foreground">100% protected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
