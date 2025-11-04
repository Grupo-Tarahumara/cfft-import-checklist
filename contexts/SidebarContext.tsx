'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  shouldAnimate: boolean;
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  isHydrated: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hidrate after mount to avoid hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
    // Initialize from localStorage if available (only for desktop)
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed, isHydrated]);

  const toggleSidebar = () => {
    setShouldAnimate(true);
    setIsCollapsed(prev => !prev);
    // Reset animation flag after animation completes
    setTimeout(() => setShouldAnimate(false), 300);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, shouldAnimate, isMobileOpen, toggleMobileSidebar, isHydrated }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
