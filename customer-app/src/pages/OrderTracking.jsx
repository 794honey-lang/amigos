import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HelpCircle, PhoneCall, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrderStore } from '@shared/store/orderStore';
import { useUiStore } from '@shared/store/uiStore';
import { StatusStepper } from '@shared/components/shared/StatusStepper';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';

export const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { activeOrder, fetchOrderById, loading } = useOrderStore();
  const { addToast } = useUiStore();

  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins in seconds

  // Fetch order details
  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = () => {
    addToast('Calling Amigos Restaurant (90704 94949)...', 'info');
  };

  if (loading || !activeOrder) {
    return (
      <div className="flex-1 bg-bg flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg min-h-screen">
      {/* Dark Theme Header */}
      <header className="bg-dark text-white px-4 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/home')}
            className="p-1 -ml-1 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-5.5 h-5.5" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-heading font-extrabold text-sm tracking-wide">
              Track Order
            </h1>
            <span className="text-[10px] text-white/60 font-body">
              Order #{activeOrder.id}
            </span>
          </div>
        </div>

        <Link
          to="#"
          onClick={(e) => { e.preventDefault(); addToast('Connecting to Amigos Help Desk...', 'info'); }}
          className="text-xs font-heading font-bold text-gold hover:underline flex items-center gap-1"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </Link>
      </header>

      {/* Estimations & Tracker Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* Estimate Details Card */}
        <Card className="p-5 text-center flex flex-col items-center gap-3 relative overflow-hidden bg-white border border-border shadow-sm">
          {/* Animated Pizza Graphic Background or Header */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="w-18 h-18 text-brand shrink-0 opacity-90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-brand">
              <path d="M15 11h.01M11 15h.01M10 10h.01M14 14h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 22v-2M12 4V2M2 12h2M20 12h2" strokeLinecap="round"/>
              <path d="M5.5 12a6.5 6.5 0 0113 0M6.5 12a5.5 5.5 0 0111 0" strokeLinecap="round"/>
            </svg>
          </motion.div>

          <div className="space-y-1">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted">
              Estimated Delivery
            </span>
            <h2 className="font-heading font-extrabold text-xl text-brand">
              {formatTime(timeLeft)} Mins
            </h2>
            <p className="text-[10px] text-text-secondary font-body">
              Your pizza is freshly baking in our brick-oven.
            </p>
          </div>
        </Card>

        {/* Stepper Card */}
        <Card className="p-6 bg-white border border-border shadow-sm">
          <StatusStepper currentStatus={activeOrder.status} orderDate={activeOrder.date} />
        </Card>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border px-5 py-4 flex gap-3 z-40 shadow-2xl rounded-t-sheet">
        <button
          onClick={handleCall}
          className="flex-1 border border-brand text-brand font-heading font-semibold rounded-pill py-3 px-4 shadow-sm hover:bg-brand/5 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <PhoneCall className="w-4 h-4" />
          Call Restaurant
        </button>

        <Button
          onClick={() => navigate('/home')}
          variant="primary"
          className="flex-1 text-xs py-3 font-heading font-semibold"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default OrderTracking;
