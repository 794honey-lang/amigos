import { orderService } from './orderService';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const restaurantOrderService = {
  async getRestaurantOrders() {
    const result = await orderService.getOrders();
    return result;
  },

  async acceptOrder(id) {
    const result = await orderService.updateOrderStatus(id, 'Confirmed');
    return result;
  },

  async rejectOrder(id) {
    const result = await orderService.updateOrderStatus(id, 'Cancelled');
    return result;
  },

  async updateOrderStatus(id, status) {
    const result = await orderService.updateOrderStatus(id, status);
    return result;
  }
};
