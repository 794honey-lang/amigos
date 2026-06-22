import { create } from 'zustand';

const API_URL = 'http://localhost:5050/api';

export const useAuthStore = create((set, get) => {
  // Initialize from localStorage (session cache — fast page refresh)
  const storedUser    = localStorage.getItem('amigos_auth_user');
  const storedToken   = localStorage.getItem('amigos_auth_token');
  const storedIsStaff = localStorage.getItem('amigos_auth_is_staff');

  return {
    user:            storedUser ? JSON.parse(storedUser) : null,
    token:           storedToken || null,
    isAuthenticated: !!storedToken,
    isStaff:         storedIsStaff === 'true',

    // Called after successful login — sets session AND fetches full profile from DB
    login: async (user, token, isStaff = false) => {
      // Write session immediately so app doesn't wait
      localStorage.setItem('amigos_auth_user',    JSON.stringify(user));
      localStorage.setItem('amigos_auth_token',   token);
      localStorage.setItem('amigos_auth_is_staff', String(isStaff));
      set({ user, token, isAuthenticated: true, isStaff });

      // Refresh full profile from DB (picks up addresses, favourites, walletBalance)
      if (user?.id) {
        try {
          const res = await fetch(`${API_URL}/users/${user.id}`);
          const data = await res.json();
          if (data.success) {
            const freshUser = { ...user, ...data.data };
            localStorage.setItem('amigos_auth_user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }
        } catch (e) {
          console.warn('Could not fetch fresh profile from DB — using login response data.', e);
        }
      }
    },

    logout: () => {
      localStorage.removeItem('amigos_auth_user');
      localStorage.removeItem('amigos_auth_token');
      localStorage.removeItem('amigos_auth_is_staff');
      set({ user: null, token: null, isAuthenticated: false, isStaff: false });
    },

    // updateUser — saves to localStorage cache AND persists to PostgreSQL
    updateUser: async (updatedUser) => {
      // Update localStorage and Zustand immediately (optimistic)
      localStorage.setItem('amigos_auth_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });

      // Persist to database in background
      if (updatedUser?.id) {
        try {
          await fetch(`${API_URL}/users/${updatedUser.id}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name:          updatedUser.name,
              email:         updatedUser.email,
              phone:         updatedUser.phone,
              addresses:     updatedUser.addresses,
              favourites:    updatedUser.favourites,
              walletBalance: updatedUser.walletBalance
            })
          });
        } catch (e) {
          console.warn('Failed to persist profile update to DB — localStorage updated only.', e);
        }
      }
    },

    // syncProfile — explicitly pull latest profile from DB (use on app mount)
    syncProfile: async () => {
      const { user } = get();
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/users/${user.id}`);
        const data = await res.json();
        if (data.success) {
          const freshUser = { ...user, ...data.data };
          localStorage.setItem('amigos_auth_user', JSON.stringify(freshUser));
          set({ user: freshUser });
        }
      } catch (e) {
        console.warn('syncProfile: could not reach backend.', e);
      }
    }
  };
});
