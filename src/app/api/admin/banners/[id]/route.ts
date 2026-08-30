import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { title, subtitle, image, ctaText, ctaLink, displayOrder, active } = body;
  const banner = await db.banner.update({
    where: { id },
    data: {
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      displayOrder,
      active,
    },
  });
  return NextResponse.json({ banner });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
