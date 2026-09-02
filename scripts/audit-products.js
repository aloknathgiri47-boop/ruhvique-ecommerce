// Audit all products for stray/empty/minimal descriptions and fix them
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const products = await db.product.findMany({
    select: {
      id: true, name: true, description: true, price: true,
      discountPrice: true, sku: true,
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total products: ${products.length}\n`);

  // Products with bad descriptions (too short or generic)
  const bad = products.filter(p =>
    !p.description ||
    p.description.trim().length < 10 ||
    /^(best|good|test|placeholder|na|n\/?a|tbd|lorem)$/i.test(p.description.trim())
  );
  console.log(`Products with bad descriptions: ${bad.length}`);
  bad.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} | category=${p.category.name} | price=${p.price} | desc="${p.description}"`);
  });

  // Generate proper descriptions for bad ones
  const DESC_TEMPLATES = {
    'T-Shirts': 'Premium {name} crafted from heavyweight combed cotton with a structured fit. Built to last with reinforced shoulder seams, ribbed crew neckline, and a soft hand-feel. Pre-shrunk fabric retains shape wash after wash.',
    'Hoodies': 'Heavyweight {name} in brushed-back fleece for warmth and structure. Features a relaxed fit, kangaroo pocket, adjustable hood with flat drawcords, and ribbed cuffs. Premium fabric stays soft wash after wash.',
    'Apparel': 'Tailored {name} with a clean modern silhouette. Mid-weight breathable fabric with a refined drape. Finished with reinforced seams, branded trims, and a comfortable regular fit that transitions effortlessly from day to evening.',
    'Gym Wear': 'Performance {name} engineered with four-way stretch moisture-wicking fabric. Lightweight, breathable, and built to move — flatlock seams prevent chafing, quick-dry technology keeps you cool through every rep.',
  };

  console.log('\n--- Fixing descriptions ---');
  let fixed = 0;
  for (const p of bad) {
    const catName = p.category.name in DESC_TEMPLATES ? p.category.name : 'Apparel';
    const template = DESC_TEMPLATES[catName];
    const newDesc = template.replace('{name}', p.name);
    await db.product.update({
      where: { id: p.id },
      data: { description: newDesc }
    });
    fixed++;
    console.log(`  Fixed: ${p.name}`);
  }
  console.log(`\nTotal fixed: ${fixed}`);

  // Also check for products with price <= 0 or unrealistic prices (₹1, ₹10, etc.)
  const lowPrice = products.filter(p => p.price < 100);
  console.log(`\nProducts with price < ₹100: ${lowPrice.length}`);
  lowPrice.forEach(p => console.log(`  - ${p.name} | ₹${p.price}`));

  await db.$disconnect();
})();
