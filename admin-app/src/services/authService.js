const API_URL = 'http://localhost:5050/api';

const ROLE_PERMISSIONS = {
  corporate: [
    'menu.crud',
    'promo.crud',
    'banners.manage',
    'pricing.templates',
    'loyalty.manage',
    'flags.manage',
    'compliance.manage',
    'reporting.global',
    'franchise.crud',
    'orders.manage'
  ],
  franchise: [
    'stores.view',
    'hours.manage',
    'promo.local',
    'reporting.franchise',
    'staff.manage',
    'overrides.limited',
    'orders.manage'
  ],
  store: [
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
};

export const authService = {
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }

      const user = data.data;
      const permissions = ROLE_PERMISSIONS[user.role] || [];
      const franchiseId = user.role === 'corporate' ? null : 'fr_001';
      
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            permissions
          },
          role: user.role,
          scope: {
            franchiseId,
            storeId: user.storeId
          },
          token: `mock-jwt-token-${user.id}`
        }
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
