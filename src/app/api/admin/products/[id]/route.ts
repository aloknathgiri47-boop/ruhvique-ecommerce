import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name, sku, categoryId, description, price, discountPrice, tax, featured, bestseller, newArrival, trending, active, variants, images } = body;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // SKU uniqueness check
  if (sku && sku !== existing.sku) {
    const other = await db.product.findUnique({ where: { sku } });
    if (other && other.id !== id) {
      return NextResponse.json({ error: "SKU already in use" }, { status: 400 });
    }
  }

  // Update base fields
  const updated = await db.product.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug: name ? `${slugify(name)}-${id.slice(-6)}` : existing.slug,
      sku: sku ?? existing.sku,
      categoryId: categoryId ?? existing.categoryId,
      description: description ?? existing.description,
      price: price !== undefined ? Number(price) : existing.price,
      discountPrice: discountPrice === null ? null : (discountPrice !== undefined ? Number(discountPrice) : existing.discountPrice),
      tax: tax !== undefined ? Number(tax) : existing.tax,
      featured: featured ?? existing.featured,
      bestseller: bestseller ?? existing.bestseller,
      newArrival: newArrival ?? existing.newArrival,
      trending: trending ?? existing.trending,
      active: active ?? existing.active,
    },
  });

  // Update variants if provided (replace strategy)
  if (Array.isArray(variants)) {
    await db.productVariant.deleteMany({ where: { productId: id } });
    if (variants.length > 0) {
      await db.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: Number(v.stock) || 0,
          sku: v.sku || null,
        })),
      });
    }
  }

  // Update images if provided (replace strategy)
  if (Array.isArray(images)) {
    await db.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await db.productImage.createMany({
        data: images.map((url: string, i: number) => ({
          productId: id,
          url,
          position: i,
          isPrimary: i === 0,
        })),
      });
    }
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  // Soft delete — mark inactive instead of hard delete
  await db.product.update({
    where: { id },
    data: { active: false },
  }).catch(() => null);
  return NextResponse.json({ ok: true });
}
