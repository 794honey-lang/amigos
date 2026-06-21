import { create } from 'zustand';

export const useAuthStore = create((set) => {
  // Initialize state from localStorage
  const storedUser = localStorage.getItem('amigos_auth_user');
  const storedToken = localStorage.getItem('amigos_auth_token');
  const storedIsStaff = localStorage.getItem('amigos_auth_is_staff');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    isStaff: storedIsStaff === 'true',

    login: (user, token, isStaff = false) => {
      localStorage.setItem('amigos_auth_user', JSON.stringify(user));
      localStorage.setItem('amigos_auth_token', token);
      localStorage.setItem('amigos_auth_is_staff', String(isStaff));
      set({ user, token, isAuthenticated: true, isStaff });
    },

    logout: () => {
      localStorage.removeItem('amigos_auth_user');
      localStorage.removeItem('amigos_auth_token');
      localStorage.removeItem('amigos_auth_is_staff');
      set({ user: null, token: null, isAuthenticated: false, isStaff: false });
    },

    updateUser: (updatedUser) => {
      localStorage.setItem('amigos_auth_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  };
});
