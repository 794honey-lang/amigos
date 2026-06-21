import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { OrderDetail } from './OrderDetail';
import { orderService } from '../../services/orderService';
import { Clock, Phone, AlertCircle, ShoppingBag } from 'lucide-react';
import { formatDateTimeIST, formatTimeIST } from '@shared/utils/dateUtils';

export const Orders = () => {
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();

  const activeStoreId = currentStoreId || scope.storeId || 'store_001';

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('Placed'); // Placed | Preparing | Ready | OutForDelivery | Delivered | Cancelled

  const tabs = [
    { key: 'Placed', label: 'New' },
    { key: 'Preparing', label: 'Preparing' },
    { key: 'Ready', label: 'Ready' },
    { key: 'OutForDelivery', label: 'In Transit' },
    { key: 'Delivered', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' }
  ];

  const loadOrders = async () => {
    const res = await orderService.getOrders({ storeId: activeStoreId });
    if (res.success) {
      setOrders(res.data);
    }
  };

  useEffect(() => {
    loadOrders();
    setSelectedOrderId(null); // Reset selection on store changes
  }, [activeStoreId]);

  // Periodic polling/sync (so newly injected ticker orders show here too!)
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 5000); // sync every 5s
    return () => clearInterval(interval);
  }, [activeStoreId]);

  const handleStatusChange = async (orderId, nextStatus, driverName) => {
    let res;
    if (nextStatus === 'OutForDelivery' && driverName) {
      res = await orderService.assignDriver(orderId, driverName);
    } else {
      res = await orderService.updateOrderStatus(orderId, nextStatus);
    }

    if (res.success) {
      addToast(`Order #${orderId} moved to ${nextStatus}`, 'success');
      loadOrders();
    }
  };

  const handleReject = async (orderId) => {
    if (window.confirm(`Are you sure you want to REJECT order #${orderId}?`)) {
      const res = await orderService.updateOrderStatus(orderId, 'Cancelled');
      if (res.success) {
        addToast(`Order #${orderId} has been rejected.`, 'error');
        loadOrders();
      }
    }
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
        {/* Header and Tabs */}
        <div className="bg-white border border-border p-4 rounded-card shadow-sm space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base font-heading font-extrabold text-text-primary">
                Kitchen Order Management
              </h1>
              <p className="text-[10px] font-body text-text-secondary">
                Monitor tickets, print tokens, and coordinate delivery dispatches
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2">
            {tabs.map(tab => {
              const count = orders.filter(o => o.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedOrderId(null);
                  }}
                  className={`px-4 py-2 border-b-2 text-xs font-heading font-semibold transition-all shrink-0 pb-3 -mb-[2px] flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.key 
                      ? 'border-brand text-brand' 
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-brand text-white' : 'bg-surface-sunken text-text-secondary border border-border'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
          {/* Left panel: orders list */}
          <div className="flex-1 md:w-5/12 overflow-y-auto space-y-3 pr-1">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 border rounded-card shadow-sm cursor-pointer transition-all flex flex-col justify-between gap-3 bg-white ${
                    selectedOrderId === order.id 
                      ? 'border-brand ring-2 ring-brand/10' 
                      : 'border-border hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-xs text-text-primary">
                        Order #{order.id}
                      </span>
                      <span className="text-[9px] font-body text-text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTimeIST(order.date)}</span>
                      </span>
                    </div>

                    <p className="text-[11px] font-body text-text-secondary line-clamp-2">
                      {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-2.5 mt-1 text-[10px] font-heading font-semibold">
                    <span className="text-text-muted">{order.customer.name}</span>
                    <span className="text-brand">₹{order.toPay}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-border p-12 text-center rounded-card shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-50 border border-border flex items-center justify-center text-text-muted">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-heading font-bold text-xs text-text-primary">No tickets found</h4>
                  <p className="text-[11px] font-body text-text-secondary">No orders present under {activeTab} status.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: order detail */}
          <div className="flex-1 md:w-7/12 min-h-0">
            <OrderDetail
              order={selectedOrder}
              onStatusChange={handleStatusChange}
              onReject={handleReject}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
