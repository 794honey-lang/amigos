import { mockMasterMenu } from '../mocks/mockMasterMenu';
import { mockStoreMenuOverrides } from '../mocks/mockStoreMenuOverrides';

let currentMasterMenu = [...mockMasterMenu];
let currentOverrides = [...mockStoreMenuOverrides];

export const menuService = {
  getMenuItems: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { storeId } = scope || {};
    
    if (storeId) {
      const storeOverrides = currentOverrides.filter(o => o.storeId === storeId);
      const mergedMenu = currentMasterMenu.map(item => {
        const override = storeOverrides.find(o => o.menuItemId === item.id);
        if (override) {
          return {
            ...item,
            isAvailable: override.isAvailable,
            basePrice: override.priceOverride !== null ? override.priceOverride : item.basePrice,
            isOverride: override.priceOverride !== null
          };
        }
        return {
          ...item,
          isAvailable: true,
          isOverride: false
        };
      });
      return { success: true, data: mergedMenu };
    }
    
    return {
      success: true,
      data: currentMasterMenu.map(item => ({ ...item, isAvailable: true, isOverride: false }))
    };
  },
  
  updateMasterMenuItem: async (id, updatedItem) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = currentMasterMenu.findIndex(item => item.id === id);
    if (index !== -1) {
      currentMasterMenu[index] = { ...currentMasterMenu[index], ...updatedItem };
      return { success: true, data: currentMasterMenu[index] };
    }
    return { success: false, error: 'Item not found' };
  },

  createMasterMenuItem: async (item) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const newItem = { ...item, id: item.name.toLowerCase().replace(/\s+/g, '-') };
    currentMasterMenu.push(newItem);
    return { success: true, data: newItem };
  },

  toggleStoreAvailability: async (storeId, menuItemId, isAvailable) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = currentOverrides.findIndex(o => o.storeId === storeId && o.menuItemId === menuItemId);
    if (index !== -1) {
      currentOverrides[index].isAvailable = isAvailable;
    } else {
      currentOverrides.push({ storeId, menuItemId, isAvailable, priceOverride: null });
    }
    return { success: true };
  },

  updateStorePriceOverride: async (storeId, menuItemId, priceOverride) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = currentOverrides.findIndex(o => o.storeId === storeId && o.menuItemId === menuItemId);
    if (index !== -1) {
      currentOverrides[index].priceOverride = priceOverride;
    } else {
      currentOverrides.push({ storeId, menuItemId, isAvailable: true, priceOverride });
    }
    return { success: true };
  },

  resetStorePriceOverride: async (storeId, menuItemId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = currentOverrides.findIndex(o => o.storeId === storeId && o.menuItemId === menuItemId);
    if (index !== -1) {
      currentOverrides[index].priceOverride = null;
      if (currentOverrides[index].isAvailable && currentOverrides[index].priceOverride === null) {
        currentOverrides.splice(index, 1);
      }
    }
    return { success: true };
  }
};
