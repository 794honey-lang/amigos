import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying all stores:');
  const stores = await prisma.store.findMany();
  console.log(JSON.stringify(stores, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
