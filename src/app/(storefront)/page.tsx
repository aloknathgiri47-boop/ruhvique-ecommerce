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
      <ProductRow title="" subtitle="" products={newArrivals} href="/tshirts?sort=newest" />

      {/* Best Sellers */}
      <ProductRow title="" subtitle="" products={bestSellers} href="/tshirts?sort=popular" />

      {/* Trending */}
      <ProductRow title="" subtitle="" products={trending} href="/tshirts?sort=popular" />
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
    <section className="px-4 sm:px-6 py-8 sm:py-10">
      {title && (
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              {badge && (
                <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ru-pulse-glow">
                  {badge}
                </span>
              )}
              {subtitle && <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{subtitle}</p>}
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
      )}
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
