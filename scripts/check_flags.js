// Check all product flag status to plan the completion
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const products = await db.product.findMany({
    where: { active: true },
    select: { id: true, name: true, newArrival: true, bestseller: true, trending: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log('All active products:');
  products.forEach((p, i) => {
    const flags = [];
    if (p.newArrival) flags.push('NEW');
    if (p.bestseller) flags.push('BEST');
    if (p.trending) flags.push('TREND');
    console.log(`  ${i + 1}. ${p.name} → [${flags.join(', ')}]`);
  });

  console.log('\nCounts:');
  console.log('  newArrival:', products.filter((p) => p.newArrival).length);
  console.log('  bestseller:', products.filter((p) => p.bestseller).length);
  console.log('  trending  :', products.filter((p) => p.trending).length);

  // Products that have NO bestseller flag (candidates to promote)
  const notBest = products.filter((p) => !p.bestseller);
  console.log(`\nProducts NOT bestsellers (${notBest.length}):`);
  notBest.forEach((p) => console.log(`  - ${p.name}`));

  await db.$disconnect();
})();
