import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateTotals = (items, deliveryType, coupon) => {
  if (items.length === 0) {
    return {
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      discount: 0,
      toPay: 0
    };
  }

  const itemTotal = items.reduce((sum, item) => {
    const singleItemCost = item.price + (item.crustPrice || 0) + (item.toppingsPrice || 0);
    return sum + singleItemCost * item.qty;
  }, 0);

  const deliveryFee = deliveryType === 'takeaway' ? 0 : 30;
  const taxes = Math.round(itemTotal * 0.05); // 5% GST & packaging
  
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((itemTotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discount = coupon.value;
    }
    // Ensure discount doesn't exceed total cost
    discount = Math.min(discount, itemTotal);
  }

  const toPay = itemTotal + deliveryFee + taxes - discount;

  return {
    itemTotal,
    deliveryFee,
    taxes,
    discount,
    toPay
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: 'delivery', // 'delivery' | 'takeaway'
      coupon: null,
      
      // Totals
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      discount: 0,
      toPay: 0,

      setDeliveryType: (type) => {
        set({ deliveryType: type });
        const state = get();
        set(calculateTotals(state.items, type, state.coupon));
      },

      addItem: (newItem) => {
        const state = get();
        const existingIndex = state.items.findIndex(
          (item) =>
            item.menuId === newItem.menuId &&
            item.size === newItem.size &&
            item.crust === newItem.crust &&
            JSON.stringify(item.toppings.map(t => t.name).sort()) ===
              JSON.stringify(newItem.toppings.map(t => t.name).sort())
        );

        let updatedItems = [...state.items];
        if (existingIndex !== -1) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            qty: updatedItems[existingIndex].qty + (newItem.qty || 1)
          };
        } else {
          // Generate unique cart item ID
          const cartItemId = `${newItem.menuId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          updatedItems.push({
            ...newItem,
            id: cartItemId,
            qty: newItem.qty || 1
          });
        }

        set({ items: updatedItems });
        const updatedState = get();
        set(calculateTotals(updatedState.items, updatedState.deliveryType, updatedState.coupon));
      },

      removeItem: (itemId) => {
        const state = get();
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        set({ items: updatedItems });
        
        const updatedState = get();
        // If cart is empty, remove coupon too
        const finalCoupon = updatedItems.length === 0 ? null : updatedState.coupon;
        set({ coupon: finalCoupon });
        set(calculateTotals(updatedItems, updatedState.deliveryType, finalCoupon));
      },

      updateQty: (itemId, change) => {
        const state = get();
        const updatedItems = state.items
          .map((item) => {
            if (item.id === itemId) {
              const newQty = item.qty + change;
              return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
          })
          .filter(Boolean);

        set({ items: updatedItems });
        
        const updatedState = get();
        const finalCoupon = updatedItems.length === 0 ? null : updatedState.coupon;
        set({ coupon: finalCoupon });
        set(calculateTotals(updatedItems, updatedState.deliveryType, finalCoupon));
      },

      applyCoupon: (couponData) => {
        set({ coupon: couponData });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, couponData));
      },

      removeCoupon: () => {
        set({ coupon: null });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, null));
      },

      clearCart: () => {
        set({
          items: [],
          coupon: null,
          itemTotal: 0,
          deliveryFee: 0,
          taxes: 0,
          discount: 0,
          toPay: 0
        });
      }
    }),
    {
      name: 'amigos_cart_storage'
    }
  )
);
