// Shift 3 trending products up to Best Sellers so the Best Sellers row
// becomes complete (4+4) instead of (4+1).
// After this shift, Trending will have 1 product left, which we hide via
// the ProductRow component (products.length < 4 → return null).
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  // Get up to 3 trending products that are NOT already bestsellers
  const candidates = await db.product.findMany({
    where: { active: true, trending: true, bestseller: false },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, name: true, trending: true, bestseller: true },
  });

  console.log(`Found ${candidates.length} trending products to shift:`);
  candidates.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`));

  if (candidates.length === 0) {
    console.log('Nothing to shift. Exiting.');
    await db.$disconnect();
    return;
  }

  // Shift them: trending=false, bestseller=true
  const ids = candidates.map((p) => p.id);
  const result = await db.product.updateMany({
    where: { id: { in: ids } },
    data: { trending: false, bestseller: true },
  });

  console.log(`\nUpdated ${result.count} products.`);

  // Verify new counts
  const newArrival = await db.product.count({ where: { active: true, newArrival: true } });
  const bestseller = await db.product.count({ where: { active: true, bestseller: true } });
  const trending = await db.product.count({ where: { active: true, trending: true } });
  console.log('\nNew counts:');
  console.log('  newArrival :', newArrival, '→', Math.ceil(newArrival / 4), 'rows');
  console.log('  bestseller :', bestseller, '→', Math.ceil(bestseller / 4), 'rows');
  console.log('  trending   :', trending, '→', Math.ceil(trending / 4), 'rows');

  await db.$disconnect();
})();
