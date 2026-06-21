export const mockStoreMenuOverrides = [
  // store_001 overrides
  { storeId: 'store_001', menuItemId: 'schezwan-veg', isAvailable: true, priceOverride: 350 },
  { storeId: 'store_001', menuItemId: 'premium-veg', isAvailable: false, priceOverride: null }, // Out of stock
  { storeId: 'store_001', menuItemId: 'dessert-choco-lava', isAvailable: true, priceOverride: 120 },

  // store_002 overrides
  { storeId: 'store_002', menuItemId: 'chicken-lovers', isAvailable: false, priceOverride: null }, // Out of stock

  // store_003 overrides
  { storeId: 'store_003', menuItemId: 'fiery-chicken', isAvailable: true, priceOverride: 399 },

  // store_005 overrides
  { storeId: 'store_005', menuItemId: 'schezwan-veg', isAvailable: true, priceOverride: 360 },
  { storeId: 'store_005', menuItemId: 'drink-pepsi-small', isAvailable: true, priceOverride: 70 }
];
