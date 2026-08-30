import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const category = params.get("category");
  const sort = params.get("sort") || "newest";
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const sizes = params.get("sizes")?.split(",").filter(Boolean) ?? [];
  const colors = params.get("colors")?.split(",").filter(Boolean) ?? [];
  const inStock = params.get("availability") === "in-stock";
  const q = params.get("q")?.trim();
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(params.get("limit") || 12)));
  const featured = params.get("featured") === "true";
  const bestseller = params.get("bestseller") === "true";
  const newArrival = params.get("newArrival") === "true";
  const trending = params.get("trending") === "true";

  const where: any = { active: true };
  if (category) {
    where.category = { slug: category };
  }
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
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }
  if (featured) where.featured = true;
  if (bestseller) where.bestseller = true;
  if (newArrival) where.newArrival = true;
  if (trending) where.trending = true;

  const orderBy: any = (() => {
    switch (sort) {
      case "price_asc": return [{ discountPrice: "asc" }, { price: "asc" }];
      case "price_desc": return [{ discountPrice: "desc" }, { price: "desc" }];
      case "popular": return [{ rating: "desc" }, { reviewCount: "desc" }];
      case "rating": return [{ rating: "desc" }, { reviewCount: "desc" }];
      case "newest":
      default: return [{ createdAt: "desc" }];
    }
  })();

  const [total, items] = await Promise.all([
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

  return NextResponse.json({
    items: items.map((p) => {
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
        colors,
        image: p.images[0]?.url ?? "",
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
