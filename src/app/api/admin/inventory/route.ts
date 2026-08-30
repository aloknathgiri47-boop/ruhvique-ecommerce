import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

// GET inventory: all products with their size/stock matrix
export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const lowStockOnly = url.searchParams.get("lowStock") === "true";
  const q = url.searchParams.get("q")?.trim();

  const where: any = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];

  const products = await db.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      variants: { select: { id: true, size: true, color: true, colorHex: true, stock: true } },
      category: { select: { name: true } },
    },
    take: 100,
  });

  let items = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    categoryName: p.category.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    variants: p.variants,
    lowStock: p.variants.some((v) => v.stock <= 5),
    outOfStock: p.variants.every((v) => v.stock === 0),
  }));

  if (lowStockOnly) items = items.filter((i) => i.lowStock);

  return NextResponse.json({ items });
}

// PUT — update stock for a specific variant
export async function PUT(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { variantId, stock } = body;
  if (!variantId || stock === undefined) {
    return NextResponse.json({ error: "Missing variantId or stock" }, { status: 400 });
  }
  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, Number(stock)) },
  });
  return NextResponse.json({ variant });
}
