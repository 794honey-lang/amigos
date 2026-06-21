import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, RefreshCw, ChevronRight } from 'lucide-react';
import { useOrderStore } from '@shared/store/orderStore';
import { useCartStore } from '@shared/store/cartStore';
import { useUiStore } from '@shared/store/uiStore';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';

export const OrderHistory = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, loading } = useOrderStore();
  const { addItem, clearCart } = useCartStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Ongoing' | 'Completed' | 'Cancelled'

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (activeTab === 'All') return orders;
    
    if (activeTab === 'Ongoing') {
      return orders.filter(
        (o) => !['delivered', 'cancelled'].includes(o.status.toLowerCase())
      );
    }
    
    if (activeTab === 'Completed') {
      return orders.filter((o) => o.status.toLowerCase() === 'delivered');
    }
    
    if (activeTab === 'Cancelled') {
      return orders.filter((o) => o.status.toLowerCase() === 'cancelled');
    }
    
    return orders;
  };

  const handleReorder = (order, e) => {
    e.stopPropagation();
    clearCart();
    
    // Add all items in the order back to the cart
    order.items.forEach((item) => {
      // Re-map the items to composed cart item payload
      addItem({
        menuId: item.id,
        name: item.name,
        size: item.size || 'Regular',
        crust: item.crust || 'Classic',
        toppings: item.toppings || [],
        price: item.price,
        crustPrice: item.crustPrice || 0,
        toppingsPrice: item.toppingsPrice || 0,
        qty: item.qty || 1,
        isVeg: item.isVeg,
        image: item.image
      });
    });

    addToast('Cart repopulated from previous order!', 'success');
    navigate('/cart');
  };

  const handleOrderClick = (order) => {
    const isOngoing = !['delivered', 'cancelled'].includes(order.status.toLowerCase());
    if (isOngoing) {
      navigate(`/order/${order.id}`);
    } else {
      // If completed/cancelled, just show a toast or we can redirect to a view
      addToast(`Order #${order.id} is ${order.status}`, 'info');
    }
  };

  const filteredOrders = getFilteredOrders();
  const tabs = ['All', 'Ongoing', 'Completed', 'Cancelled'];

  return (
    <div className="flex-1 flex flex-col bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3.5 flex items-center shadow-sm">
        <h1 className="font-heading font-extrabold text-base text-text-primary">My Orders</h1>
      </header>

      {/* Tabs list */}
      <div className="bg-white border-b border-border flex items-center px-4 py-2 gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-heading font-semibold rounded-pill border transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-brand border-brand text-white shadow-sm'
                : 'bg-stone-50 border-stone-200 text-text-secondary hover:bg-stone-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-stone-200/50 animate-pulse rounded-card" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3.5">
            <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center text-text-muted">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-sm text-text-primary">No orders found</h3>
            <p className="font-body text-xs text-text-secondary max-w-[220px] leading-relaxed mx-auto">
              You do not have any orders in this section. Go ahead and place some!
            </p>
            <Button onClick={() => navigate('/menu')} variant="outline" className="px-6 py-2.5">
              Browse Menu
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOngoing = !['delivered', 'cancelled'].includes(order.status.toLowerCase());
            
            return (
              <Card
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="p-4 space-y-3.5 hover:border-stone-300 transition-colors"
              >
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-border pb-3.5">
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-bold text-xs text-text-primary">
                      Order #{order.id}
                    </h4>
                    <span className="text-[9px] text-text-muted font-body block">
                      {order.date}
                    </span>
                  </div>
                  <Badge status={order.status} />
                </div>

                {/* Items Summary list */}
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-body text-text-secondary">
                      <span className="truncate max-w-[80%]">
                        {item.qty} x {item.name} <span className="text-text-muted">({item.size})</span>
                      </span>
                      <span className="font-heading font-medium">₹{item.itemTotal || (item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer totals & actions */}
                <div className="border-t border-border pt-3.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-text-muted font-body uppercase tracking-wider">
                      Amount Paid
                    </span>
                    <span className="font-heading font-extrabold text-brand text-xs">
                      ₹{order.toPay}
                    </span>
                  </div>

                  {isOngoing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${order.id}`);
                      }}
                      className="px-3.5 py-1.5 bg-brand/5 hover:bg-brand/10 border border-brand/20 text-brand text-[10px] font-heading font-extrabold rounded-pill shadow-sm flex items-center gap-1 transition-all active:scale-95 uppercase tracking-wider"
                    >
                      Track Order
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleReorder(order, e)}
                      className="px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-text-primary text-[10px] font-heading font-extrabold rounded-pill shadow-sm flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wider"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reorder
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
