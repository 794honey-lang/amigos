const API_URL = 'http://localhost:5050/api';

export const storeService = {
  async getStores() {
    try {
      const res = await fetch(`${API_URL}/stores`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
