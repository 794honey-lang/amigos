import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black cursor-pointer"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`relative w-full max-w-[480px] bg-white rounded-t-sheet shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] ${className}`}
          >
            {/* Drag Handle & Close */}
            <div className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing border-b border-border">
              <div className="w-12 h-1 bg-stone-300 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between px-6">
                {title && <h3 className="font-heading font-bold text-lg text-text-primary">{title}</h3>}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-text-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default BottomSheet;
