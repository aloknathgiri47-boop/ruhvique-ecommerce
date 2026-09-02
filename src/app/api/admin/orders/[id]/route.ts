import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      address: true,
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

// PUT — update order status, tracking, shipping partner, payment status
// Auto-syncs payment status when order is cancelled or delivered.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { status, trackingNumber, shippingPartner, paymentStatus } = body;

  const update: any = {};
  if (status) update.status = status;
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber || null;
  if (shippingPartner !== undefined) update.shippingPartner = shippingPartner || null;
  if (paymentStatus) update.paymentStatus = paymentStatus;

  // Auto-sync payment status with order status for consistency
  if (status === "CANCELLED" && (!paymentStatus || paymentStatus === "PENDING" || paymentStatus === "PAID")) {
    update.paymentStatus = "REFUNDED";
  } else if (status === "DELIVERED" && (!paymentStatus || paymentStatus === "PENDING")) {
    update.paymentStatus = "PAID";
  }

  const order = await db.order.update({ where: { id }, data: update });
  return NextResponse.json({ order });
}
