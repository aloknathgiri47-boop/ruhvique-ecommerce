import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

// PUT — mark as read or reply
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { status, adminReply } = body;
  const update: any = {};
  if (status) update.status = status;
  if (adminReply !== undefined) {
    update.adminReply = adminReply;
    if (adminReply) update.status = "REPLIED";
  }
  const message = await db.contactMessage.update({ where: { id }, data: update });
  return NextResponse.json({ message });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
