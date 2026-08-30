import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/format";

// GET — current user's orders
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: orders });
}

// POST — create order
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to place an order" },
      { status: 401 }
    );
  }
  const body = await req.json();
  const { items, address, paymentMethod = "COD", couponCode, notes } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!address?.name || !address?.phone || !address?.city || !address?.pincode) {
    return NextResponse.json(
      { error: "Incomplete shipping address" },
      { status: 400 }
    );
  }

  // Validate items & fetch product info
  const productIds = items.map((i: any) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: {
      variants: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let originalTotal = 0;
  const orderItemsData: any[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }
    const variant = product.variants.find(
      (v) => v.size === item.size && v.color === item.color
    );
    if (!variant) {
      // Try to find any variant with this size
      const sizeVariant = product.variants.find((v) => v.size === item.size);
      if (!sizeVariant) {
        return NextResponse.json(
          { error: `Size ${item.size} not available for ${product.name}` },
          { status: 400 }
        );
      }
      // Use the first available variant
      const firstVariant = product.variants[0];
      item.color = firstVariant.color;
      item.size = firstVariant.size;
    } else if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name} (${item.size}, ${item.color}). Only ${variant.stock} left.` },
        { status: 400 }
      );
    }
    const price = product.discountPrice ?? product.price;
    subtotal += price * item.quantity;
    originalTotal += product.price * item.quantity;
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price,
      originalPrice: product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    });
  }

  // Apply coupon
  let discount = 0;
  let usedCouponCode: string | null = null;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.active && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
      if (subtotal >= coupon.minOrder) {
        if (coupon.type === "PERCENTAGE") {
          discount = Math.min(
            (subtotal * coupon.value) / 100,
            coupon.maxDiscount ?? Infinity
          );
        } else {
          discount = coupon.value;
        }
        discount = Math.round(discount);
        usedCouponCode = coupon.code;
      }
    }
  }

  const shipping = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;

  // Create or find address
  let addressRecord = null;
  if (address.id) {
    addressRecord = await db.address.findFirst({
      where: { id: address.id, userId: user.id },
    });
  }
  if (!addressRecord) {
    addressRecord = await db.address.create({
      data: {
        userId: user.id,
        name: address.name,
        phone: address.phone,
        house: address.house || "",
        street: address.street || "",
        area: address.area || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || null,
      },
    });
  }

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      addressId: addressRecord.id,
      shipName: addressRecord.name,
      shipPhone: addressRecord.phone,
      shipAddress: `${addressRecord.house}, ${addressRecord.street}, ${addressRecord.area}`.replace(/, $/, ""),
      shipCity: addressRecord.city,
      shipState: addressRecord.state,
      shipPincode: addressRecord.pincode,
      shipLandmark: addressRecord.landmark,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      status: "ORDER_PLACED",
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
      paymentMethod,
      paymentId: paymentMethod !== "COD" ? `pay_${Date.now()}` : null,
      couponCode: usedCouponCode,
      notes: notes || null,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  // Decrement stock
  for (const item of items) {
    await db.productVariant.updateMany({
      where: {
        productId: item.productId,
        size: item.size,
        color: item.color,
      },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // Coupon usage
  if (usedCouponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: usedCouponCode } });
    if (coupon) {
      await db.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
      await db.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: user.id,
          orderId: order.id,
        },
      });
    }
  }

  // Clear user's cart (userId is not unique on Cart, use findFirst)
  const cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json({ order });
}
