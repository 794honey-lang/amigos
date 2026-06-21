import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useScopeStore } from '../../store/scopeStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { Logo } from '@shared/components/ui/Logo';
import logoImg from '@shared/assets/logo.png';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, UtensilsCrossed, Tag, Image, 
  Map, Coins, Settings, ShieldAlert, BarChart3, Users, Store, LogOut,
  ListOrdered, ClipboardList, ToggleLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { role, logout, user, isImpersonating, stopImpersonating, impersonateFranchise } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { resetScope, currentStoreId } = useScopeStore();
  const navigate = useNavigate();

  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showFranchiseSelector, setShowFranchiseSelector] = useState(false);

  const handleLogout = () => {
    logout();
    resetScope();
    navigate('/login');
  };

  const getNavLinks = () => {
    const isDrilledDownStore = (role === 'corporate' || role === 'franchise') && currentStoreId;

    if (isDrilledDownStore || role === 'store') {
      return [
        { to: '/store', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/store/orders', label: 'Live Orders', icon: ListOrdered, badge: true },
        { to: '/store/inventory', label: 'Inventory (OOS)', icon: UtensilsCrossed },
        { to: '/store/operations', label: 'Ops Controls', icon: Settings },
        { to: '/store/hours', label: 'Store Hours', icon: ClipboardList },
        { to: '/store/delivery-zone', label: 'Delivery Zone', icon: Map },
        { to: '/store/drivers', label: 'Drivers', icon: Users },
        { to: '/store/refunds', label: 'Refunds & Voids', icon: Coins },
        { to: '/store/reporting', label: 'Store Reports', icon: BarChart3 },
      ];
    }

    if (role === 'corporate') {
      return [
        { to: '/hq', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/hq/franchises', label: 'Franchises', icon: Users },
        { to: '/hq/menu', label: 'Master Menu', icon: UtensilsCrossed },
        { to: '/hq/promotions', label: 'Promos Applicable', icon: Tag },
        { to: '/hq/banners', label: 'App Banners', icon: Image },
        { to: '/hq/pricing-templates', label: 'Pricing Tiers', icon: Coins },
        { to: '/hq/loyalty', label: 'Loyalty Rules', icon: Coins },
        { to: '/hq/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
        { to: '/hq/compliance', label: 'Compliance Policies', icon: ShieldAlert },
        { to: '/hq/reporting', label: 'Network Reports', icon: BarChart3 },
      ];
    }

    if (role === 'franchise') {
      return [
        { to: '/franchise', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/franchise/stores', label: 'Franchise Stores', icon: Store },
        { to: '/franchise/hours', label: 'Operating Hours', icon: ClipboardList },
        { to: '/franchise/offers', label: 'Local Offers', icon: Tag },
        { to: '/franchise/reporting', label: 'P&L Reports', icon: BarChart3 },
        { to: '/franchise/staff', label: 'Staff Management', icon: Users },
        { to: '/franchise/overrides', label: 'Franchise Defaults', icon: Settings },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-45 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside className={`bg-dark text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'} w-64 h-screen z-50 shrink-0 shadow-lg fixed md:relative top-0 bottom-0 left-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:translate-x-0`}>
      <div 
        className={`relative flex items-center ${sidebarCollapsed ? 'h-16 justify-center' : 'py-3 justify-start pl-5'} border-b border-white/10 overflow-hidden shrink-0 ${isImpersonating ? 'cursor-pointer hover:bg-white/5' : ''}`}
        onClick={() => {
          if (isImpersonating) {
            setShowHeaderDropdown(!showHeaderDropdown);
          }
        }}
      >
        {!sidebarCollapsed && (
          <div className="flex flex-col items-start">
            <Logo size="sm" className="!items-start !text-left -ml-3 mb-1" />
            <span className="text-[9px] text-white/50 tracking-wider font-heading uppercase pl-0.5 font-semibold flex items-center gap-1.5">
              <span>{role === 'corporate' ? 'HQ Admin' : role === 'franchise' ? 'Franchise' : 'Store Portal'}</span>
              {isImpersonating && (
                <span className="text-[8px] text-amber-500 font-bold bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/25 lowercase">(acting)</span>
              )}
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <img src={logoImg} alt="Amigos" className="w-8 h-8 object-contain" />
        )}

        {isImpersonating && showHeaderDropdown && !sidebarCollapsed && (
          <div className="absolute top-14 left-4 right-4 bg-white border border-stone-200 rounded-card shadow-lg p-1.5 z-50 text-dark animate-fadeIn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopImpersonating();
                resetScope();
                setShowHeaderDropdown(false);
                navigate('/hq');
              }}
              className="w-full text-left px-2 py-1.5 rounded text-[11px] font-heading font-semibold hover:bg-stone-50 hover:text-brand transition-colors cursor-pointer"
            >
              Return to HQ Dashboard
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2 no-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/hq' || link.to === '/franchise' || link.to === '/store'}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-heading font-medium transition-all ${
                  isActive 
                    ? 'bg-brand text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
              {link.badge && !sidebarCollapsed && (
                <span className="ml-auto bg-gold text-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3 flex flex-col gap-3">
        {showFranchiseSelector && !sidebarCollapsed && (
          <div className="absolute bottom-16 left-3 right-3 bg-white border border-stone-200 rounded-card shadow-lg p-2 z-50 text-dark animate-fadeIn">
            <div className="text-[8px] font-heading font-extrabold text-stone-400 uppercase px-2 py-1 tracking-wider border-b border-stone-150 mb-1">
              Impersonate Franchise:
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
              {useStoreRegistry.getState().franchises.map(f => (
                <button
                  key={f.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    impersonateFranchise(f.id);
                    useScopeStore.getState().setFranchiseScope(f.id);
                    setShowFranchiseSelector(false);
                    navigate('/franchise');
                  }}
                  className="w-full text-left px-2 py-1 text-xs font-heading font-semibold hover:bg-stone-50 hover:text-brand rounded transition-colors cursor-pointer"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!sidebarCollapsed && user && (
          <div 
            onClick={() => {
              if (user.role === 'corporate') {
                setShowFranchiseSelector(!showFranchiseSelector);
              }
            }}
            className={`p-2.5 rounded-card flex flex-col ${user.role === 'corporate' ? 'bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 hover:border-white/10' : 'bg-white/5'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate">{user.name}</span>
              {user.role === 'corporate' && (
                <span className="text-[8px] font-heading font-bold text-amber-500 bg-amber-500/10 px-1 rounded uppercase tracking-wider">HQ</span>
              )}
            </div>
            <span className="text-[10px] text-white/40 truncate">{user.email}</span>
            {user.role === 'corporate' && (
              <span className="text-[8.5px] text-brand font-heading font-bold mt-1 text-left hover:underline">
                {isImpersonating ? 'Change impersonation...' : 'Impersonate Franchise...'}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button 
            onClick={toggleSidebar} 
            className="p-2 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-card transition-colors shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand/20 hover:bg-brand/35 text-white rounded-card transition-colors text-xs font-heading font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
