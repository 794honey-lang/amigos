import { create } from 'zustand';
import { orderService } from '../services/orderService';

export const useOrderStore = create((set, get) => {
  // Listen for simulated live status updates
  if (typeof window !== 'undefined') {
    window.addEventListener('amigos_order_status_updated', (event) => {
      const { orderId, status } = event.detail;
      const state = get();
      
      // Update order in historical list
      const updatedOrders = state.orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      
      // Update active order if it is the one being tracked
      const updatedActiveOrder = state.activeOrder && state.activeOrder.id === orderId 
        ? { ...state.activeOrder, status } 
        : state.activeOrder;
        
      set({ orders: updatedOrders, activeOrder: updatedActiveOrder });
    });
  }

  return {
    orders: [],
    activeOrder: null,
    loading: false,
    error: null,

    fetchOrders: async () => {
      set({ loading: true, error: null });
      const res = await orderService.getOrders();
      if (res.success) {
        set({ orders: res.data, loading: false });
      } else {
        set({ error: res.error, loading: false });
      }
    },

    fetchOrderById: async (orderId) => {
      set({ loading: true, error: null });
      const res = await orderService.getOrderById(orderId);
      if (res.success) {
        set({ activeOrder: res.data, loading: false });
        // Start simulation in case it hasn't started (e.g. page reload)
        orderService.startStatusSimulation(orderId);
      } else {
        set({ error: res.error, loading: false });
      }
    },

    placeOrder: async (orderPayload, clearCartCallback) => {
      set({ loading: true, error: null });
      const res = await orderService.placeOrder(orderPayload);
      if (res.success) {
        if (clearCartCallback) clearCartCallback();
        // Prepend to orders list
        set((state) => ({
          orders: [res.data, ...state.orders],
          activeOrder: res.data,
          loading: false
        }));
        return { success: true, orderId: res.data.id };
      } else {
        set({ error: res.error, loading: false });
        return { success: false, error: res.error };
      }
    },

    updateOrderStatus: async (orderId, status) => {
      const res = await orderService.updateOrderStatus(orderId, status);
      if (res.success) {
        set((state) => ({
          orders: state.orders.map(o => o.id === orderId ? res.data : o),
          activeOrder: state.activeOrder && state.activeOrder.id === orderId ? res.data : state.activeOrder
        }));
      }
      return res;
    }
  };
});
