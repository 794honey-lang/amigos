import React from 'react';
import { useUiStore } from '../../store/uiStore';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 p-4 rounded-card border shadow-lg bg-white transition-all"
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-success" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-danger" />}
          </div>
          <p className="text-xs font-body font-medium text-text-primary flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-stone-50 rounded-full text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
