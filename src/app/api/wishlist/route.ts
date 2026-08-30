import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET — current user's wishlist (with product details)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const wishlist = await db.wishlist.findUnique({
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
  if (!wishlist) return NextResponse.json({ items: [] });
  return NextResponse.json({
    items: wishlist.items.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      slug: i.product.slug,
      price: i.product.discountPrice ?? i.product.price,
      originalPrice: i.product.price,
      image: i.product.images[0]?.url ?? "",
      inStock: true,
    })),
  });
}

// POST — add to wishlist
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to use wishlist" },
      { status: 401 }
    );
  }
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  let wishlist = await db.wishlist.findUnique({ where: { userId: user.id } });
  if (!wishlist) {
    wishlist = await db.wishlist.create({ data: { userId: user.id } });
  }
  try {
    await db.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
  } catch {
    // already exists — ignore
  }
  return NextResponse.json({ ok: true });
}

// DELETE — remove from wishlist (body: { productId })
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId } = await req.json();
  const wishlist = await db.wishlist.findUnique({ where: { userId: user.id } });
  if (!wishlist) return NextResponse.json({ ok: true });
  await db.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });
  return NextResponse.json({ ok: true });
}
