const API_URL = 'http://localhost:5050/api';

export const promotionService = {
  getPromotions: async (scope) => {
    try {
      const { franchiseId, storeId } = scope || {};
      
      const [promoRes, overrideRes] = await Promise.all([
        fetch(`${API_URL}/promotions`),
        fetch(`${API_URL}/promotions/overrides`)
      ]);
      
      const promoData = await promoRes.json();
      const overrideData = await overrideRes.json();
      
      if (!promoData.success) return promoData;
      const promotions = promoData.data;
      const storePromoOverrides = overrideData.success ? overrideData.data : {};
      
      if (storeId) {
        const { useStoreRegistry } = await import('../store/storeRegistry');
        const stores = useStoreRegistry.getState().stores;
        const store = stores.find(s => s.id === storeId);
        const storeFranchiseId = store ? store.franchiseId : null;
        
        return {
          success: true,
          data: promotions.filter(p => {
            const isOverriddenDisabled = storePromoOverrides[storeId]?.[p.code] === false;
            if (isOverriddenDisabled) return false;

            return p.scopeType === 'national' ||
              (p.scopeType === 'regional' && p.scopeId === storeFranchiseId) ||
              (p.scopeType === 'store' && p.scopeId === storeId);
          })
        };
      }
      
      if (franchiseId) {
        return {
          success: true,
          data: promotions.filter(p => 
            p.scopeType === 'national' ||
            (p.scopeType === 'regional' && p.scopeId === franchiseId)
          )
        };
      }
      
      return { success: true, data: promotions };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  createPromotion: async (promoData) => {
    try {
      const res = await fetch(`${API_URL}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoData)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updatePromotion: async (code, promoData) => {
    try {
      const res = await fetch(`${API_URL}/promotions/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoData)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  deletePromotion: async (code) => {
    try {
      const res = await fetch(`${API_URL}/promotions/${code}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  togglePromotionStatus: async (code, isActive) => {
    try {
      const res = await fetch(`${API_URL}/promotions/${code}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getStorePromoOverrides: async () => {
    try {
      const res = await fetch(`${API_URL}/promotions/overrides`);
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  updateStorePromoOverride: async (storeId, promoCode, isEnabled) => {
    try {
      const res = await fetch(`${API_URL}/promotions/overrides`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, promoCode, enabled: isEnabled })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  bulkUpdateStorePromoOverrides: async (storeIds, promoCode, isEnabled) => {
    try {
      const res = await fetch(`${API_URL}/promotions/overrides/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeIds, promoCode, enabled: isEnabled })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
