import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== STARTING STORE COORDINATES DATABASE UPDATE TESTS ===\n');

  const storeId = 'store_001';
  const originalLat = 32.7266;
  const originalLng = 74.8570;

  console.log(`1. Fetching store ${storeId}...`);
  const initialStore = await prisma.store.findUnique({ where: { id: storeId } });
  
  if (!initialStore) {
    throw new Error(`FAIL: Store ${storeId} not found in database!`);
  }
  
  console.log(`Store coords before update: Lat=${initialStore.lat}, Lng=${initialStore.lng}`);

  // 2. Perform coordinate update
  const newLat = 32.888888;
  const newLng = 74.999999;
  console.log(`\n2. Updating coordinates to Lat=${newLat}, Lng=${newLng}...`);

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      lat: newLat,
      lng: newLng
    }
  });

  console.log(`Store coords returned from update: Lat=${updatedStore.lat}, Lng=${updatedStore.lng}`);
  if (Math.abs(updatedStore.lat - newLat) > 0.000001 || Math.abs(updatedStore.lng - newLng) > 0.000001) {
    throw new Error('FAIL: Coords mismatch in update response!');
  }

  // 3. Re-query from DB to verify persistence
  console.log('\n3. Re-querying store from DB to verify persistence...');
  const queriedStore = await prisma.store.findUnique({ where: { id: storeId } });
  
  console.log(`Queried coordinates: Lat=${queriedStore?.lat}, Lng=${queriedStore?.lng}`);
  if (Math.abs((queriedStore?.lat ?? 0) - newLat) > 0.000001 || Math.abs((queriedStore?.lng ?? 0) - newLng) > 0.000001) {
    throw new Error('FAIL: Saved coords do not match expected values in database!');
  }
  console.log('✔ Database persistence verified!');

  // 4. Cleanup & Restore original coords
  console.log('\n4. Restoring original coordinates...');
  await prisma.store.update({
    where: { id: storeId },
    data: {
      lat: originalLat,
      lng: originalLng
    }
  });
  console.log('✔ Coords restored back to original defaults.');

  console.log('\n=== ALL COORDINATES DATABASE UPDATE TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch(err => {
    console.error('\n❌ DATABASE TEST SUITE FAILED:');
    console.error(err.stack || err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
