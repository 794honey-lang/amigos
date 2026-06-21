const API_URL = 'http://localhost:5050/api';

export const menuService = {
  getMenuItems: async (scope) => {
    try {
      const { storeId } = scope || {};
      const url = storeId ? `${API_URL}/menu?storeId=${storeId}` : `${API_URL}/menu`;
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  updateMasterMenuItem: async (id, updatedItem) => {
    try {
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  createMasterMenuItem: async (item) => {
    try {
      const res = await fetch(`${API_URL}/menu/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  toggleStoreAvailability: async (storeId, menuItemId, isAvailable) => {
    try {
      const res = await fetch(`${API_URL}/menu/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, menuItemId, isAvailable })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updateStorePriceOverride: async (storeId, menuItemId, priceOverride) => {
    try {
      const res = await fetch(`${API_URL}/menu/price-override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, menuItemId, priceOverride })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetStorePriceOverride: async (storeId, menuItemId) => {
    try {
      const res = await fetch(`${API_URL}/menu/price-override/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, menuItemId })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
