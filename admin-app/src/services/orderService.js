import { useStoreRegistry } from '../store/storeRegistry';

const API_URL = 'http://localhost:5050/api';

export const orderService = {
  getOrders: async (scope) => {
    try {
      const { franchiseId, storeId } = scope || {};
      let url = `${API_URL}/orders`;
      if (storeId) {
        url = `${API_URL}/orders?storeId=${storeId}`;
      } else if (franchiseId) {
        const stores = useStoreRegistry.getState().stores;
        const franchiseStoreIds = stores.filter(s => s.franchiseId === franchiseId).map(s => s.id);
        url = `${API_URL}/orders?storeId=${franchiseStoreIds.join(',')}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  assignDriver: async (orderId, driverName) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OutForDelivery', driverName })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  injectFakeOrder: async (storeId) => {
    try {
      const stores = useStoreRegistry.getState().stores;
      const store = stores.find(s => s.id === storeId) || stores[0];
      const randomNames = ['Amit Kumar', 'Sarah Jones', 'Rohan Mehta', 'Vikram Patel', 'Sonia Roy'];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      const randomPhones = ['9876543210', '9123456789', '9419123456', '9920012345'];
      const randomPhone = randomPhones[Math.floor(Math.random() * randomPhones.length)];
      
      const payload = {
        storeId: store.id,
        storeName: store.name,
        items: [
          { id: 'schezwan-veg', name: 'Schezwan Veg', size: 'Medium', crust: 'Classic', toppings: [], price: 550, qty: 1 }
        ],
        itemTotal: 550,
        deliveryFee: 20,
        taxes: 28,
        discount: 0,
        toPay: 598,
        paymentMethod: 'UPI',
        address: { line: '45, High Street', city: store.city, pincode: '110001' },
        customer: { name: randomName, phone: randomPhone }
      };
      
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
