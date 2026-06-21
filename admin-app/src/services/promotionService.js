import { mockPromotions } from '../mocks/mockPromotions';
import { useStoreRegistry } from '../store/storeRegistry';

let currentPromotions = [...mockPromotions];
let storePromoOverrides = {};

export const promotionService = {
  getPromotions: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { franchiseId, storeId } = scope || {};
    const stores = useStoreRegistry.getState().stores;
    
    if (storeId) {
      const store = stores.find(s => s.id === storeId);
      const storeFranchiseId = store ? store.franchiseId : null;
      
      return {
        success: true,
        data: currentPromotions.filter(p => 
          p.scopeType === 'national' ||
          (p.scopeType === 'regional' && p.scopeId === storeFranchiseId) ||
          (p.scopeType === 'store' && p.scopeId === storeId)
        )
      };
    }
    
    if (franchiseId) {
      return {
        success: true,
        data: currentPromotions.filter(p => 
          p.scopeType === 'national' ||
          (p.scopeType === 'regional' && p.scopeId === franchiseId)
        )
      };
    }
    
    return { success: true, data: currentPromotions };
  },

  createPromotion: async (promoData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newPromo = {
      ...promoData,
      isActive: true
    };
    currentPromotions.push(newPromo);
    return { success: true, data: newPromo };
  },

  togglePromotionStatus: async (code, isActive) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = currentPromotions.findIndex(p => p.code === code);
    if (index !== -1) {
      currentPromotions[index] = { ...currentPromotions[index], isActive };
      return { success: true, data: currentPromotions[index] };
    }
    return { success: false, error: 'Promotion not found' };
  },

  getStorePromoOverrides: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: storePromoOverrides };
  },
  
  updateStorePromoOverride: async (storeId, promoCode, isEnabled) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (!storePromoOverrides[storeId]) {
      storePromoOverrides[storeId] = {};
    }
    storePromoOverrides[storeId][promoCode] = isEnabled;
    return { success: true };
  },
  
  bulkUpdateStorePromoOverrides: async (storeIds, promoCode, isEnabled) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    storeIds.forEach(storeId => {
      if (!storePromoOverrides[storeId]) {
        storePromoOverrides[storeId] = {};
      }
      storePromoOverrides[storeId][promoCode] = isEnabled;
    });
    return { success: true };
  }
};
