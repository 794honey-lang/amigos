import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { KpiCard } from '../../components/ui/KpiCard';
import { Toggle } from '../../components/ui/Toggle';
import { orderService } from '../../services/orderService';
import { 
  IndianRupee, ShoppingBag, Clock, Plus, Play, Pause, 
  AlertCircle, ChevronRight, ListOrdered, Volume2
} from 'lucide-react';

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.35);
    
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.log('AudioContext blocked/unsupported', e);
  }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();
  const stores = useStoreRegistry(state => state.stores);
  const updateStore = useStoreRegistry(state => state.updateStore);
  
  const activeStoreId = currentStoreId || scope.storeId || 'store_001';
  const activeStore = stores.find(s => s.id === activeStoreId);

  const [storeOpen, setStoreOpen] = useState(activeStore ? activeStore.status === 'Open' : true);
  const [orders, setOrders] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    orderCount: 0,
    activeOrdersCount: 0,
    avgPrepTimeMinutes: 18
  });

  const loadDashboardData = async () => {
    const ordersRes = await orderService.getOrders({ storeId: activeStoreId });
    if (ordersRes.success) {
      setOrders(ordersRes.data);
    }
    
    const kpiRes = await orderService.getOrders({ storeId: activeStoreId }); // Filter logic inside
    if (kpiRes.success) {
      const ordersList = kpiRes.data;
      const completed = ordersList.filter(o => o.status === 'Delivered');
      const active = ordersList.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
      const revenue = completed.reduce((sum, o) => sum + o.toPay, 0);
      setKpis({
        totalRevenue: revenue,
        orderCount: ordersList.length,
        activeOrdersCount: active.length,
        avgPrepTimeMinutes: 18
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeStoreId]);

  useEffect(() => {
    if (activeStore) {
      setStoreOpen(activeStore.status === 'Open');
    }
  }, [activeStoreId, activeStore]);

  // Simulated live orders ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!storeOpen) return; // Don't receive orders if paused
      
      orderService.injectFakeOrder(activeStoreId).then(res => {
        if (res.success) {
          playChime();
          addToast(`New order ${res.data.id} received!`, 'warning');
          loadDashboardData();
        }
      });
    }, 20000); // Inject every 20 seconds

    return () => clearInterval(interval);
  }, [activeStoreId, storeOpen]);

  const handleStatusToggle = (val) => {
    setStoreOpen(val);
    updateStore(activeStoreId, { status: val ? 'Open' : 'Paused' });
    addToast(
      val ? 'Store is now OPEN to receive online orders.' : 'Store is now PAUSED. Online orders are stopped.',
      val ? 'success' : 'error'
    );
  };

  const handleAcceptOrder = async (orderId) => {
    const res = await orderService.updateOrderStatus(orderId, 'Preparing');
    if (res.success) {
      addToast(`Order ${orderId} accepted and is now preparing!`, 'success');
      loadDashboardData();
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (window.confirm(`Are you sure you want to REJECT order ${orderId}?`)) {
      const res = await orderService.updateOrderStatus(orderId, 'Cancelled');
      if (res.success) {
        addToast(`Order ${orderId} rejected.`, 'error');
        loadDashboardData();
      }
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Placed');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header and Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-sm">
          <div>
            <h1 className="text-xl font-heading font-extrabold text-text-primary">
              {activeStore ? activeStore.name : 'Store Console'}
            </h1>
            <p className="text-xs font-body text-text-secondary mt-0.5">
              Live counter view & incoming kitchen orders
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-sunken p-2.5 rounded-card border border-border">
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full ${storeOpen ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <span className="text-xs font-heading font-bold text-text-primary uppercase">
                Status: {storeOpen ? 'Receiving Orders' : 'Paused / Offline'}
              </span>
            </div>
            <div className="border-l border-border pl-4">
              <Toggle 
                checked={storeOpen} 
                onChange={handleStatusToggle} 
                confirmMessage={storeOpen ? "Are you sure you want to PAUSE online orders? Customers will see the store offline." : null}
              />
            </div>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Today's Revenue" 
            value={`₹${kpis.totalRevenue}`} 
            icon={IndianRupee} 
            description="From completed deliveries"
          />
          <KpiCard 
            title="Total Orders" 
            value={kpis.orderCount} 
            icon={ShoppingBag} 
            description="Total lifetime orders today"
          />
          <KpiCard 
            title="Active Tickets" 
            value={kpis.activeOrdersCount} 
            icon={ListOrdered} 
            description="Orders in prep or transit"
          />
          <KpiCard 
            title="Avg Prep Time" 
            value={`${kpis.avgPrepTimeMinutes}m`} 
            icon={Clock} 
            description="Target limit: 15m"
          />
        </div>

        {/* Main Content Grid: Live Feed & Operational Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Incoming Feed (Left Column - Spans 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-2">
                <span>Live Order Queue</span>
                {pendingOrders.length > 0 && (
                  <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    {pendingOrders.length} New
                  </span>
                )}
              </h3>
              <button 
                onClick={() => navigate('/store/orders')}
                className="text-xs font-heading font-semibold text-brand hover:underline flex items-center gap-0.5"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="bg-white border-2 border-brand/20 p-5 rounded-card shadow-sm flex flex-col md:flex-row justify-between gap-4 animate-slide-in relative overflow-hidden"
                  >
                    {/* Top pulse accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-brand animate-pulse" />

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm text-text-primary">
                          Order #{order.id}
                        </span>
                        <span className="bg-amber-50 text-gold border border-gold/25 text-[9px] font-bold px-2 py-0.5 rounded-pill">
                          New Incoming
                        </span>
                      </div>
                      
                      <p className="text-xs font-body text-text-secondary leading-relaxed">
                        {order.items.map(item => `${item.qty}x ${item.name} (${item.size})`).join(', ')}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted font-body">
                        <span>Customer: {order.customer.name}</span>
                        <span>Payable: ₹{order.toPay}</span>
                        <span>Method: {order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:self-center shrink-0">
                      <button
                        onClick={() => handleRejectOrder(order.id)}
                        className="px-3.5 py-2 border border-border hover:bg-stone-50 text-text-secondary font-heading font-semibold rounded-pill text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        Accept Order
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-border p-12 text-center rounded-card shadow-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-border flex items-center justify-center text-text-muted">
                    <ListOrdered className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-bold text-xs text-text-primary">No pending tickets</h4>
                    <p className="text-[11px] font-body text-text-secondary">Waiting for new online customer orders...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Alerts (Right Column) */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Live Monitoring
            </h3>

            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Volume2 className="w-4 h-4 text-brand" />
                <span className="text-xs font-heading font-bold">Sound Notifications</span>
              </div>
              <p className="text-[11px] font-body text-text-secondary leading-relaxed">
                Dual-tone chimes are synthesized when new orders arrive. Ensure your device volume is turned up to receive sound notifications.
              </p>
              <button 
                onClick={playChime} 
                className="w-full py-1.5 bg-surface-sunken hover:bg-stone-100 border border-stone-200 text-text-secondary font-heading font-semibold rounded-pill text-[10px] active:scale-95 transition-all cursor-pointer"
              >
                Test Sound Chime
              </button>
            </div>

            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-text-secondary">
                <AlertCircle className="w-4 h-4 text-gold" />
                <span className="text-xs font-heading font-bold">Operational Checklist</span>
              </div>
              
              <ul className="space-y-2.5 text-[11px] font-body text-text-secondary">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                  <span>Check gas burner levels and prep counter stocks before peak hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                  <span>Keep track of dough fermentation stocks in the cold room.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  <span>Monitor active drivers list to avoid food delivery delays.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
