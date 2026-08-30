import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET — returns current user's cart (DB-backed)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const cart = await db.cart.findFirst({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  });
  if (!cart) return NextResponse.json({ items: [] });
  return NextResponse.json({
    items: cart.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.images[0]?.url ?? "",
      price: i.product.discountPrice ?? i.product.price,
      originalPrice: i.product.price,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      stock: 99,
    })),
  });
}

// POST — add to cart (DB-backed if logged in)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, message: "Guest cart handled client-side" },
      { status: 200 }
    );
  }
  const body = await req.json();
  const { productId, size, color, quantity = 1 } = body;
  if (!productId || !size || !color) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  let cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: user.id } });
  }
  const existing = await db.cartItem.findUnique({
    where: {
      cartId_productId_size_color: {
        cartId: cart.id,
        productId,
        size,
        color,
      },
    },
  });
  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, size, color, quantity },
    });
  }
  return NextResponse.json({ ok: true });
}

// DELETE — clear cart
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: true });
  const cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return NextResponse.json({ ok: true });
}
