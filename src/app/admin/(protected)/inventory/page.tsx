import { db } from "@/lib/db";
import { InventoryClient } from "@/components/admin/inventory-client";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const lowStockOnly = sp.lowStock === "true";

  const where: any = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];

  const products = await db.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      variants: { select: { id: true, size: true, color: true, colorHex: true, stock: true } },
      category: { select: { name: true } },
    },
    take: 200,
  });

  let items = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    categoryName: p.category.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    variants: p.variants,
    lowStock: p.variants.some((v) => v.stock <= 5),
    outOfStock: p.variants.length > 0 && p.variants.every((v) => v.stock === 0),
  }));

  if (lowStockOnly) items = items.filter((i) => i.lowStock);

  return <InventoryClient items={JSON.parse(JSON.stringify(items))} initialQuery={q} lowStockOnly={lowStockOnly} />;
}
