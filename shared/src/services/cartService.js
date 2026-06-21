// cartService is local-only, talks to Zustand store or localStorage
// Structured so it can be swapped for a backend synced cart if needed in the future.
export const cartService = {
  getCart() {
    try {
      const cart = localStorage.getItem('amigos-cart-store');
      return cart ? JSON.parse(cart) : null;
    } catch (e) {
      return null;
    }
  },
  
  saveCart(cartData) {
    try {
      localStorage.setItem('amigos-cart-store', JSON.stringify(cartData));
      return true;
    } catch (e) {
      return false;
    }
  },

  clearCart() {
    try {
      localStorage.removeItem('amigos-cart-store');
      return true;
    } catch (e) {
      return false;
    }
  }
};
