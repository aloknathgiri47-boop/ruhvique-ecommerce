import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { ProductsTableClient } from "@/components/admin/products-table-client";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const categorySlug = typeof sp.category === "string" ? sp.category : "";
  const active = sp.active as string | undefined;

  const where: any = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (categorySlug) where.category = { slug: categorySlug };
  if (active === "true") where.active = true;
  if (active === "false") where.active = false;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    discountPrice: p.discountPrice,
    active: p.active,
    featured: p.featured,
    bestseller: p.bestseller,
    newArrival: p.newArrival,
    trending: p.trending,
    categoryName: p.category.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    image: p.images[0]?.url ?? "",
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProductsTableClient products={items} categories={categories} />;
}
