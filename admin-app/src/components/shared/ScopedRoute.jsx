import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';

export const ScopedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuthStore();
  const { currentStoreId } = useScopeStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let isAllowed = false;
  if (allowedRoles && allowedRoles.includes(role)) {
    isAllowed = true;
  } else if (role === 'corporate') {
    isAllowed = true; // Corporate/HQ has universal access
  } else if (role === 'franchise' && allowedRoles && allowedRoles.includes('store') && currentStoreId) {
    isAllowed = true; // Franchise can access store console if they are acting on behalf of a store
  }

  if (!isAllowed) {
    if (role === 'corporate') return <Navigate to="/hq" replace />;
    if (role === 'franchise') return <Navigate to="/franchise" replace />;
    if (role === 'store') return <Navigate to="/store" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ScopedRoute;
