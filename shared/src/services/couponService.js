import { usePromotionStore } from '../store/promotionStore';
import { mockStores } from '../mocks/mockStores';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const couponService = {
  async getCoupons(storeId = 'store_001') {
    await delay(200);
    const store = mockStores.find(s => s.id === storeId);
    const storeFranchiseId = store ? store.franchiseId : null;
    const { promotions, storePromoOverrides } = usePromotionStore.getState();

    const activeCoupons = promotions.filter(p => {
      // Must be active status
      if (!p.isActive) return false;

      // Must not be overridden as disabled for this store
      const isOverriddenDisabled = storePromoOverrides[storeId]?.[p.code] === false;
      if (isOverriddenDisabled) return false;

      // Check if matching scope
      return p.scopeType === 'national' ||
        (p.scopeType === 'regional' && p.scopeId === storeFranchiseId) ||
        (p.scopeType === 'store' && p.scopeId === storeId);
    });

    // Map to the structure expected by the customer app
    const mapped = activeCoupons.map(p => ({
      code: p.code,
      discountType: p.discountType,
      value: p.discountValue,
      maxDiscount: p.maxDiscount,
      minCartTotal: p.minOrderValue,
      description: p.description
    }));

    return { success: true, data: mapped };
  },

  async applyCoupon(code, cartTotal, storeId = 'store_001') {
    await delay(300);
    
    if (!code) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    const store = mockStores.find(s => s.id === storeId);
    const storeFranchiseId = store ? store.franchiseId : null;
    const { promotions, storePromoOverrides } = usePromotionStore.getState();

    const coupon = promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon || !coupon.isActive) {
      return { success: false, error: 'Invalid coupon code.' };
    }

    // Check if overridden disabled for this store
    const isOverriddenDisabled = storePromoOverrides[storeId]?.[coupon.code] === false;
    if (isOverriddenDisabled) {
      return { success: false, error: 'This coupon is not valid for the selected store.' };
    }

    // Check scope
    const isEligible = coupon.scopeType === 'national' ||
      (coupon.scopeType === 'regional' && coupon.scopeId === storeFranchiseId) ||
      (coupon.scopeType === 'store' && coupon.scopeId === storeId);

    if (!isEligible) {
      return { success: false, error: 'This coupon is not valid for the selected store.' };
    }

    if (cartTotal < coupon.minOrderValue) {
      return { 
        success: false, 
        error: `Minimum order value of Rs. ${coupon.minOrderValue} required to use this coupon.` 
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
        description: coupon.description,
        discountType: coupon.discountType,
        value: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minCartTotal: coupon.minOrderValue
      }
    };
  }
};
