import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BottomNav } from '../ui/BottomNav';
import { ToastContainer } from '../ui/Toast';
import { useCartStore } from '../../store/cartStore';

export const AppShell = ({ appType = 'customer' }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  // Retrieve cart details
  const { items, toPay } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  // Decide if navigation is visible in Customer App
  // Hidden on Splash (/), Login (/login), OTP (/otp), Checkout (/checkout), and Order Tracking (/order/:id)
  const isNavHidden = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/otp' || 
    pathname === '/checkout' || 
    pathname.startsWith('/order/') ||
    (pathname.startsWith('/menu/') && pathname !== '/menu');

  const showCartStrip = items.length > 0 && pathname !== '/cart' && !isNavHidden;

  if (appType === 'restaurant') {
    // Restaurant App Shell (No phone border, standard responsive container)
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col">
        <ToastContainer />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    );
  }

  // Customer App Shell (Centered phone frame floating on desktop backdrop)
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      {/* Toast popup layer */}
      <ToastContainer />

      {/* Floating Phone Frame */}
      <div className="w-full max-w-[480px] min-h-screen bg-bg shadow-2xl relative flex flex-col overflow-x-hidden border-x border-stone-200">
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${isNavHidden ? 'pb-0' : 'pb-16'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Cart Strip (Zomato Style) */}
        <AnimatePresence>
          {showCartStrip && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => navigate('/cart')}
              className="fixed bottom-[76px] left-1/2 w-[calc(100%-2rem)] max-w-[448px] h-14 bg-gradient-to-r from-brand to-brand-accent text-white px-4 rounded-card flex items-center justify-between shadow-xl cursor-pointer z-30 select-none hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                {items[0]?.image ? (
                  <img 
                    src={items[0].image} 
                    alt={items[0].name} 
                    className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-white/80 font-medium font-body leading-none">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} added
                  </span>
                  <span className="text-xs text-white font-extrabold font-heading mt-0.5">
                    ₹{toPay}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-white font-heading font-bold text-xs tracking-wide">
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bottom Nav */}
        {!isNavHidden && <BottomNav />}
      </div>
    </div>
  );
};

export default AppShell;

