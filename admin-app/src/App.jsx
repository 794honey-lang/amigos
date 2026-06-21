import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useStoreRegistry } from './store/storeRegistry';
import { Login } from './pages/Login';
import { Showcase } from './pages/Showcase';
import { ScopedRoute } from './components/shared/ScopedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Store Console Pages
import { Dashboard as StoreDashboard } from './pages/store/Dashboard';
import { Orders as StoreOrders } from './pages/store/Orders';
import { Inventory as StoreInventory } from './pages/store/Inventory';
import { Operations as StoreOperations } from './pages/store/Operations';
import { Hours as StoreHours } from './pages/store/Hours';
import { DeliveryZone as StoreDeliveryZone } from './pages/store/DeliveryZone';

// Franchise Console Pages
import { Dashboard as FranchiseDashboard } from './pages/franchise/Dashboard';
import { Stores as FranchiseStores } from './pages/franchise/Stores';
import { Hours as FranchiseHours } from './pages/franchise/Hours';
import { Offers as FranchiseOffers } from './pages/franchise/Offers';
import { Reporting as FranchiseReporting } from './pages/franchise/Reporting';
import { Staff as FranchiseStaff } from './pages/franchise/Staff';
import { Overrides as FranchiseOverrides } from './pages/franchise/Overrides';

// HQ Console Pages
import { Franchises } from './pages/hq/Franchises';
import { Menu } from './pages/hq/Menu';
import { Promotions } from './pages/hq/Promotions';
import { Banners } from './pages/hq/Banners';
import { Reporting as HQReporting } from './pages/hq/Reporting';

import { AdminLayout } from './components/shared/AdminLayout';
import { Info } from 'lucide-react';

const queryClient = new QueryClient();

const ComingSoon = ({ title }) => (
  <AdminLayout>
    <div className="bg-white border border-border p-16 text-center rounded-card shadow-sm flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-surface-sunken border border-border flex items-center justify-center text-brand">
        <Info className="w-6 h-6" />
      </div>
      <div className="space-y-0.5">
        <h4 className="font-heading font-bold text-xs text-text-primary">{title} Section</h4>
        <p className="text-[11px] font-body text-text-secondary">This section is currently under development for future milestones.</p>
      </div>
    </div>
  </AdminLayout>
);

export const App = () => {
  const { isAuthenticated, role } = useAuthStore();
  const fetchRegistry = useStoreRegistry(state => state.fetchRegistry);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/amigos/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Corporate / HQ Routes */}
          <Route 
            path="/hq" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <Showcase />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/franchises" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <Franchises />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/menu" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <Menu />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/promotions" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <Promotions />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/banners" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <Banners />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/pricing-templates" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <ComingSoon title="Pricing Tiers" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/loyalty" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <ComingSoon title="Loyalty Rules" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/feature-flags" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <ComingSoon title="Feature Flags" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/compliance" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <ComingSoon title="Compliance Policies" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/hq/reporting" 
            element={
              <ScopedRoute allowedRoles={['corporate']}>
                <HQReporting />
              </ScopedRoute>
            } 
          />
          
          {/* Franchise / Area Routes */}
          <Route 
            path="/franchise" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseDashboard />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/stores" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseStores />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/hours" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseHours />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/offers" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseOffers />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/reporting" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseReporting />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/staff" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseStaff />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/franchise/overrides" 
            element={
              <ScopedRoute allowedRoles={['franchise']}>
                <FranchiseOverrides />
              </ScopedRoute>
            } 
          />
          
          {/* Store Console Routes */}
          <Route 
            path="/store" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreDashboard />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/orders" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreOrders />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/inventory" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreInventory />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/operations" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreOperations />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/hours" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreHours />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/delivery-zone" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <StoreDeliveryZone />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/drivers" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <ComingSoon title="Drivers Assignment" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/refunds" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <ComingSoon title="Refunds & Voids" />
              </ScopedRoute>
            } 
          />
          <Route 
            path="/store/reporting" 
            element={
              <ScopedRoute allowedRoles={['store']}>
                <ComingSoon title="Store Analytics" />
              </ScopedRoute>
            } 
          />
          
          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                role === 'corporate' ? (
                  <Navigate to="/hq" replace />
                ) : role === 'franchise' ? (
                  <Navigate to="/franchise" replace />
                ) : (
                  <Navigate to="/store" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
