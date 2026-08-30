import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name, description, image, active } = body;
  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const update: any = { description, image, active };
  if (name && name !== existing.name) {
    update.name = name;
    update.slug = slugify(name);
  }
  const category = await db.category.update({ where: { id }, data: update });
  return NextResponse.json({ category });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  // Check if category has products
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${productCount} products belong to this category` },
      { status: 400 }
    );
  }
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
