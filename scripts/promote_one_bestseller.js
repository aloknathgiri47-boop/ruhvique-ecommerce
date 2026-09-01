// Promote 1 more product to bestseller so Best Sellers row = 8 (complete 4+4)
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  // Pick Oxford Shirt Sky (no flags currently) and promote to bestseller
  const target = await db.product.findFirst({
    where: { active: true, name: 'Oxford Shirt Sky' },
    select: { id: true, name: true, bestseller: true },
  });

  if (!target) {
    console.log('Oxford Shirt Sky not found, picking any non-bestseller...');
    const fallback = await db.product.findFirst({
      where: { active: true, bestseller: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!fallback) {
      console.log('No candidates. Exiting.');
      await db.$disconnect();
      return;
    }
    await db.product.update({
      where: { id: fallback.id },
      data: { bestseller: true },
    });
    console.log(`Promoted: ${fallback.name}`);
  } else {
    await db.product.update({
      where: { id: target.id },
      data: { bestseller: true },
    });
    console.log(`Promoted: ${target.name}`);
  }

  // Verify
  const bestseller = await db.product.count({ where: { active: true, bestseller: true } });
  const trending = await db.product.count({ where: { active: true, trending: true } });
  const newArrival = await db.product.count({ where: { active: true, newArrival: true } });
  console.log('\nFinal counts:');
  console.log('  newArrival:', newArrival, '→', Math.floor(newArrival / 4), 'complete rows +', newArrival % 4, 'leftover');
  console.log('  bestseller:', bestseller, '→', Math.floor(bestseller / 4), 'complete rows +', bestseller % 4, 'leftover');
  console.log('  trending  :', trending, '→', Math.floor(trending / 4), 'complete rows +', trending % 4, 'leftover');

  await db.$disconnect();
})();
