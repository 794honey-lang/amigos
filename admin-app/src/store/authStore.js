import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  scope: { franchiseId: null, storeId: null },
  permissions: [],
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await authService.login(email, password);
    if (res.success) {
      const { user, role, scope, token } = res.data;
      set({
        user,
        role,
        scope,
        permissions: user.permissions || [],
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } else {
      set({ error: res.error, isLoading: false });
      return { success: false, error: res.error };
    }
  },

  logout: () => {
    set({
      user: null,
      role: null,
      scope: { franchiseId: null, storeId: null },
      permissions: [],
      token: null,
      isAuthenticated: false,
      error: null
    });
  }
}));
