'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  shouldAnimate: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      return savedState === 'true';
    }
    return false;
  });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setShouldAnimate(true);
    setIsCollapsed(prev => !prev);
    // Reset animation flag after animation completes
    setTimeout(() => setShouldAnimate(false), 300);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, shouldAnimate }}>
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
