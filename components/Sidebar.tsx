'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import Image from 'next/image';
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  UsersIcon,
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: ChartBarIcon, roles: ['admin'] as const },
  { href: '/inspecciones', label: 'Inspecciones', Icon: ClipboardDocumentCheckIcon, roles: ['admin', 'user'] as const },
  { href: '/alertas', label: 'Alertas', Icon: ExclamationTriangleIcon, roles: ['admin'] as const },
  { href: '/notificaciones', label: 'Notificaciones', Icon: BellIcon, roles: ['admin'] as const },
  {
    label: 'Catálogos',
    Icon: BookOpenIcon,
    roles: ['admin'] as const,
    submenu: [
      { href: '/usuarios', label: 'Usuarios', Icon: UsersIcon, roles: ['admin'] as const },
      { href: '/proveedores', label: 'Proveedores', Icon: TruckIcon, roles: ['admin'] as const },
      { href: '/frutas', label: 'Frutas', Icon: SparklesIcon, roles: ['admin'] as const },
      { href: '/puntos-inspeccion', label: 'Puntos de Inspección', Icon: MapPinIcon, roles: ['admin'] as const },
    ]
  },
];

const isValidRole = (role: string): role is 'admin' | 'user' => {
  return role === 'admin' || role === 'user';
};

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar();

  
  const activeCatalogo = menuItems.find(item =>
    item.submenu?.some(sub => pathname === sub.href)
  );

  useEffect(() => {
    if (activeCatalogo && expandedMenu === null) {
      setExpandedMenu(activeCatalogo.label);
    }
  }, [activeCatalogo, expandedMenu]);


  useEffect(() => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  }, [pathname, isMobileOpen, toggleMobileSidebar]);

 
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

     
      <motion.aside
        animate={{
          width: isMobile ? '280px' : (isCollapsed ? '80px' : '16rem')
        }}
        transition={{ duration: 0.3 }}
        className={`bg-background text-foreground h-screen shadow-lg border-r border-border flex flex-col
                   fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out
                   pt-16 lg:pt-0 lg:sticky lg:left-auto lg:top-0
                   ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-8 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          {isCollapsed ? (
            <Bars3Icon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 lg:px-4 lg:py-6 scrollbar-hide ${isCollapsed ? 'lg:px-2 lg:py-4' : ''}`}>
        
        <div className={`pb-3 lg:pb-4 border-b border-border mb-4 lg:mb-6 ${isCollapsed ? 'lg:mb-4' : ''}`}>
          <div className="flex flex-col items-center">
            <div className={`relative mb-3 lg:mb-4 ${isCollapsed ? 'lg:mb-2' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl blur-md opacity-20 ${isCollapsed ? 'lg:rounded-xl' : ''}`}></div>
              <div className={`relative bg-card rounded-2xl shadow-lg border border-border transition-all duration-300 ${
                isCollapsed ? 'lg:p-2.5 lg:rounded-xl' : 'p-2 lg:p-4'
              }`}>
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className={`object-contain drop-shadow-lg transition-all duration-300 ${
                    isCollapsed ? 'w-12 h-12 lg:w-11 lg:h-11' : 'w-12 h-12 lg:w-14 lg:h-14'
                  }`}
                />
              </div>
            </div>
            <div className={`text-center transition-all duration-300 ${isCollapsed ? 'lg:hidden' : 'mt-3 lg:mt-4'}`}>
              <h1 className="text-lg lg:text-xl font-bold text-foreground mb-1">
                CFFT Import
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <ul className="space-y-1.5">
          {menuItems.map((item, index) => {
            if (!user) {
              return null;
            }
            if (!isValidRole(user.rol)) {
              return null;
            }
            const userRole: 'admin' | 'user' = user.rol;
            if (!item.roles.includes(userRole as 'admin')) {
              return null;
            }

            const isExpanded = expandedMenu === item.label;
            const hasActiveSubmenu = item.submenu?.some(sub => pathname === sub.href && sub.roles.includes(userRole as 'admin'));

            return (
              <li key={index}>
                {item.submenu ? (
                  <div>
                    <motion.button
                      onClick={() => {
                        setExpandedMenu(isExpanded ? null : item.label);
                      }}
                      className={`w-full flex items-center rounded-lg transition-all duration-200 group ${
                        (isMobile || !isCollapsed) ? 'justify-between px-4 py-3' : 'justify-center px-2 py-3'
                      } ${
                        hasActiveSubmenu || isExpanded
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      whileHover={{ x: (isMobile || !isCollapsed) ? 4 : 0 }}
                      whileTap={{ scale: 0.98 }}
                      title={(isMobile || !isCollapsed) ? '' : item.label}
                    >
                      {(isMobile || !isCollapsed) ? (
                        <>
                          <div className="flex items-center">
                            <item.Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </motion.div>
                        </>
                      ) : (
                        <item.Icon className="w-5 h-5" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {!isMobile && isCollapsed && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-1.5 ml-1 pl-2 border-l-2 border-primary/30 space-y-1"
                        >
                          {item.submenu.filter(subitem => user && subitem.roles.includes(userRole as 'admin')).map((subitem, subindex) => {
                            const isActive = pathname === subitem.href;
                            return (
                              <motion.div
                                key={subindex}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: subindex * 0.05 }}
                              >
                                <Link
                                  href={subitem.href}
                                  className={`flex items-center justify-center px-2 py-2.5 rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground shadow-md'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                  title={subitem.label}
                                >
                                  <subitem.Icon className="w-4 h-4" />
                                </Link>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isExpanded && (isMobile || !isCollapsed) && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-4 mt-1.5 space-y-1 overflow-hidden border-l-2 border-border pl-3"
                        >
                          {item.submenu.filter(subitem => user && subitem.roles.includes(userRole as 'admin')).map((subitem, subindex) => {
                            const isActive = pathname === subitem.href;

                            return (
                              <motion.li
                                key={subindex}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: subindex * 0.05 }}
                              >
                                <Link
                                  href={subitem.href}
                                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground shadow-md'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  <subitem.Icon className="w-4 h-4 mr-3" />
                                  <span className="text-sm font-medium">{subitem.label}</span>
                                  {isActive && (
                                    <motion.div
                                      layoutId="activeSubmenu"
                                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                  )}
                                </Link>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ x: (isMobile || !isCollapsed) ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-lg transition-all duration-200 group relative ${
                        (isMobile || !isCollapsed) ? 'px-4 py-3' : 'justify-center px-2 py-3'
                      } ${
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={(isMobile || !isCollapsed) ? '' : item.label}
                    >
                      {(isMobile || !isCollapsed) ? (
                        <>
                          <item.Icon className="w-5 h-5 mr-3" />
                          <span className="font-medium">{item.label}</span>
                          {pathname === item.href && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-4 w-2 h-2 rounded-full bg-white"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </>
                      ) : (
                        <item.Icon className="w-5 h-5" />
                      )}
                    </Link>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>

      </nav>

      <div className={`border-t border-border bg-background ${isMobile ? 'p-6' : (isCollapsed ? 'p-3' : 'p-6')}`}>
        
        {user && (
          <div className={`bg-card rounded-lg border border-border ${isMobile ? 'p-4' : (isCollapsed ? 'p-2' : 'p-4')}`}>
            {!isMobile && isCollapsed ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center" title={user.username}>
                  <UserCircleIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <button
                  onClick={logout}
                  className="w-9 h-9 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Cerrar Sesión"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.rol === 'admin' ? 'Administrador' : 'Usuario'}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.aside>
    </>
  );
}
