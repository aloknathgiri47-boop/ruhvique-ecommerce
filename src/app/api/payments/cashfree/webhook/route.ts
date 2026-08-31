import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/cashfree";

// POST /api/payments/cashfree/webhook — handle Cashfree webhook notifications
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-cf-signature") || "";

    // Verify webhook signature (simplified)
    if (!verifyWebhookSignature(signature, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const orderId = data.order_id;
    const paymentStatus = data.order_status?.toUpperCase() || data.payment_status?.toUpperCase();

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order based on webhook status
    if (paymentStatus === "PAID") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: order.status === "ORDER_PLACED" ? "CONFIRMED" : order.status,
          paymentId: data.cf_order_id || order.paymentId,
        },
      });

      await db.payment.upsert({
        where: { orderId: order.id },
        update: {
          status: "PAID",
          paymentId: data.cf_order_id,
          gateway: "CASHFREE",
        },
        create: {
          orderId: order.id,
          paymentId: data.cf_order_id,
          amount: order.total,
          status: "PAID",
          method: order.paymentMethod,
          gateway: "CASHFREE",
        },
      });
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Webhook processing failed" }, { status: 500 });
  }
}
