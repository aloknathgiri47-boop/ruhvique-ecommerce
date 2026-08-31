import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST /api/orders/[id]/cancel — cancel an order (user can only cancel if not shipped yet)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const { id } = await params;
    const { reason } = await req.json().catch(() => ({ reason: null }));

    // Find order
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if order can be cancelled (only before shipped)
    const cancellableStatuses = ["ORDER_PLACED", "CONFIRMED", "PACKED"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage. It has already been shipped." },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const updated = await db.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
        notes: reason ? `Cancelled by customer: ${reason}` : "Cancelled by customer",
      },
    });

    // Restore stock for all items
    for (const item of order.items) {
      await db.productVariant.updateMany({
        where: {
          productId: item.productId,
          size: item.size,
          color: item.color,
        },
        data: { stock: { increment: item.quantity } },
      });
    }

    return NextResponse.json({ order: updated, message: "Order cancelled successfully" });
  } catch (error: any) {
    console.error("[cancel order] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
