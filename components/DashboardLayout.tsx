'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border/50 px-3 py-2.5 flex items-center gap-2">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground">
          CFFT Import
        </h1>
      </div>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden pt-14 lg:pt-0 p-3 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base font-medium">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardContent>{children}</DashboardContent>;
}
