'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'user')[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'user']
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && user && !allowedRoles.includes(user.rol)) {
      // Si el usuario no tiene permiso, redirigir a inspecciones (página permitida para todos)
      router.push('/inspecciones');
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/20 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-600/10"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.rol)) {
    return null;
  }

  return <>{children}</>;
}
