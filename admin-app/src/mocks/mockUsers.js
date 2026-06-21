export const mockUsers = [
  {
    id: 'usr_hq_001',
    name: 'HQ Administrator',
    email: 'hq@amigos.in',
    password: 'admin123',
    role: 'corporate',
    franchiseId: null,
    storeId: null,
    permissions: [
      'menu.crud',
      'promo.crud',
      'banners.manage',
      'pricing.templates',
      'loyalty.manage',
      'flags.manage',
      'compliance.manage',
      'reporting.global',
      'franchise.crud',
      'orders.manage' // HQ has visibility
    ]
  },
  {
    id: 'usr_fr_001',
    name: 'Amit Verma (Franchise Owner)',
    email: 'franchise@amigos.in',
    password: 'admin123',
    role: 'franchise',
    franchiseId: 'fr_001',
    storeId: null,
    permissions: [
      'stores.view',
      'hours.manage',
      'promo.local',
      'reporting.franchise',
      'staff.manage',
      'overrides.limited',
      'orders.manage'
    ]
  },
  {
    id: 'usr_st_001',
    name: 'Deepak Dogra (Store Manager)',
    email: 'store@amigos.in',
    password: 'admin123',
    role: 'store',
    franchiseId: 'fr_001',
    storeId: 'store_001',
    permissions: [
      'orders.manage',
      'inventory.toggle',
      'ops.manage',
      'hours.store',
      'delivery.manage',
      'pricing.override',
      'promo.store',
      'drivers.manage',
      'refunds.manage',
      'reporting.store'
    ]
  }
];
