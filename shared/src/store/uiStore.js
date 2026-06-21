import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, message, type };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
