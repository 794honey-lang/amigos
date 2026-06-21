import { mockOrders } from '../mocks/mockOrders';
import { useStoreRegistry } from '../store/storeRegistry';

export const reportingService = {
  getDashboardKPIs: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { franchiseId, storeId } = scope || {};
    const stores = useStoreRegistry.getState().stores;
    
    let filteredOrders = [...mockOrders];
    let storeList = [...stores];
    
    if (storeId) {
      filteredOrders = mockOrders.filter(o => o.storeId === storeId);
      storeList = stores.filter(s => s.id === storeId);
    } else if (franchiseId) {
      const storeIds = stores.filter(s => s.franchiseId === franchiseId).map(s => s.id);
      filteredOrders = mockOrders.filter(o => storeIds.includes(o.storeId));
      storeList = stores.filter(s => s.franchiseId === franchiseId);
    }
    
    const activeOrders = filteredOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered');
    const completedOrders = filteredOrders.filter(o => o.status === 'Delivered');
    
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.toPay, 0);
    const orderCount = filteredOrders.length;
    
    const activeStores = storeList.filter(s => s.status === 'Open').length;
    const totalStores = storeList.length;
    
    return {
      success: true,
      data: {
        totalRevenue,
        orderCount,
        activeOrdersCount: activeOrders.length,
        activeStores,
        totalStores,
        avgPrepTimeMinutes: 18
      }
    };
  },

  getRevenueTrend: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      success: true,
      data: [
        { name: 'Mon', revenue: 12000, orders: 24 },
        { name: 'Tue', revenue: 15000, orders: 30 },
        { name: 'Wed', revenue: 14000, orders: 28 },
        { name: 'Thu', revenue: 18000, orders: 36 },
        { name: 'Fri', revenue: 25000, orders: 50 },
        { name: 'Sat', revenue: 32000, orders: 65 },
        { name: 'Sun', revenue: 28000, orders: 58 }
      ]
    };
  },

  getCategoryBreakdown: async (scope) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      success: true,
      data: [
        { name: 'Veg Pizza', value: 45000 },
        { name: 'Non-Veg Pizza', value: 65000 },
        { name: 'Sandwiches', value: 15000 },
        { name: 'Drinks & Desserts', value: 20000 }
      ]
    };
  }
};
