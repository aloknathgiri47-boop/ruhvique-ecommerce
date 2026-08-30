import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/storefront/product-detail";
import { ProductCard } from "@/components/storefront/product-card";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });
  if (!product || !product.active) notFound();

  // Related products (same category, exclude self)
  const related = await db.product.findMany({
    where: { active: true, category: { slug: product.category.slug }, id: { not: product.id } },
    take: 4,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: { select: { size: true, color: true, colorHex: true } },
    },
  });
  const relatedItems = related.map((p) => ({
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
      <div className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <Link href={`/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <ProductDetail product={product} />
      </section>

      {relatedItems.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 py-12 border-t">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedItems.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
