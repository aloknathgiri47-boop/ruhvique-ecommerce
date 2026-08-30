import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items: addresses });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await db.address.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, phone, house, street, area, city, state, pincode, landmark, isDefault } = body;
  if (!name || !phone || !city || !state || !pincode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (isDefault) {
    await db.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }
  const address = await db.address.create({
    data: {
      userId: user.id,
      name,
      phone,
      house: house || "",
      street: street || "",
      area: area || "",
      city,
      state,
      pincode,
      landmark: landmark || null,
      isDefault: !!isDefault,
    },
  });
  return NextResponse.json({ address });
}
