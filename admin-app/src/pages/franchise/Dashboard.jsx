import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { KpiCard } from '../../components/ui/KpiCard';
import { mockOrders } from '../../mocks/mockOrders';
import { mockStoreMenuOverrides } from '../../mocks/mockStoreMenuOverrides';
import { 
  IndianRupee, ShoppingBag, Store, AlertTriangle, 
  ChevronRight, ArrowRight, ShieldAlert, Sparkles 
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { scope } = useAuthStore();
  const { setStoreScope } = useScopeStore();
  const { addToast } = useUiStore();
  const allStores = useStoreRegistry(state => state.stores);

  const activeFranchiseId = scope.franchiseId || 'fr_001';

  const [stores, setStores] = useState([]);
  const [franchiseKPIs, setFranchiseKPIs] = useState({
    revenue: 0,
    orderCount: 0,
    activeCount: 0,
    totalCount: 0
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // 1. Filter stores under this franchise
    const franchiseStores = allStores.filter(s => s.franchiseId === activeFranchiseId);
    setStores(franchiseStores);

    // 2. Filter orders under these store IDs
    const storeIds = franchiseStores.map(s => s.id);
    const franchiseOrders = mockOrders.filter(o => storeIds.includes(o.storeId));
    
    const completedOrders = franchiseOrders.filter(o => o.status === 'Delivered');
    const revenue = completedOrders.reduce((sum, o) => sum + o.toPay, 0);

    const activeCount = franchiseStores.filter(s => s.status === 'Open').length;

    setFranchiseKPIs({
      revenue,
      orderCount: franchiseOrders.length,
      activeCount,
      totalCount: franchiseStores.length
    });

    // 3. Generate alerts
    const generatedAlerts = [];
    
    // Alert for paused/closed outlets
    franchiseStores.forEach(s => {
      if (s.status === 'Paused') {
        generatedAlerts.push({
          id: `alert-paused-${s.id}`,
          type: 'warning',
          message: `Outlet ${s.name} is currently PAUSED. Customers cannot order from this store.`
        });
      } else if (s.status === 'Closed') {
        generatedAlerts.push({
          id: `alert-closed-${s.id}`,
          type: 'danger',
          message: `Outlet ${s.name} is currently CLOSED. Check hours settings.`
        });
      }
    });

    // Alert for menu overrides (OOS items)
    const oosOverrides = mockStoreMenuOverrides.filter(o => storeIds.includes(o.storeId) && !o.isAvailable);
    if (oosOverrides.length > 0) {
      generatedAlerts.push({
        id: 'alert-oos',
        type: 'info',
        message: `There are ${oosOverrides.length} menu items marked OUT OF STOCK across your franchise branches.`
      });
    }

    setAlerts(generatedAlerts);
  }, [activeFranchiseId]);

  const handleManageStore = (storeId, storeName) => {
    setStoreScope(storeId);
    addToast(`Drilled scope context down to ${storeName}`, 'success');
    navigate('/store');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm">
          <h1 className="text-xl font-heading font-extrabold text-text-primary">
            Franchise Dashboard
          </h1>
          <p className="text-xs font-body text-text-secondary mt-0.5">
            Regional performance summary & branch monitoring
          </p>
        </div>

        {/* Scoped KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Franchise Revenue" 
            value={`₹${franchiseKPIs.revenue}`} 
            icon={IndianRupee} 
            trend={{ type: 'up', value: '+14.2%', label: 'vs last week' }}
          />
          <KpiCard 
            title="Franchise Orders" 
            value={franchiseKPIs.orderCount} 
            icon={ShoppingBag} 
            trend={{ type: 'up', value: '+6.8%', label: 'vs last week' }}
          />
          <KpiCard 
            title="Outlet Coverage" 
            value={`${franchiseKPIs.activeCount} / ${franchiseKPIs.totalCount} Active`} 
            icon={Store} 
            description="Stores currently online"
          />
        </div>

        {/* Operational Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-3">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-brand" />
              <span>Operational Alerts</span>
            </h3>
            
            <div className="space-y-2.5">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3 border rounded-card text-xs font-body flex items-start gap-2.5 ${
                    alert.type === 'danger'
                      ? 'bg-red-50 border-danger/10 text-danger'
                      : alert.type === 'warning'
                        ? 'bg-amber-50 border-gold/15 text-amber-800'
                        : 'bg-blue-50 border-info/10 text-text-secondary'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stores Status Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Franchise Outlets Registry
            </h3>
            <button 
              onClick={() => navigate('/franchise/stores')}
              className="text-xs font-heading font-semibold text-brand hover:underline flex items-center gap-0.5"
            >
              <span>View All Branches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stores.map(store => {
              // Calculate today's order count for this specific store
              const storeOrders = mockOrders.filter(o => o.storeId === store.id);
              const storeRevenue = storeOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.toPay, 0);

              return (
                <div 
                  key={store.id} 
                  className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading font-bold text-xs text-text-primary line-clamp-1">
                        {store.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-pill text-[9px] font-bold border shrink-0 ${
                        store.status === 'Open' 
                          ? 'bg-green-50 text-success border-success/20' 
                          : store.status === 'Paused' 
                            ? 'bg-amber-50 text-gold border-gold/20' 
                            : 'bg-red-50 text-danger border-danger/20'
                      }`}>
                        {store.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-text-muted font-body leading-relaxed line-clamp-2">
                      {store.address}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-heading font-semibold text-text-secondary">
                      <div className="bg-surface-sunken p-1.5 rounded border border-border/60">
                        <span className="text-text-muted block text-[8px] uppercase">Orders</span>
                        <span className="text-text-primary text-xs font-extrabold">{storeOrders.length}</span>
                      </div>
                      <div className="bg-surface-sunken p-1.5 rounded border border-border/60">
                        <span className="text-text-muted block text-[8px] uppercase">Sales</span>
                        <span className="text-brand text-xs font-extrabold">₹{storeRevenue}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManageStore(store.id, store.name)}
                    className="w-full py-2 bg-brand/10 hover:bg-brand/20 text-brand font-heading font-semibold rounded-pill text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <span>Manage Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
