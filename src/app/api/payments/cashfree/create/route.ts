import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentOrder } from "@/lib/cashfree";

// POST /api/payments/cashfree/create — create a Cashfree payment order
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to make payment" }, { status: 401 });
  }

  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });
    }

    // Verify order belongs to user
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create Cashfree payment order
    const result = await createPaymentOrder({
      orderId: order.orderNumber,
      orderAmount: order.total,
      customerName: customerName || order.shipName,
      customerEmail: customerEmail || user.email,
      customerPhone: customerPhone || order.shipPhone || "",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update order with payment ID
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentId: result.cf_order_id,
        paymentMethod: "CARD",
      },
    });

    return NextResponse.json({
      sessionId: result.payment_session_id,
      cfOrderId: result.cf_order_id,
      orderId: order.orderNumber,
      amount: order.total,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Payment creation failed" }, { status: 500 });
  }
}
