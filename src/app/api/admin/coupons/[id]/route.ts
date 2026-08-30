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
  const { code, type, value, minOrder, maxDiscount, startDate, endDate, usageLimit, perUserLimit, active } = body;
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      code: code ? code.toUpperCase() : undefined,
      type,
      value: value !== undefined ? Number(value) : undefined,
      minOrder: minOrder !== undefined ? Number(minOrder) : undefined,
      maxDiscount: maxDiscount === null ? null : (maxDiscount !== undefined ? Number(maxDiscount) : undefined),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      usageLimit: usageLimit === null ? null : (usageLimit !== undefined ? Number(usageLimit) : undefined),
      perUserLimit: perUserLimit !== undefined ? Number(perUserLimit) : undefined,
      active,
    },
  });
  return NextResponse.json({ coupon });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
