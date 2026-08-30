import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";

// GET — list products (admin)
export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const active = url.searchParams.get("active");
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));

  const where: any = {};
  if (q) where.OR = [
    { name: { contains: q } },
    { sku: { contains: q } },
  ];
  if (category) where.category = { slug: category };
  if (active === "true") where.active = true;
  if (active === "false") where.active = false;

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items: items.map((p) => ({
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
      rating: p.rating,
      reviewCount: p.reviewCount,
      categoryName: p.category.name,
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
      createdAt: p.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST — create product
export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, sku, categoryId, description, price, discountPrice, tax, variants, images, featured, bestseller, newArrival, trending, active } = body;

  if (!name || !sku || !categoryId || !description || price === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check SKU uniqueness
  const existing = await db.product.findUnique({ where: { sku } });
  if (existing) {
    return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
  }

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const product = await db.product.create({
    data: {
      name,
      slug,
      sku,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      tax: tax ? Number(tax) : 0,
      categoryId,
      featured: !!featured,
      bestseller: !!bestseller,
      newArrival: !!newArrival,
      trending: !!trending,
      active: active !== false,
      variants: variants?.length ? {
        create: variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: Number(v.stock) || 0,
          sku: v.sku || null,
        })),
      } : undefined,
      images: images?.length ? {
        create: images.map((img: string, i: number) => ({
          url: img,
          position: i,
          isPrimary: i === 0,
        })),
      } : undefined,
    },
    include: { variants: true, images: true },
  });

  return NextResponse.json({ product });
}
