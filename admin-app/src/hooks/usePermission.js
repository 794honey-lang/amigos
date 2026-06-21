import { useAuthStore } from '../store/authStore';

export const usePermission = () => {
  const { permissions, role } = useAuthStore();

  const hasPermission = (permission) => {
    if (!permissions) return false;
    if (role === 'corporate') return true; // Corporate has access to everything
    return permissions.includes('*') || permissions.includes(permission);
  };

  return { hasPermission, role, permissions };
};

export default usePermission;
