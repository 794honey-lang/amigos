const API_URL = 'http://localhost:5050/api';

export const couponService = {
  async getCoupons(storeId = 'store_001') {
    try {
      const res = await fetch(`${API_URL}/promotions`);
      const data = await res.json();
      if (!data.success) return data;

      const activeCoupons = data.data.filter(p => {
        // Must be active status
        if (!p.isActive) return false;

        // Check if matching scope (national, regional, or store-specific)
        return p.scopeType === 'national' || p.scopeType === 'store' || p.scopeType === 'regional';
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

  async applyCoupon(code, cartTotal, storeId = 'store_001') {
    if (!code) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    try {
      const res = await fetch(`${API_URL}/promotions`);
      const data = await res.json();
      if (!data.success) return data;

      const coupon = data.data.find(p => p.code.toUpperCase() === code.toUpperCase());
      
      if (!coupon || !coupon.isActive) {
        return { success: false, error: 'Invalid coupon code.' };
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
