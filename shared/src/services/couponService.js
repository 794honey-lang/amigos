import { mockCoupons } from '../mocks/mockCoupons';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const couponService = {
  async getCoupons() {
    await delay(200);
    return { success: true, data: mockCoupons };
  },

  async applyCoupon(code, cartTotal) {
    await delay(300);
    
    if (!code) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { success: false, error: 'Invalid coupon code.' };
    }

    if (cartTotal < coupon.minCartTotal) {
      return { 
        success: false, 
        error: `Minimum order value of Rs. ${coupon.minCartTotal} required to use this coupon.` 
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
        description: coupon.description
      }
    };
  }
};
