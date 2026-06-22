const API_URL = 'http://localhost:5050/api';

export const couponService = {
  async getCoupons() {
    try {
      const activeStoreId = localStorage.getItem('amigos_active_store') || 'store_001';
      
      const [promoRes, overrideRes, storesRes] = await Promise.all([
        fetch(`${API_URL}/promotions`),
        fetch(`${API_URL}/promotions/overrides`),
        fetch(`${API_URL}/stores`)
      ]);
      
      const promoData = await promoRes.json();
      const overrideData = await overrideRes.json();
      const storesData = await storesRes.json();
      
      if (!promoData.success) return promoData;
      
      const promotions = promoData.data;
      const overrides = overrideData.success ? overrideData.data : {};
      const stores = storesData.success ? storesData.data : [];
      
      const store = stores.find(s => s.id === activeStoreId);
      const storeFranchiseId = store ? store.franchiseId : null;

      const activeCoupons = promotions.filter(p => {
        // 1. Must be active status
        if (!p.isActive) return false;

        // 2. Check if explicitly disabled for this store via overrides
        const isOverriddenDisabled = overrides[activeStoreId]?.[p.code] === false;
        if (isOverriddenDisabled) return false;

        // 3. Match scope
        return p.scopeType === 'national' ||
          (p.scopeType === 'regional' && p.scopeId === storeFranchiseId) ||
          (p.scopeType === 'store' && p.scopeId === activeStoreId);
      });

      // Map to structure expected by customer app
      const mapped = activeCoupons.map(p => ({
        code: p.code,
        discountType: p.discountType,
        value: p.discountValue,
        maxDiscount: p.maxDiscount,
        minCartTotal: p.minOrderValue,
        description: p.description
      }));

      return { success: true, data: mapped };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async applyCoupon(code, cartTotal) {
    if (!code) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    try {
      const activeStoreId = localStorage.getItem('amigos_active_store') || 'store_001';
      
      const [promoRes, overrideRes, storesRes] = await Promise.all([
        fetch(`${API_URL}/promotions`),
        fetch(`${API_URL}/promotions/overrides`),
        fetch(`${API_URL}/stores`)
      ]);
      
      const promoData = await promoRes.json();
      const overrideData = await overrideRes.json();
      const storesData = await storesRes.json();
      
      if (!promoData.success) return promoData;
      
      const promotions = promoData.data;
      const overrides = overrideData.success ? overrideData.data : {};
      const stores = storesData.success ? storesData.data : [];
      
      const store = stores.find(s => s.id === activeStoreId);
      const storeFranchiseId = store ? store.franchiseId : null;

      const coupon = promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
      
      if (!coupon || !coupon.isActive) {
        return { success: false, error: 'Invalid coupon code.' };
      }

      // Check if disabled by override
      const isOverriddenDisabled = overrides[activeStoreId]?.[coupon.code] === false;
      if (isOverriddenDisabled) {
        return { success: false, error: 'Coupon is not applicable at this store.' };
      }

      // Check scope
      const scopeMatches = coupon.scopeType === 'national' ||
        (coupon.scopeType === 'regional' && coupon.scopeId === storeFranchiseId) ||
        (coupon.scopeType === 'store' && coupon.scopeId === activeStoreId);

      if (!scopeMatches) {
        return { success: false, error: 'Coupon is not applicable at this store.' };
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
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
