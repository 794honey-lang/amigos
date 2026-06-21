import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { Bell, MapPin, RefreshCw } from 'lucide-react';

export const TopBar = () => {
  const { role, user, scope } = useAuthStore();
  const { currentFranchiseId, currentStoreId, resetScope } = useScopeStore();
  const { stores, franchises } = useStoreRegistry();

  const activeFranchise = franchises.find(f => f.id === currentFranchiseId || f.id === scope.franchiseId);
  const activeStore = stores.find(s => s.id === currentStoreId || s.id === scope.storeId);

  const getBreadcrumbs = () => {
    const parts = [{ label: 'Amigos HQ', type: 'hq' }];
    
    if (activeFranchise) {
      parts.push({ label: activeFranchise.name, type: 'franchise', id: activeFranchise.id });
    }
    
    if (activeStore) {
      parts.push({ label: activeStore.name, type: 'store', id: activeStore.id });
    }
    
    return parts;
  };

  const breadcrumbs = getBreadcrumbs();
  const isDrilledDown = (role === 'corporate' && (currentFranchiseId || currentStoreId)) ||
                        (role === 'franchise' && currentStoreId);

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between shadow-sm shrink-0 z-30">
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-text-muted text-xs">/</span>}
            <span 
              className={`text-xs font-heading font-semibold transition-colors ${
                idx === breadcrumbs.length - 1 
                  ? 'text-brand' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {crumb.label}
            </span>
          </React.Fragment>
        ))}

        {isDrilledDown && (
          <button
            onClick={resetScope}
            className="ml-3 flex items-center gap-1 bg-amber-50 border border-gold/30 text-amber-800 text-[10px] font-heading font-bold px-2 py-0.5 rounded-pill hover:bg-amber-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Clear Drill-Down Scope</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-surface-sunken border border-border px-3 py-1 rounded-pill text-[10px] font-heading font-bold text-text-secondary shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-brand" />
          <span>
            {activeStore ? activeStore.name : activeFranchise ? activeFranchise.name : 'All Networks'}
          </span>
        </div>

        <span className={`text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-pill border ${
          role === 'corporate' 
            ? 'bg-red-50 border-brand/20 text-brand' 
            : role === 'franchise'
              ? 'bg-amber-50 border-gold/20 text-amber-700'
              : 'bg-green-50 border-success/20 text-success'
        }`}>
          {role}
        </span>

        <button className="relative p-1.5 hover:bg-stone-50 rounded-full text-text-secondary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand rounded-full border border-white" />
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-heading font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
