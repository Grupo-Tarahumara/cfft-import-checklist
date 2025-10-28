'use client';

import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.rol === 'admin';
  const isNormalUser = user?.rol === 'user';

  const canAccess = (requiredRoles: ('admin' | 'user')[]) => {
    return requiredRoles.includes(user?.rol as 'admin' | 'user');
  };

  return {
    isAdmin,
    isNormalUser,
    canAccess,
  };
}
