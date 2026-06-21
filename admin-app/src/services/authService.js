import { mockUsers } from '../mocks/mockUsers';

export const authService = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          permissions: user.permissions
        },
        role: user.role,
        scope: {
          franchiseId: user.franchiseId,
          storeId: user.storeId
        },
        token: `mock-jwt-token-${user.id}`
      }
    };
  }
};
