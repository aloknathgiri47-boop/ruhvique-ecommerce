import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();
  if (!code) {
    return NextResponse.json({ valid: false, message: "Enter a coupon code" });
  }
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!coupon) {
    return NextResponse.json({ valid: false, message: "Invalid coupon code" });
  }
  if (!coupon.active) {
    return NextResponse.json({ valid: false, message: "Coupon is no longer active" });
  }
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return NextResponse.json({ valid: false, message: "Coupon has expired" });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, message: "Coupon usage limit reached" });
  }
  if (subtotal < coupon.minOrder) {
    return NextResponse.json({
      valid: false,
      message: `Minimum order amount is ₹${coupon.minOrder}`,
    });
  }
  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = Math.min(
      (subtotal * coupon.value) / 100,
      coupon.maxDiscount ?? Infinity
    );
  } else {
    discount = coupon.value;
  }
  return NextResponse.json({
    valid: true,
    discount: Math.round(discount),
    message: `Coupon applied — you saved ₹${Math.round(discount)}`,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
    },
  });
}
