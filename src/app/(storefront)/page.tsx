import Link from "next/link";
import { db } from "@/lib/db";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductCard } from "@/components/storefront/product-card";
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Sparkles,
  Star,
  Award,
  Leaf,
  Instagram,
  Mail,
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

      {/* Trust Badges */}
      <section className="border-b bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over ₹1,999" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: Shield, title: "Secure Payment", desc: "100% protected checkout" },
              { icon: Award, title: "Premium Quality", desc: "Crafted to last" },
            ].map((b, i) => (
              <div
                key={b.title}
                className="flex items-center gap-3 ru-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/5 text-primary flex-shrink-0 ru-float" style={{ animationDelay: `${i * 0.3}s` }}>
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Browse</p>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Shop by <span className="ru-gradient-text">Category</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Curated collections for every look</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((c, idx) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-muted ru-tilt"
            >
              { }
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
                <p className="mt-1 text-xs text-white/80 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </p>
              </div>
              {/* Number badge */}
              <div className="absolute top-3 left-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <ProductRow title="New Arrivals" subtitle="Fresh drops every week" products={newArrivals} href="/tshirts?sort=newest" badge="NEW" />

      {/* Promotional section with stats */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative container mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-4 inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Ruhvique Promise
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Premium fabric.
              <br />
              <span className="text-primary-foreground/60">Uncompromising fit.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-primary-foreground/70 leading-relaxed">
              Every piece is crafted with heavyweight fabrics, reinforced seams, and a fit that holds its shape — wash after wash. We don&apos;t cut corners, we cut silhouettes.
            </p>
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

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "240gsm", label: "Heavyweight cotton" },
              { value: "10K+", label: "Happy customers" },
              { value: "4.8★", label: "Average rating" },
              { value: "48h", label: "Quick dispatch" },
            ].map((s, i) => (
              <div key={i} className="text-center ru-count" style={{ animationDelay: `${i * 0.15}s` }}>
                <p className="text-3xl sm:text-4xl font-black">{s.value}</p>
                <p className="mt-1 text-xs text-primary-foreground/60 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <ProductRow title="Best Sellers" subtitle="Loved by thousands of customers" products={bestSellers} href="/tshirts?sort=popular" badge="HOT" />

      {/* Testimonial / Quote section */}
      <section className="bg-secondary/50">
        <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-20 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
            &ldquo;The quality is unreal for the price.
            <br />
            <span className="text-muted-foreground">Heavyweight cotton that actually holds its shape.&rdquo;</span>
          </blockquote>
          <p className="mt-6 text-sm font-semibold">— Arjun M., Bengaluru</p>
          <p className="text-xs text-muted-foreground">Verified buyer · 3 orders</p>
        </div>
      </section>

      {/* Trending */}
      <ProductRow title="Trending Now" subtitle="What everyone's wearing" products={trending} href="/tshirts?sort=popular" badge="TRENDING" />

      {/* Newsletter Signup */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20 text-center">
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

      {/* Instagram / Social strip */}
      <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Follow us</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight inline-flex items-center gap-2">
            <Instagram className="h-6 w-6" /> @ruhvique
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link
              key={i}
              href="#"
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted ru-zoom"
            >
              { }
              <img
                src={placeholderImage(`RUHVIQUE ${i + 1}`, 300, 300, i + 10)}
                alt={`Instagram post ${i + 1}`}
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
    <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
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
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto ru-no-scrollbar pb-2 sm:pb-0 -mx-4 px-4 snap-x snap-mandatory">
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
