import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@shared/components/shared/AppShell';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';

// Coming Soon placeholder component for Offers
const ComingSoon = ({ title }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg min-h-[70vh]">
    <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center text-brand mb-4">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="font-heading font-bold text-lg text-brand mb-1">{title}</h2>
    <p className="font-body text-xs text-text-secondary max-w-[240px] leading-relaxed">
      This page is currently being prepared and will be fully clickable in a later milestone!
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter basename="/amigos/customer">
      <Routes>
        {/* Full-screen routes (Nav is hidden) */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        
        {/* App Shell wrapped routes (Nav is visible except for checkout/tracking) */}
        <Route element={<AppShell appType="customer" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:itemId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/offers" element={<ComingSoon title="Offers & Coupons" />} />
        </Route>
        
        {/* Catch-all redirect to Splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
