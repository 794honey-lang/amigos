import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Querying customer users:');
  const customers = await prisma.user.findMany({
    where: { role: 'customer' },
    take: 5
  });
  console.log(JSON.stringify(customers, null, 2));
}

main().finally(() => prisma.$disconnect());
