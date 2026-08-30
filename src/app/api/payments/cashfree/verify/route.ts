import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/cashfree";

// GET /api/payments/cashfree/verify?order_id=XXX — verify payment status
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const result = await verifyPayment(orderId);
  return NextResponse.json(result);
}
