import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/product-card";
import { SearchBox } from "@/components/storefront/search-box";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  let items: any[] = [];
  if (q) {
    const products = await db.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } },
          { category: { name: { contains: q } } },
          { category: { slug: { contains: q } } },
        ],
      },
      take: 24,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: { select: { size: true, color: true, colorHex: true } },
      },
    });
    items = products.map((p) => ({
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
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">Search</h1>
        <SearchBox initialQuery={q} />
      </div>

      {q ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {items.length > 0
              ? `Showing ${items.length} result${items.length === 1 ? "" : "s"} for "${q}"`
              : `No results for "${q}"`}
          </p>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-semibold">No matching products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try different keywords or browse our categories.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Link href="/tshirts" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">T-Shirts</Link>
                <Link href="/hoodies" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">Hoodies</Link>
                <Link href="/apparel" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">Apparel</Link>
                <Link href="/gym-wear" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">Gym Wear</Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg font-semibold">Search for products</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Find T-Shirts, Hoodies, Apparel and Gym Wear by name, description, or SKU.
          </p>
        </div>
      )}
    </div>
  );
}
