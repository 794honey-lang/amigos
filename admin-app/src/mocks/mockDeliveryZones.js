export const mockDeliveryZones = [
  {
    storeId: 'store_001',
    mode: 'polygon', // 'radius' | 'polygon'
    radiusKm: 5,
    polygonCoordinates: [
      { lat: 32.7350, lng: 74.8450 },
      { lat: 32.7380, lng: 74.8650 },
      { lat: 32.7200, lng: 74.8750 },
      { lat: 32.7150, lng: 74.8500 }
    ]
  },
  {
    storeId: 'store_002',
    mode: 'radius',
    radiusKm: 4,
    polygonCoordinates: []
  }
];
