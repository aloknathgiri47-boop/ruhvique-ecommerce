import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items: coupons });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { code, type, value, minOrder, maxDiscount, startDate, endDate, usageLimit, perUserLimit, active } = body;
  if (!code || !type || value === undefined || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
  const coupon = await db.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: Number(perUserLimit) || 1,
      active: active !== false,
    },
  });
  return NextResponse.json({ coupon });
}
