const API_URL = 'http://localhost:5050/api';

export const menuService = {
  async getCategories() {
    try {
      const res = await fetch(`${API_URL}/categories`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getMenuItems({ category, isVeg, search, storeId } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (isVeg !== undefined && isVeg !== null) params.append('isVeg', String(isVeg));
      if (search) params.append('search', search);
      
      const activeStoreId = storeId || localStorage.getItem('amigos_active_store') || 'store_001';
      params.append('storeId', activeStoreId);

      const res = await fetch(`${API_URL}/menu?${params.toString()}`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getMenuItem(id) {
    try {
      const activeStoreId = localStorage.getItem('amigos_active_store') || 'store_001';
      const res = await fetch(`${API_URL}/menu?storeId=${activeStoreId}`);
      const data = await res.json();
      if (data.success) {
        const item = data.data.find(i => i.id === id);
        return item ? { success: true, data: item } : { success: false, error: 'Item not found' };
      }
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async updateItemAvailability(id, available) {
    try {
      const storeId = localStorage.getItem('amigos_active_store') || 'store_001';
      const res = await fetch(`${API_URL}/menu/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, storeId, available })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
