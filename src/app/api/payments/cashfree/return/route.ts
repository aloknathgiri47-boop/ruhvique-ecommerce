import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/cashfree";

// GET /api/payments/cashfree/return — handle redirect after payment
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const cfOrderId = url.searchParams.get("cf_order_id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/account?payment=error", req.url));
  }

  // Verify payment with Cashfree
  const verification = await verifyPayment(orderId);

  if (verification.error) {
    return NextResponse.redirect(new URL(`/account?payment=error&order=${orderId}`, req.url));
  }

  // Find order by orderNumber
  const order = await db.order.findUnique({
    where: { orderNumber: orderId },
  });

  if (!order) {
    return NextResponse.redirect(new URL("/account?payment=error", req.url));
  }

  // Update order based on payment status
  const paymentStatus = verification.order_status?.toUpperCase() || verification.payment_status?.toUpperCase();

  if (paymentStatus === "PAID" || paymentStatus === "ACTIVE") {
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentId: cfOrderId || verification.cf_order_id || order.paymentId,
        status: "CONFIRMED",
      },
    });

    // Create payment record
    await db.payment.upsert({
      where: { orderId: order.id },
      update: {
        status: "PAID",
        paymentId: cfOrderId || verification.cf_order_id,
        gateway: "CASHFREE",
      },
      create: {
        orderId: order.id,
        paymentId: cfOrderId || verification.cf_order_id,
        amount: order.total,
        status: "PAID",
        method: order.paymentMethod,
        gateway: "CASHFREE",
      },
    });

    return NextResponse.redirect(new URL(`/account/orders/${order.id}?payment=success`, req.url));
  } else {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });

    return NextResponse.redirect(new URL(`/account/orders/${order.id}?payment=failed`, req.url));
  }
}
