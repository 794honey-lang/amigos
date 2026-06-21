import React from 'react';
import { usePermission } from '../../hooks/usePermission';

export const PermissionGate = ({ permission, fallback = null, children }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return fallback;
};

export default PermissionGate;
