// Fix the test product "Alok Giri" with realistic price
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const target = await db.product.findFirst({ where: { name: 'Alok Giri' } });
  if (!target) {
    console.log('Product "Alok Giri" not found');
    await db.$disconnect();
    return;
  }
  const updated = await db.product.update({
    where: { id: target.id },
    data: { price: 999 }
  });
  console.log(`Updated ${updated.name}: price now ₹${updated.price}`);

  // Verify all products look good
  const all = await db.product.findMany({
    select: { name: true, price: true, description: true },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`\nAll ${all.length} products:`);
  all.forEach(p => {
    const descOk = p.description && p.description.length >= 20 ? '✓' : '✗';
    const priceOk = p.price >= 100 ? '✓' : '✗';
    console.log(`  ${descOk}${priceOk} ${p.name} | ₹${p.price} | ${p.description?.substring(0, 40) || '(empty)'}...`);
  });

  await db.$disconnect();
})();
