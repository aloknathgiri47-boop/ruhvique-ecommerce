// Ruhvique seed — creates admin user, categories, sample products, banners, coupons.
// Run with: bun run scripts/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { placeholderImage, bannerImage } from "../src/lib/placeholder";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Ruhvique...");

  // 1. Admin user
  const adminPass = await bcrypt.hash("@Ruhvique786", 10);
  const admin = await db.admin.upsert({
    where: { email: "info.ruhvique@gmail.com" },
    update: {},
    create: {
      email: "info.ruhvique@gmail.com",
      name: "Ruhvique Admin",
      password: adminPass,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Admin:", admin.email);

  // 2. Demo customer
  const custPass = await bcrypt.hash("customer123", 10);
  const customer = await db.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      name: "Demo Customer",
      password: custPass,
      phone: "9876543210",
    },
  });
  console.log("✓ Customer:", customer.email);

  // 3. Categories
  const categories = await Promise.all(
    [
      { name: "T-Shirts", slug: "tshirts", description: "Premium quality tees." },
      { name: "Apparel", slug: "apparel", description: "Everyday essentials & shirts." },
      { name: "Hoodies", slug: "hoodies", description: "Cozy hoodies & sweatshirts." },
      { name: "Gym Wear", slug: "gym-wear", description: "Performance-driven activewear." },
    ].map((c) =>
      db.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  console.log("✓ Categories:", categories.map((c) => c.name).join(", "));

  // 4. Products — 6 per category = 24 total
  const SIZES = ["S", "M", "L", "XL", "XXL"];
  const COLORS = [
    { name: "Black", hex: "#0a0a0a" },
    { name: "White", hex: "#ffffff" },
    { name: "Grey", hex: "#9ca3af" },
    { name: "Navy", hex: "#1e293b" },
  ];

  const productSeeds: { name: string; cat: string; price: number; discount?: number; desc: string }[] = [
    // T-Shirts
    { name: "Oversized Boxy Tee Noir", cat: "tshirts", price: 1299, discount: 899, desc: "Heavyweight 240gsm cotton oversized tee with boxy fit." },
    { name: "Minimal Logo Tee White", cat: "tshirts", price: 999, desc: "Soft pima cotton tee with subtle RUHVIQUE chest logo." },
    { name: "Vintage Wash Tee Charcoal", cat: "tshirts", price: 1199, discount: 799, desc: "Vintage-washed cotton tee with relaxed fit." },
    { name: "Streetwear Heavy Tee Black", cat: "tshirts", price: 1499, desc: "Dense heavyweight cotton built for layering." },
    { name: "Graphic Print Tee Bone", cat: "tshirts", price: 1399, discount: 999, desc: "Bone-white tee with all-over graphic print." },
    { name: "Longline Asym Tee Onyx", cat: "tshirts", price: 1599, desc: "Asymmetric longline tee in onyx black." },
    // Apparel
    { name: "Linen Button-up Shirt", cat: "apparel", price: 2199, discount: 1499, desc: "Breathable linen shirt with mother-of-pearl buttons." },
    { name: "Oxford Shirt Sky", cat: "apparel", price: 1899, desc: "Classic oxford-cotton shirt in sky blue." },
    { name: "Cargo Pants Khaki", cat: "apparel", price: 2499, discount: 1799, desc: "Tapered cargo pants with utility pockets." },
    { name: "Wide-Leg Trousers Black", cat: "apparel", price: 2299, desc: "Pleated wide-leg trousers in premium wool-blend." },
    { name: "Denim Jacket Indigo", cat: "apparel", price: 2999, discount: 2199, desc: "Selvedge denim jacket with raw hem." },
    { name: "Tech Windbreaker", cat: "apparel", price: 3499, desc: "Water-repellent windbreaker with taped seams." },
    // Hoodies
    { name: "Heavyweight Hoodie Black", cat: "hoodies", price: 2499, discount: 1799, desc: "500gsm fleece hoodie with double-lined hood." },
    { name: "Zip Hoodie Grey", cat: "hoodies", price: 2299, desc: "Full-zip fleece hoodie in heather grey." },
    { name: "Oversized Hoodie Cream", cat: "hoodies", price: 2699, discount: 1999, desc: "Boxy oversized hoodie in cream tone." },
    { name: "Graphic Pullover Hoodie", cat: "hoodies", price: 2599, desc: "Pullover hoodie with back graphic print." },
    { name: "Cropped Hoodie Onyx", cat: "hoodies", price: 2199, discount: 1599, desc: "Cropped silhouette hoodie in onyx." },
    { name: "Tech Fleece Hoodie Noir", cat: "hoodies", price: 3199, desc: "Technical fleece hoodie with bonded seams." },
    // Gym Wear
    { name: "Performance Tee Carbon", cat: "gym-wear", price: 1299, discount: 899, desc: "Moisture-wicking performance tee with raglan sleeves." },
    { name: "Compression Leggings Black", cat: "gym-wear", price: 1799, desc: "Four-way stretch compression leggings." },
    { name: "Mesh Training Shorts", cat: "gym-wear", price: 1199, discount: 799, desc: "Lightweight mesh training shorts with liner." },
    { name: "Training Joggers Onyx", cat: "gym-wear", price: 1899, desc: "Tapered training joggers with zip pockets." },
    { name: "Performance Tank White", cat: "gym-wear", price: 999, discount: 699, desc: "Drop-arm training tank in performance mesh." },
    { name: "Cross-training Hoodie", cat: "gym-wear", price: 2299, desc: "Athletic-fit hoodie engineered for cross-training." },
  ];

  let idx = 0;
  for (const cat of categories) {
    const seeds = productSeeds.filter((s) => s.cat === cat.slug);
    for (const seed of seeds) {
      const slug = `${cat.slug}-${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      const existing = await db.product.findUnique({ where: { slug } });
      if (existing) {
        idx++;
        continue;
      }
      const product = await db.product.create({
        data: {
          name: seed.name,
          slug,
          sku: `RUH-${cat.slug.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, "0")}`,
          description: seed.desc,
          price: seed.price,
          discountPrice: seed.discount ?? null,
          tax: 5,
          categoryId: cat.id,
          featured: idx % 5 === 0,
          bestseller: idx % 4 === 0,
          newArrival: idx % 3 === 0,
          trending: idx % 6 === 0,
          rating: 4 + ((idx % 10) / 10),
          reviewCount: 5 + (idx * 3) % 50,
        },
      });

      // Variants — 5 sizes x 4 colors = 20 variants per product
      for (const size of SIZES) {
        for (const color of COLORS) {
          await db.productVariant.create({
            data: {
              productId: product.id,
              size,
              color: color.name,
              colorHex: color.hex,
              stock: Math.floor(Math.random() * 30) + (size === "XXL" ? 0 : 3),
              sku: `${product.sku}-${size}-${color.name.slice(0, 3).toUpperCase()}`,
            },
          });
        }
      }

      // Images — 4 per product using placeholder
      for (let i = 0; i < 4; i++) {
        await db.productImage.create({
          data: {
            productId: product.id,
            url: placeholderImage(`${seed.name} ${i + 1}`, 800, 1000, idx + i),
            alt: `${seed.name} view ${i + 1}`,
            position: i,
            isPrimary: i === 0,
          },
        });
      }

      idx++;
    }
  }
  console.log(`✓ Products: 24 seeded`);

  // 5. Banners
  const banners = [
    { title: "Winter Drop 2026", subtitle: "Premium heavyweight essentials", cta: "Shop Now", link: "/hoodies" },
    { title: "New Arrivals", subtitle: "Fresh streetwear silhouettes", cta: "Explore", link: "/tshirts" },
    { title: "Train Hard", subtitle: "Engineered gym wear collection", cta: "Train With Us", link: "/gym-wear" },
  ];
  for (let i = 0; i < banners.length; i++) {
    const b = banners[i];
    await db.banner.create({
      data: {
        title: b.title,
        subtitle: b.subtitle,
        image: bannerImage(b.title, b.subtitle, 1600, 700),
        ctaText: b.cta,
        ctaLink: b.link,
        displayOrder: i,
        active: true,
      },
    });
  }
  console.log(`✓ Banners: ${banners.length} seeded`);

  // 6. Coupon
  await db.coupon.upsert({
    where: { code: "RUHVIQUE10" },
    update: {},
    create: {
      code: "RUHVIQUE10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 999,
      maxDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      usageLimit: 1000,
      perUserLimit: 1,
      active: true,
    },
  });
  await db.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      type: "FLAT",
      value: 200,
      minOrder: 1500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      usageLimit: 1000,
      perUserLimit: 1,
      active: true,
    },
  });
  console.log("✓ Coupons: 2 seeded");

  console.log("🎉 Seed complete!");
  console.log("");
  console.log("Login as admin:");
  console.log("  Email:    info.ruhvique@gmail.com");
  console.log("  Password: @Ruhvique786");
  console.log("");
  console.log("Login as customer:");
  console.log("  Email:    customer@demo.com");
  console.log("  Password: customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
