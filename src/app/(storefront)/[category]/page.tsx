import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/product-card";
import { FilterPanel } from "@/components/storefront/filter-panel";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

const VALID_SLUGS = ["tshirts", "apparel", "hoodies", "gym-wear"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { category: slug } = await params;
  if (!VALID_SLUGS.includes(slug)) notFound();

  const sp = await searchParams;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  // Build where
  const where: any = { active: true, category: { slug } };
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const sizes = typeof sp.sizes === "string" ? sp.sizes.split(",") : [];
  const colors = typeof sp.colors === "string" ? sp.colors.split(",") : [];
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const inStock = sp.availability === "in-stock";

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = [];
    if (minPrice !== undefined) where.AND.push({
      OR: [
        { discountPrice: { gte: minPrice } },
        { AND: [{ discountPrice: null }, { price: { gte: minPrice } }] }
      ]
    });
    if (maxPrice !== undefined) where.AND.push({
      OR: [
        { discountPrice: { lte: maxPrice } },
        { AND: [{ discountPrice: null }, { price: { lte: maxPrice } }] }
      ]
    });
  }
  if (sizes.length || colors.length || inStock) {
    where.variants = { some: {} };
    if (sizes.length) where.variants.some.size = { in: sizes };
    if (colors.length) where.variants.some.color = { in: colors };
    if (inStock) where.variants.some.stock = { gt: 0 };
  }

  const orderBy: any = (() => {
    switch (sort) {
      case "price_asc": return [{ discountPrice: "asc" }, { price: "asc" }];
      case "price_desc": return [{ discountPrice: "desc" }, { price: "desc" }];
      case "popular": return [{ rating: "desc" }, { reviewCount: "desc" }];
      case "rating": return [{ rating: "desc" }, { reviewCount: "desc" }];
      default: return [{ createdAt: "desc" }];
    }
  })();

  const page = Number(sp.page || 1);
  const limit = 12;
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: { select: { size: true, color: true, colorHex: true, stock: true } },
      },
    }),
  ]);
  const totalPages = Math.ceil(total / limit);

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    discountPrice: p.discountPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    sizes: Array.from(new Set(p.variants.map((v) => v.size))),
    colors: Array.from(new Set(p.variants.map((v) => v.color))),
    image: p.images[0]?.url ?? "",
  }));

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      <section className="container mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
        {/* Category header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? "product" : "products"}
            {category.description && ` · ${category.description}`}
          </p>
        </div>

        {/* Layout: Filters sidebar (left, sticky) + Products grid (right, 3 per row) */}
        <div className="flex gap-4">
          {/* Filters Sidebar - 280px sticky on desktop */}
          <FilterPanel category={slug} />

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-semibold">No products match your filters</p>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting or clearing your filters.</p>
                <Link
                  href={`/${slug}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop: 3 products per row grid (vertical scroll) */}
                {/* Mobile: 2 per row grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {items.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      const params = new URLSearchParams();
                      if (sp.sort) params.set("sort", String(sp.sort));
                      if (sp.sizes) params.set("sizes", String(sp.sizes));
                      if (sp.colors) params.set("colors", String(sp.colors));
                      if (sp.minPrice) params.set("minPrice", String(sp.minPrice));
                      if (sp.maxPrice) params.set("maxPrice", String(sp.maxPrice));
                      if (sp.availability) params.set("availability", String(sp.availability));
                      if (p > 1) params.set("page", String(p));
                      const href = `/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
                      return (
                        <Link
                          key={p}
                          href={href}
                          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm ${
                            p === page
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-accent"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
