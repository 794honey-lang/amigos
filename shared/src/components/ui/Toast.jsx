import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const toastBorders = {
  success: 'border-l-4 border-l-green-500',
  error: 'border-l-4 border-l-red-500',
  info: 'border-l-4 border-l-blue-500'
};

export const Toast = ({ id, message, type = 'success', onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      layout
      className={`bg-white rounded-card shadow-lg p-4 border border-stone-100 flex items-center justify-between gap-3 min-w-[280px] max-w-[400px] pointer-events-auto ${toastBorders[type]}`}
    >
      <div className="flex items-center gap-2.5">
        {toastIcons[type]}
        <span className="font-body text-sm font-medium text-text-primary">
          {message}
        </span>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-stone-50 text-text-muted transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-[420px] px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
