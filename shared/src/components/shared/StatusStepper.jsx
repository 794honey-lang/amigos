import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_ITEMS = [
  {
    key: 'Placed',
    title: 'Order Placed',
    description: 'We have received your order.'
  },
  {
    key: 'Confirmed',
    title: 'Confirmed',
    description: 'Restaurant has accepted your order.'
  },
  {
    key: 'Preparing',
    title: 'Preparing',
    description: 'Your food is being prepared by our chefs.'
  },
  {
    key: 'Ready',
    title: 'Ready',
    description: 'Waiting to be picked up by the delivery partner.'
  },
  {
    key: 'OutForDelivery',
    title: 'Out for Delivery',
    description: 'Rider is on the way with your delicious food.'
  },
  {
    key: 'Delivered',
    title: 'Delivered',
    description: 'Enjoy your meal!'
  }
];

export const StatusStepper = ({ currentStatus = 'Placed', orderDate = 'Today, 11:45 AM', className = '' }) => {
  // If cancelled, show a cancelled banner/view instead of progress
  const isCancelled = currentStatus.toLowerCase() === 'cancelled';
  
  const currentIdx = STATUS_ITEMS.findIndex(
    item => item.key.toLowerCase() === currentStatus.toLowerCase()
  );

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-card flex flex-col items-center justify-center text-center gap-2">
          <span className="font-heading font-bold text-base">Order Cancelled</span>
          <p className="font-body text-xs text-red-600">This order was cancelled by the restaurant or customer.</p>
        </div>
      ) : (
        STATUS_ITEMS.map((item, index) => {
          const isCompleted = index < currentIdx;
          const isActive = index === currentIdx;
          const isPending = index > currentIdx;

          return (
            <div key={item.key} className="flex gap-4 relative">
              {/* Connector Line */}
              {index < STATUS_ITEMS.length - 1 && (
                <div 
                  className={`absolute left-3 top-7 bottom-0 w-0.5 -ml-px ${
                    index < currentIdx ? 'bg-success' : 'bg-stone-200'
                  }`}
                  style={{ minHeight: '40px' }}
                />
              )}

              {/* Status Indicator */}
              <div className="relative z-10 flex items-center justify-center shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-success bg-white fill-green-50" />
                ) : isActive ? (
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-6 h-6 rounded-full border-2 border-brand bg-white flex items-center justify-center"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-stone-300 bg-white" />
                )}
              </div>

              {/* Text Block */}
              <div className="flex flex-col pt-0.5">
                <div className="flex items-baseline gap-2">
                  <h4 className={`font-heading font-semibold text-sm ${
                    isActive ? 'text-brand' : isCompleted ? 'text-text-primary' : 'text-text-secondary'
                  }`}>
                    {item.title}
                  </h4>
                  {index === 0 && (
                    <span className="text-[10px] text-text-muted font-body font-medium">
                      {orderDate}
                    </span>
                  )}
                  {isActive && index > 0 && (
                    <span className="text-[10px] text-brand font-body font-semibold animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                
                <p className={`text-xs mt-0.5 font-body leading-relaxed ${
                  isActive ? 'text-text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
export default StatusStepper;
