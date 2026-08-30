import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const banners = await db.banner.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ items: banners });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, subtitle, image, ctaText, ctaLink, displayOrder, active } = body;
  if (!image) {
    return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
  }
  const banner = await db.banner.create({
    data: {
      title: (title && title.trim()) ? title.trim() : "Untitled Banner",
      subtitle: subtitle && subtitle.trim() ? subtitle.trim() : null,
      image,
      ctaText: ctaText || null,
      ctaLink: ctaLink || null,
      displayOrder: displayOrder ?? 0,
      active: active !== false,
    },
  });
  return NextResponse.json({ banner });
}
