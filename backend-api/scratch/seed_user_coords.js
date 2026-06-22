import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'rahul.sharma@example.com';
  console.log(`Updating addresses for customer: ${email}`);

  const updatedAddresses = [
    {
      id: 'addr_1',
      city: 'Jammu',
      line: 'Flat 101, Civil Lines, Jammu',
      label: 'Home (Civil Lines)',
      pincode: '180001',
      latitude: 32.7266,
      longitude: 74.8570
    },
    {
      id: 'addr_2',
      city: 'Jammu',
      line: 'Sector 4, Channi Himmat, Jammu',
      label: 'Office (Channi Himmat)',
      pincode: '180015',
      latitude: 32.705,
      longitude: 74.879
    },
    {
      id: 'addr_3',
      city: 'Srinagar',
      line: 'Lal Chowk, Srinagar, J&K',
      label: 'Out of Zone (Srinagar)',
      pincode: '190001',
      latitude: 34.0837,
      longitude: 74.7973
    }
  ];

  const user = await prisma.user.update({
    where: { email },
    data: {
      addresses: updatedAddresses
    }
  });

  console.log('✅ Updated User successfully! Current addresses:');
  console.log(JSON.stringify(user.addresses, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
