import { mockOrders } from '../mocks/mockOrders';
import { useStoreRegistry } from '../store/storeRegistry';

let currentOrders = [...mockOrders];

export const orderService = {
  getOrders: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { franchiseId, storeId } = scope || {};
    const stores = useStoreRegistry.getState().stores;
    
    if (storeId) {
      return { success: true, data: currentOrders.filter(o => o.storeId === storeId) };
    }
    
    if (franchiseId) {
      const franchiseStoreIds = stores.filter(s => s.franchiseId === franchiseId).map(s => s.id);
      return { success: true, data: currentOrders.filter(o => franchiseStoreIds.includes(o.storeId)) };
    }
    
    return { success: true, data: currentOrders };
  },

  updateOrderStatus: async (orderId, status) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = currentOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      currentOrders[index] = { ...currentOrders[index], status };
      return { success: true, data: currentOrders[index] };
    }
    return { success: false, error: 'Order not found' };
  },

  assignDriver: async (orderId, driverName) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = currentOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      currentOrders[index] = { ...currentOrders[index], driverName, status: 'OutForDelivery' };
      return { success: true, data: currentOrders[index] };
    }
    return { success: false, error: 'Order not found' };
  },

  injectFakeOrder: (storeId) => {
    const stores = useStoreRegistry.getState().stores;
    const store = stores.find(s => s.id === storeId) || stores[0];
    const newId = `A${Math.floor(1000 + Math.random() * 9000)}`;
    const randomNames = ['Amit Kumar', 'Sarah Jones', 'Rohan Mehta', 'Vikram Patel', 'Sonia Roy'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomPhones = ['9876543210', '9123456789', '9419123456', '9920012345'];
    const randomPhone = randomPhones[Math.floor(Math.random() * randomPhones.length)];
    
    const fakeOrder = {
      id: newId,
      storeId: store.id,
      storeName: store.name,
      date: new Date().toISOString(),
      items: [
        { id: 'schezwan-veg', name: 'Schezwan Veg', size: 'Medium', crust: 'Classic', toppings: [], price: 550, qty: 1 }
      ],
      itemTotal: 550,
      deliveryFee: 20,
      taxes: 28,
      discount: 0,
      toPay: 598,
      status: 'Placed',
      paymentMethod: 'UPI',
      address: { line: '45, High Street', city: store.city, pincode: '110001' },
      customer: { name: randomName, phone: randomPhone }
    };
    
    currentOrders = [fakeOrder, ...currentOrders];
    return fakeOrder;
  }
};
