import { usePromotionStore } from '@shared/store/promotionStore';
import { useStoreRegistry } from '../store/storeRegistry';

export const promotionService = {
  getPromotions: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { franchiseId, storeId } = scope || {};
    const stores = useStoreRegistry.getState().stores;
    const { promotions, storePromoOverrides } = usePromotionStore.getState();
    
    if (storeId) {
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
  },

  createPromotion: async (promoData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    usePromotionStore.getState().createPromotion(promoData);
    return { success: true, data: promoData };
  },

  togglePromotionStatus: async (code, isActive) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    usePromotionStore.getState().togglePromotionStatus(code, isActive);
    return { success: true };
  },

  getStorePromoOverrides: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: usePromotionStore.getState().storePromoOverrides };
  },
  
  updateStorePromoOverride: async (storeId, promoCode, isEnabled) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    usePromotionStore.getState().updateStorePromoOverride(storeId, promoCode, isEnabled);
    return { success: true };
  },
  
  bulkUpdateStorePromoOverrides: async (storeIds, promoCode, isEnabled) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    usePromotionStore.getState().bulkUpdateStorePromoOverrides(storeIds, promoCode, isEnabled);
    return { success: true };
  }
};
