import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Percent, Receipt, User } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
  { label: 'Offers', path: '/offers', icon: Percent }, // or mock offers tab
  { label: 'Orders', path: '/orders', icon: Receipt },
  { label: 'Profile', path: '/profile', icon: User }
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-t border-border flex items-center justify-around px-4 z-40 shadow-lg rounded-t-sheet">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path === '/menu' && currentPath.startsWith('/menu'));

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center w-12 h-12 relative"
          >
            <div className="relative z-10 flex flex-col items-center">
              <Icon 
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                }`} 
              />
              <span 
                className={`text-[10px] font-heading font-medium mt-1 transition-colors duration-200 ${
                  isActive ? 'text-brand font-semibold' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </div>

            {/* Active Indicator Pulse */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute inset-0 bg-brand/5 rounded-card -z-0"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
