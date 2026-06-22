import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

const calculateTotals = (items, deliveryType, coupon, deliveryAddress, storeZoneConfig = null, activeStore = null) => {
  if (items.length === 0) {
    return {
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      discount: 0,
      toPay: 0,
      isOutOfDeliveryZone: false,
      minOrderViolation: false,
      distanceKm: 0,
      enableFreeDelivery: false,
      freeDeliveryMinOrder: 0
    };
  }

  const itemTotal = items.reduce((sum, item) => {
    const singleItemCost = item.price + (item.crustPrice || 0) + (item.toppingsPrice || 0);
    return sum + singleItemCost * item.qty;
  }, 0);

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

  let deliveryFee = 0;
  let isOutOfDeliveryZone = false;
  let minOrderViolation = false;
  let distanceKm = 0;
  let enableFreeDelivery = false;
  let freeDeliveryMinOrder = 0;

  if (deliveryType === 'delivery') {
    // storeZoneConfig is injected by checkout page via setStoreZoneConfig()
    // Default safe values used if not yet set
    let storeZone = (storeZoneConfig && storeZoneConfig.mode) ? storeZoneConfig : {
      mode: 'radius',
      radiusKm: 5,
      deliveryCharge: 30,
      minOrderValue: 200,
      extraKmCharge: 10,
      enableFreeDelivery: false,
      freeDeliveryMinOrder: 500
    };

    enableFreeDelivery = !!storeZone.enableFreeDelivery;
    freeDeliveryMinOrder = Number(storeZone.freeDeliveryMinOrder || 0);

    // 2. Determine distance from active store
    const storeLat = activeStore && activeStore.lat !== undefined ? Number(activeStore.lat) : 32.7266;
    const storeLng = activeStore && activeStore.lng !== undefined ? Number(activeStore.lng) : 74.8570;
    
    if (deliveryAddress && deliveryAddress.latitude && deliveryAddress.longitude) {
      distanceKm = calculateDistance(
        storeLat, 
        storeLng, 
        Number(deliveryAddress.latitude), 
        Number(deliveryAddress.longitude)
      );
    } else {
      // Default placeholder distance if no coordinate detected
      distanceKm = 1.5;
    }

    // 3. Check boundaries and minimum order value
    if (storeZone.mode === 'radius') {
      if (distanceKm > storeZone.radiusKm) {
        isOutOfDeliveryZone = true;
      }
    } else if (storeZone.mode === 'polygon') {
      if (storeZone.polygonCoordinates && storeZone.polygonCoordinates.length >= 3) {
        let isInside = false;
        const x = Number(deliveryAddress?.latitude || storeLat);
        const y = Number(deliveryAddress?.longitude || storeLng);
        
        // Ray casting algorithm
        const vs = storeZone.polygonCoordinates;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          const xi = Number(vs[i].lat || 32.7266), yi = Number(vs[i].lng || 74.8570);
          const xj = Number(vs[j].lat || 32.7266), yj = Number(vs[j].lng || 74.8570);
          
          const intersect = ((yi > y) !== (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) isInside = !isInside;
        }

        if (distanceKm <= 1.5) {
          isInside = true;
        }

        if (!isInside) {
          isOutOfDeliveryZone = true;
        }
      } else {
        if (distanceKm > storeZone.radiusKm) {
          isOutOfDeliveryZone = true;
        }
      }
    }

    if (itemTotal < storeZone.minOrderValue) {
      minOrderViolation = true;
    }

    // 4. Calculate delivery fee: baseFee for first 2 km, then extra per km
    const baseDistance = 2;
    let fee = Number(storeZone.deliveryCharge || 30);
    if (distanceKm > baseDistance) {
      const extraDistance = distanceKm - baseDistance;
      fee += Math.ceil(extraDistance) * Number(storeZone.extraKmCharge || 10);
    }
    
    // Check if free delivery is enabled and condition met
    if (enableFreeDelivery && itemTotal >= freeDeliveryMinOrder) {
      deliveryFee = 0;
    } else {
      deliveryFee = fee;
    }
  }

  const toPay = itemTotal + deliveryFee + taxes - discount;

  return {
    itemTotal,
    deliveryFee,
    taxes,
    discount,
    toPay,
    isOutOfDeliveryZone,
    minOrderViolation,
    distanceKm,
    enableFreeDelivery,
    freeDeliveryMinOrder
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: 'delivery', // 'delivery' | 'takeaway'
      coupon: null,
      deliveryAddress: null,
      storeZoneConfig: null,   // Injected by Checkout from store's delivery zone config
      activeStore: null,       // Track the dynamic assigned delivery store
      
      // Totals
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      discount: 0,
      toPay: 0,
      isOutOfDeliveryZone: false,
      minOrderViolation: false,
      distanceKm: 0,
      enableFreeDelivery: false,
      freeDeliveryMinOrder: 0,

      setDeliveryType: (type) => {
        set({ deliveryType: type });
        const state = get();
        set(calculateTotals(state.items, type, state.coupon, state.deliveryAddress, state.storeZoneConfig, state.activeStore));
      },

      setDeliveryAddress: (address) => {
        set({ deliveryAddress: address });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, state.coupon, address, state.storeZoneConfig, state.activeStore));
      },

      setStoreZoneConfig: (zoneConfig) => {
        set({ storeZoneConfig: zoneConfig });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, state.coupon, state.deliveryAddress, zoneConfig, state.activeStore));
      },

      setActiveStore: (store) => {
        set({ activeStore: store });
        if (store) {
          localStorage.setItem('amigos_active_store', store.id);
          let zoneConfig = null;
          if (store.deliveryZone) {
            zoneConfig = typeof store.deliveryZone === 'string'
              ? JSON.parse(store.deliveryZone)
              : store.deliveryZone;
          }
          set({ storeZoneConfig: zoneConfig });
        }
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, state.coupon, state.deliveryAddress, state.storeZoneConfig, store));
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
        set(calculateTotals(updatedState.items, updatedState.deliveryType, updatedState.coupon, updatedState.deliveryAddress, updatedState.storeZoneConfig, updatedState.activeStore));
      },

      removeItem: (itemId) => {
        const state = get();
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        set({ items: updatedItems });
        
        const updatedState = get();
        // If cart is empty, remove coupon too
        const finalCoupon = updatedItems.length === 0 ? null : updatedState.coupon;
        set({ coupon: finalCoupon });
        set(calculateTotals(updatedItems, updatedState.deliveryType, finalCoupon, updatedState.deliveryAddress, updatedState.storeZoneConfig, updatedState.activeStore));
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
        set(calculateTotals(updatedItems, updatedState.deliveryType, finalCoupon, updatedState.deliveryAddress, updatedState.storeZoneConfig, updatedState.activeStore));
      },

      applyCoupon: (couponData) => {
        set({ coupon: couponData });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, couponData, state.deliveryAddress, state.storeZoneConfig, state.activeStore));
      },

      removeCoupon: () => {
        set({ coupon: null });
        const state = get();
        set(calculateTotals(state.items, state.deliveryType, null, state.deliveryAddress, state.storeZoneConfig, state.activeStore));
      },

      clearCart: () => {
        set({
          items: [],
          coupon: null,
          deliveryAddress: null,
          itemTotal: 0,
          deliveryFee: 0,
          taxes: 0,
          discount: 0,
          toPay: 0,
          isOutOfDeliveryZone: false,
          minOrderViolation: false,
          distanceKm: 0,
          enableFreeDelivery: false,
          freeDeliveryMinOrder: 0
        });
      }
    }),
    {
      name: 'amigos_cart_storage'
    }
  )
);
