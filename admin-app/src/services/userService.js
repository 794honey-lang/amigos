const API_URL = 'http://localhost:5050/api';

export const userService = {
  getUsers: async (callerId) => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'x-caller-id': callerId
        }
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  createUser: async (callerId, userData) => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-caller-id': callerId
        },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  updateUser: async (callerId, id, userData) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-caller-id': callerId
        },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  deleteUser: async (callerId, id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-caller-id': callerId
        }
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
