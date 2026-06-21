import { mockOrders } from '../mocks/mockOrders';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STATUS_SEQUENCE = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'OutForDelivery', 'Delivered'];

// Get orders list from localStorage if it exists, otherwise initialize with mockOrders
const getPersistedOrders = () => {
  try {
    const stored = localStorage.getItem('amigos_orders');
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem('amigos_orders', JSON.stringify(mockOrders));
    return mockOrders;
  } catch (e) {
    return mockOrders;
  }
};

const savePersistedOrders = (orders) => {
  try {
    localStorage.setItem('amigos_orders', JSON.stringify(orders));
  } catch (e) {}
};

// Map of active intervals for order status simulation
const activeSimulations = {};

export const orderService = {
  async getOrders() {
    await delay(300);
    return { success: true, data: getPersistedOrders() };
  },

  async getOrderById(id) {
    await delay(200);
    const orders = getPersistedOrders();
    const order = orders.find(o => o.id === id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, data: order };
  },

  async placeOrder(payload) {
    await delay(500);
    
    // Generate a fake order ID e.g. A1250, A1251...
    const orders = getPersistedOrders();
    const lastId = orders.length > 0 ? orders[0].id : 'A1000';
    const numPart = parseInt(lastId.replace(/\D/g, '')) || 1000;
    const newId = `A${numPart + 1}`;
    
    const newOrder = {
      id: newId,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: payload.items,
      itemTotal: payload.itemTotal,
      deliveryFee: payload.deliveryFee,
      taxes: payload.taxes,
      discount: payload.discount,
      toPay: payload.toPay,
      status: 'Placed',
      paymentMethod: payload.paymentMethod || 'UPI',
      address: payload.address,
      customer: payload.customer || { name: 'Rahul Sharma', phone: '9876543210' }
    };
    
    // Prepend new order to list
    const updatedOrders = [newOrder, ...orders];
    savePersistedOrders(updatedOrders);
    
    // Auto-start status progression for this order
    this.startStatusSimulation(newId);

    return { success: true, data: newOrder };
  },

  // Simulate order status progression: advances status every 8-10 seconds
  startStatusSimulation(orderId) {
    if (activeSimulations[orderId]) return;

    const intervalId = setInterval(() => {
      const orders = getPersistedOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);
      
      if (orderIndex === -1) {
        clearInterval(intervalId);
        delete activeSimulations[orderId];
        return;
      }
      
      const order = orders[orderIndex];
      const currentStatus = order.status;
      
      if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
        clearInterval(intervalId);
        delete activeSimulations[orderId];
        return;
      }
      
      const currentIdx = STATUS_SEQUENCE.indexOf(currentStatus);
      if (currentIdx !== -1 && currentIdx < STATUS_SEQUENCE.length - 1) {
        const nextStatus = STATUS_SEQUENCE[currentIdx + 1];
        
        // Update order status
        orders[orderIndex] = {
          ...order,
          status: nextStatus
        };
        
        savePersistedOrders(orders);
        
        // Trigger a custom event to notify stores or active screens
        const event = new CustomEvent('amigos_order_status_updated', {
          detail: { orderId, status: nextStatus }
        });
        window.dispatchEvent(event);
      }
    }, 10000); // 10 seconds

    activeSimulations[orderId] = intervalId;
  },

  // Allows manual status progression (e.g. from Restaurant App)
  async updateOrderStatus(orderId, status) {
    await delay(300);
    const orders = getPersistedOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: status
    };
    
    savePersistedOrders(orders);
    
    // Trigger custom event
    const event = new CustomEvent('amigos_order_status_updated', {
      detail: { orderId, status }
    });
    window.dispatchEvent(event);

    return { success: true, data: orders[orderIndex] };
  }
};
