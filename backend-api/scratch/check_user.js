import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = '02095ed8-b3b8-4480-93bf-718df69083e7';
  
  console.log(`Searching for ID: ${id}`);
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) {
    console.log('Found in User table:');
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log('Not found in User table.');
  }

  const store = await prisma.store.findUnique({ where: { id } });
  if (store) {
    console.log('Found in Store table:');
    console.log(JSON.stringify(store, null, 2));
  } else {
    console.log('Not found in Store table.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
