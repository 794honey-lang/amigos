const API_URL = 'http://localhost:5050/api';
const STATUS_SEQUENCE = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'OutForDelivery', 'Delivered'];
const activeSimulations = {};

export const orderService = {
  async getOrders() {
    try {
      const res = await fetch(`${API_URL}/orders`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getOrderById(id) {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async placeOrder(payload) {
    try {
      const storeId = localStorage.getItem('amigos_active_store') || 'store_001';
      const storeName = localStorage.getItem('amigos_active_store_name') || 'Civil Lines, Jammu';
      const payloadWithStore = {
        ...payload,
        storeId,
        storeName
      };
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithStore)
      });
      const data = await res.json();
      if (data.success) {
        // Start status progression simulation in backend database
        this.startStatusSimulation(data.data.id);
      }
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Simulate order status progression by making API calls to PostgreSQL
  startStatusSimulation(orderId) {
    if (activeSimulations[orderId]) return;

    const intervalId = setInterval(async () => {
      try {
        const orderRes = await this.getOrderById(orderId);
        if (!orderRes.success) {
          clearInterval(intervalId);
          delete activeSimulations[orderId];
          return;
        }

        const order = orderRes.data;
        const currentStatus = order.status;

        if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
          clearInterval(intervalId);
          delete activeSimulations[orderId];
          return;
        }

        const currentIdx = STATUS_SEQUENCE.indexOf(currentStatus);
        if (currentIdx !== -1 && currentIdx < STATUS_SEQUENCE.length - 1) {
          const nextStatus = STATUS_SEQUENCE[currentIdx + 1];
          
          // Update status in PostgreSQL database
          await this.updateOrderStatus(orderId, nextStatus);

          // If out for delivery, start mocking rider location updates in Redis
          if (nextStatus === 'OutForDelivery') {
            this.startRiderLocationSimulation(orderId);
          }
        }
      } catch (err) {
        console.error('Error simulating status progression:', err);
      }
    }, 15000); // Progress status every 15 seconds

    activeSimulations[orderId] = intervalId;
  },

  // Mock rider coordinates updates directly into Redis
  startRiderLocationSimulation(orderId) {
    let step = 0;
    // Route steps coordinates around Jammu Civil Lines
    const route = [
      { lat: 32.7056, lng: 74.8724 },
      { lat: 32.7065, lng: 74.8732 },
      { lat: 32.7072, lng: 74.8740 },
      { lat: 32.7081, lng: 74.8748 },
      { lat: 32.7090, lng: 74.8755 }
    ];

    const riderInterval = setInterval(async () => {
      if (step >= route.length) {
        clearInterval(riderInterval);
        return;
      }
      
      const coords = route[step];
      try {
        await fetch(`${API_URL}/rider/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            latitude: coords.lat,
            longitude: coords.lng
          })
        });
        step++;
      } catch (e) {
        console.error('Failed to post rider simulation coords to Redis:', e);
      }
    }, 4000); // Update location in Redis every 4 seconds
  },

  async updateOrderStatus(orderId, status) {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        // Dispatch local event for components loaded in same window
        const event = new CustomEvent('amigos_order_status_updated', {
          detail: { orderId, status }
        });
        window.dispatchEvent(event);
      }
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
