import Link from "next/link";
import { db } from "@/lib/db";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductCard } from "@/components/storefront/product-card";
import { ArrowRight } from "lucide-react";
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
  const [banners, categories, newArrivals, bestSellers, trending] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    db.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getProductsByFlag("newArrival"),
    getProductsByFlag("bestseller"),
    getProductsByFlag("trending"),
  ]);

  return (
    <>
      <HeroBanner banners={banners} />

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Curated collections for every look</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((c, idx) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[4/5] bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || placeholderImage(c.name, 600, 750, idx)}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
                  {c.name}
                </h3>
                <p className="mt-1 text-[10px] sm:text-xs text-white/80 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <ProductRow title="New Arrivals" subtitle="Fresh drops every week" products={newArrivals} href="/tshirts?sort=newest" />

      {/* Promotional section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-14 sm:py-20 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-3">Ruhvique Promise</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Premium fabric. Uncompromising fit.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-primary-foreground/70">
            Every piece is crafted with heavyweight fabrics, reinforced seams, and a fit that holds its shape — wash after wash. We don&apos;t cut corners, we cut silhouettes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tshirts"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/90"
            >
              Shop T-Shirts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hoodies"
              className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/10"
            >
              Shop Hoodies
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <ProductRow title="Best Sellers" subtitle="Loved by thousands of customers" products={bestSellers} href="/tshirts?sort=popular" />

      {/* Trending */}
      <ProductRow title="Trending Now" subtitle="What everyone&apos;s wearing" products={trending} href="/tshirts?sort=popular" />
    </>
  );
}

function ProductRow({
  title,
  subtitle,
  products,
  href,
}: {
  title: string;
  subtitle: string;
  products: any[];
  href: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} p={p} />
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
