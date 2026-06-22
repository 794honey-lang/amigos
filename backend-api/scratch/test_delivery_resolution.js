import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to calculate distance between coordinates (same as Home/Checkout/CartStore)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to check if location coordinates are inside store delivery boundary
const isInsideStoreZone = (store, lat, lng) => {
  if (!store.deliveryZone) return false;
  const zone = typeof store.deliveryZone === 'string'
    ? JSON.parse(store.deliveryZone)
    : store.deliveryZone;
  
  if (!zone || !zone.mode) return false;
  
  const distanceKm = calculateDistance(store.lat, store.lng, lat, lng);
  
  if (zone.mode === 'radius') {
    return distanceKm <= (zone.radiusKm || 5);
  } else if (zone.mode === 'polygon') {
    if (zone.polygonCoordinates && zone.polygonCoordinates.length >= 3) {
      let isInside = false;
      const x = Number(lat);
      const y = Number(lng);
      
      const vs = zone.polygonCoordinates;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = Number(vs[i].lat), yi = Number(vs[i].lng);
        const xj = Number(vs[j].lat), yj = Number(vs[j].lng);
        
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
      }
      return isInside || distanceKm <= 1.5;
    }
    return distanceKm <= (zone.radiusKm || 5);
  }
  return false;
};

// Selection algorithm (matching Home/Checkout logic)
function resolveStore(stores, lat, lng) {
  const openStores = stores.filter(s => s.status === 'Open');
  if (openStores.length === 0) return null;

  const servingStores = openStores.filter(store => isInsideStoreZone(store, lat, lng));
  
  if (servingStores.length > 0) {
    servingStores.sort((a, b) => {
      const distA = calculateDistance(a.lat, a.lng, lat, lng);
      const distB = calculateDistance(b.lat, b.lng, lat, lng);
      return distA - distB;
    });
    return servingStores[0];
  } else {
    // If outside all zones, fallback to nearest physically
    const sortedAllOpen = [...openStores].sort((a, b) => {
      const distA = calculateDistance(a.lat, a.lng, lat, lng);
      const distB = calculateDistance(b.lat, b.lng, lat, lng);
      return distA - distB;
    });
    return sortedAllOpen[0];
  }
}

async function runTests() {
  console.log('=== STARTING DYNAMIC DELIVERY STORE RESOLUTION TESTS ===\n');

  // Load stores from PostgreSQL
  const stores = await prisma.store.findMany();
  console.log(`Loaded ${stores.length} stores from database.`);

  // We need to configure the deliveryZone of store_001 and store_002 for testing
  // store_001: radius 5km (Civil Lines, Jammu: 32.7266, 74.8570)
  // store_002: radius 3km (Channi Himmat, Jammu: 32.705, 74.879)
  const store_001 = stores.find(s => s.id === 'store_001');
  const store_002 = stores.find(s => s.id === 'store_002');
  
  if (store_001) {
    store_001.deliveryZone = { mode: 'radius', radiusKm: 5 };
  }
  if (store_002) {
    store_002.deliveryZone = { mode: 'radius', radiusKm: 3 };
  }

  // 1. User coordinates directly at Civil Lines store (store_001)
  console.log('\n--- TEST 1: User at Civil Lines store coordinates ---');
  const userLat1 = 32.7266;
  const userLng1 = 74.8570;
  const resolvedStore1 = resolveStore(stores, userLat1, userLng1);
  console.log(`Resolved Store: ID="${resolvedStore1?.id}", Name="${resolvedStore1?.name}"`);
  if (resolvedStore1?.id !== 'store_001') {
    throw new Error('FAIL: Should have resolved to store_001!');
  }
  console.log('✔ Test 1 Passed!');

  // 2. User coordinates close to Channi Himmat store (store_002)
  console.log('\n--- TEST 2: User at Channi Himmat coordinates ---');
  const userLat2 = 32.705;
  const userLng2 = 74.879;
  const resolvedStore2 = resolveStore(stores, userLat2, userLng2);
  console.log(`Resolved Store: ID="${resolvedStore2?.id}", Name="${resolvedStore2?.name}"`);
  if (resolvedStore2?.id !== 'store_002') {
    throw new Error('FAIL: Should have resolved to store_002!');
  }
  console.log('✔ Test 2 Passed!');

  // 3. User coordinates in Srinagar (very far from Jammu stores)
  console.log('\n--- TEST 3: User very far away (Srinagar location) ---');
  const userLat3 = 34.0837;
  const userLng3 = 74.7973;
  const resolvedStore3 = resolveStore(stores, userLat3, userLng3);
  console.log(`Resolved Store: ID="${resolvedStore3?.id}", Name="${resolvedStore3?.name}"`);
  console.log(`Distance from customer to closest store ${resolvedStore3?.name}: ${calculateDistance(resolvedStore3?.lat, resolvedStore3?.lng, userLat3, userLng3).toFixed(1)} km`);
  
  // Since no store exists in Srinagar, it should fallback to the physically nearest open store (which is in J&K, e.g. Jammu)
  if (!resolvedStore3) {
    throw new Error('FAIL: Should have resolved to closest open store as fallback!');
  }
  console.log(`✔ Test 3 Passed! Falling back to nearest open store: ${resolvedStore3.name}`);

  console.log('\n=== ALL DYNAMIC STORE RESOLUTION TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch(err => {
    console.error('\n❌ TEST SUITE FAILED WITH ERROR:');
    console.error(err.stack || err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
