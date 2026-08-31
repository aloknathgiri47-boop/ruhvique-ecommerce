import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentOrder } from "@/lib/cashfree";

// POST /api/payments/cashfree/create — create a Cashfree payment order
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to make payment" }, { status: 401 });
    }

    // Verify user exists in DB
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

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
      customerEmail: customerEmail || dbUser.email,
      customerPhone: customerPhone || order.shipPhone || "9999999999",
    });

    if (result.error) {
      console.error("[cashfree create] error:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update order with Cashfree order ID
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentId: String(result.cf_order_id),
      },
    });

    // Create payment record
    await db.payment.upsert({
      where: { orderId: order.id },
      update: {
        paymentId: String(result.cf_order_id),
        amount: order.total,
        gateway: "CASHFREE",
      },
      create: {
        orderId: order.id,
        paymentId: String(result.cf_order_id),
        amount: order.total,
        status: "PENDING",
        method: order.paymentMethod,
        gateway: "CASHFREE",
      },
    });

    return NextResponse.json({
      sessionId: result.payment_session_id,
      cfOrderId: result.cf_order_id,
      orderId: order.orderNumber,
      amount: order.total,
    });
  } catch (error: any) {
    console.error("[cashfree create] error:", error);
    return NextResponse.json(
      { error: error?.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
