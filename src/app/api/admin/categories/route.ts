import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ items: categories });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, description, image, active } = body;
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const slug = slugify(name);
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 400 });
  const category = await db.category.create({
    data: { name, slug, description, image, active: active !== false },
  });
  return NextResponse.json({ category });
}
