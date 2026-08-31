import Link from "next/link";
import { db } from "@/lib/db";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductCard } from "@/components/storefront/product-card";

export const dynamic = "force-dynamic";
import {
  ArrowRight,
  Sparkles,
  Star,
  Leaf,
  Instagram,
  Mail,
  Scissors,
  Package,
  ThumbsUp,
} from "lucide-react";
import { placeholderImage } from "@/lib/placeholder";

async function getProductsByFlag(flag: "newArrival" | "bestseller" | "trending", take = 8) {
  const items = await db.product.findMany({
    where: { active: true, [flag]: true },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: { select: { size: true, color: true, colorHex: true, stock: true } },
    },
  });
  return items.map((p) => {
    const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
    const colors = Array.from(
      new Map(p.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()
    );
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sizes,
      colors: colors.map((c) => c.name),
      image: p.images[0]?.url ?? "",
    };
  });
}

export default async function HomePage() {
  const [banners, categories, newArrivals, bestSellers, trending, allProducts] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    db.category.findMany({ where: { active: true }, orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    getProductsByFlag("newArrival"),
    getProductsByFlag("bestseller"),
    getProductsByFlag("trending"),
    db.product.findMany({
      where: { active: true },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: 6,
    }),
  ]);

  // Real product images for Instagram strip
  const instagramImages = allProducts.map((p) => p.images[0]?.url ?? "").filter(Boolean).slice(0, 6);

  return (
    <>
      <HeroBanner banners={banners} />

      {/* Categories */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((c, idx) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-muted ru-tilt"
            >
              <img
                src={c.image || placeholderImage(c.name, 600, 750, idx)}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="text-white font-black text-lg sm:text-xl tracking-wide">
                  {c.name}
                </h3>
                <p className="mt-0.5 text-xs text-white/60">
                  {c._count.products} products
                </p>
                <p className="mt-1 text-xs text-white/80 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </p>
              </div>
              <div className="absolute top-3 left-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <ProductRow title="New Arrivals" subtitle="" products={newArrivals} href="/tshirts?sort=newest" badge="NEW" />

      {/* Promotional section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tshirts"
                className="ru-btn-shine inline-flex items-center gap-2 bg-primary-foreground text-primary px-7 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/90 transition-colors"
              >
                Shop T-Shirts <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hoodies"
                className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground px-7 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/10 transition-colors"
              >
                Shop Hoodies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <ProductRow title="Best Sellers" subtitle="" products={bestSellers} href="/tshirts?sort=popular" badge="HOT" />

      {/* Trending */}
      <ProductRow title="Trending Now" subtitle="" products={trending} href="/tshirts?sort=popular" badge="TRENDING" />

      {/* Newsletter Signup */}
      <section className="bg-primary text-primary-foreground">
        <div className="px-4 sm:px-6 max-w-3xl mx-auto py-16 sm:py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10 mb-5 ru-float">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Join the Ruhvique circle
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/70 max-w-md mx-auto">
            Be the first to know about new drops, exclusive offers, and early access. No spam, just good fits.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 h-12 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
            />
            <button
              type="submit"
              className="ru-btn-shine h-12 px-6 rounded-md bg-primary-foreground text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-[11px] text-primary-foreground/50">
            By subscribing you agree to our Privacy Policy
          </p>
        </div>
      </section>

      {/* Instagram / Social strip — using real product images */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Follow us</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight inline-flex items-center gap-2">
            <Instagram className="h-6 w-6" /> @ruhvique
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Tag us in your fits — #RuhviqueFam</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {instagramImages.map((img, i) => (
            <Link
              key={i}
              href="/tshirts"
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted ru-zoom"
            >
              { }
              <img
                src={img}
                alt={`Ruhvique product ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductRow({
  title,
  subtitle,
  products,
  href,
  badge,
}: {
  title: string;
  subtitle: string;
  products: any[];
  href: string;
  badge?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ru-pulse-glow">
                {badge}
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{subtitle}</p>
          </div>
          <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight">{title}</h2>
        </div>
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all ru-underline-anim"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {/* Mobile: horizontal scroll | Desktop: grid */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto ru-no-scrollbar pb-2 sm:pb-0 sm:overflow-visible snap-x snap-mandatory">
        {products.slice(0, 8).map((p) => (
          <div key={p.id} className="flex-shrink-0 w-[60%] xs:w-[45%] sm:w-auto snap-start">
            <ProductCard p={p} />
          </div>
        ))}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
