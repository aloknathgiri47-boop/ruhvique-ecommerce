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
  const user = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      addresses: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

// PUT — update customer status (block/unblock)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  if (!["ACTIVE", "BLOCKED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const user = await db.user.update({ where: { id }, data: { status } });
  return NextResponse.json({ user });
}
