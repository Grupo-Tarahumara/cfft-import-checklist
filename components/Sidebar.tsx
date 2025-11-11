'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  { href: '/dashboard', label: 'Dashboard', Icon: ChartBarIcon, roles: ['admin'] },
  { href: '/inspecciones', label: 'Inspecciones', Icon: ClipboardDocumentCheckIcon, roles: ['admin', 'user'] },
  { href: '/alertas', label: 'Alertas', Icon: ExclamationTriangleIcon, roles: ['admin'] },
  { href: '/notificaciones', label: 'Notificaciones', Icon: BellIcon, roles: ['admin'] },
  {
    label: 'Catálogos',
    Icon: BookOpenIcon,
    roles: ['admin'],
    submenu: [
      { href: '/usuarios', label: 'Usuarios', Icon: UsersIcon, roles: ['admin'] },
      { href: '/proveedores', label: 'Proveedores', Icon: TruckIcon, roles: ['admin'] },
      { href: '/frutas', label: 'Frutas', Icon: SparklesIcon, roles: ['admin'] },
      { href: '/puntos-inspeccion', label: 'Puntos de Inspección', Icon: MapPinIcon, roles: ['admin'] },
    ]
  },
];

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

  // Close mobile sidebar when route changes
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

  const sidebarWidth = isMobile ? '280px' : (isCollapsed ? '80px' : '16rem');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: sidebarWidth }}
        className={`bg-card text-card-foreground h-screen shadow-lg border-r border-border flex flex-col
                   fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out
                   pt-16 lg:pt-0 lg:sticky lg:left-auto lg:top-0
                   ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-1.5 rounded-full shadow-lg transition-colors"
        >
          {isCollapsed ? (
            <Bars3Icon className="w-3 h-3" />
          ) : (
            <ChevronLeftIcon className="w-3 h-3" />
          )}
        </button>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 lg:px-3 lg:py-4 ${isCollapsed ? 'lg:px-2 lg:py-3' : ''}`}>
        {/* Logo Section */}
        <div className={`pb-2 lg:pb-3 border-b border-border/50 mb-3 lg:mb-4 ${isCollapsed ? 'lg:mb-3' : ''}`}>
          <div className="flex flex-col items-center">
            <div className={`relative mb-2 lg:mb-3 ${isCollapsed ? 'lg:mb-2' : ''}`}>
              <div className={`relative bg-card rounded-xl shadow-sm border border-border/50 ${
                isCollapsed ? 'lg:p-2 lg:rounded-lg' : 'p-2 lg:p-3'
              }`}>
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className={`object-contain ${
                    isCollapsed ? 'w-10 h-10 lg:w-9 lg:h-9' : 'w-10 h-10 lg:w-12 lg:h-12'
                  }`}
                />
              </div>
            </div>
            <div className={`text-center ${isCollapsed ? 'lg:hidden' : 'mt-2 lg:mt-3'}`}>
              <h1 className="text-base lg:text-lg font-bold text-foreground mb-0.5">
                CFFT Import
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            // Filtrar items según el rol del usuario
            if (!user || !item.roles.includes(user.rol)) {
              return null;
            }

            const isExpanded = expandedMenu === item.label;
            const hasActiveSubmenu = item.submenu?.some(sub => pathname === sub.href && user.rol && sub.roles.includes(user.rol));

            return (
              <li key={index}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => {
                        setExpandedMenu(isExpanded ? null : item.label);
                      }}
                      className={`w-full flex items-center rounded transition-colors ${
                        (isMobile || !isCollapsed) ? 'justify-between px-3 py-2' : 'justify-center px-2 py-2'
                      } ${
                        hasActiveSubmenu || isExpanded
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={(isMobile || !isCollapsed) ? '' : item.label}
                    >
                      {(isMobile || !isCollapsed) ? (
                        <>
                          <div className="flex items-center">
                            <item.Icon className="w-4 h-4 mr-2" />
                            <span className="font-medium text-xs">{item.label}</span>
                          </div>
                          <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </>
                      ) : (
                        <item.Icon className="w-4 h-4" />
                      )}
                    </button>

                    {/* Submenu when collapsed */}
                    {!isMobile && isCollapsed && isExpanded && (
                      <div className="mt-1 ml-1 pl-1.5 border-l-2 border-primary/30 space-y-0.5">
                        {item.submenu.filter(subitem => user && subitem.roles.includes(user.rol)).map((subitem, subindex) => {
                          const isActive = pathname === subitem.href;
                          return (
                            <div key={subindex}>
                              <Link
                                href={subitem.href}
                                className={`flex items-center justify-center px-1.5 py-1.5 rounded transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                title={subitem.label}
                              >
                                <subitem.Icon className="w-3 h-3" />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Submenu when expanded */}
                    {isExpanded && (isMobile || !isCollapsed) && (
                      <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-border/50 pl-2">
                        {item.submenu.filter(subitem => user && subitem.roles.includes(user.rol)).map((subitem, subindex) => {
                          const isActive = pathname === subitem.href;

                          return (
                            <li key={subindex}>
                              <Link
                                href={subitem.href}
                                className={`flex items-center px-3 py-1.5 rounded transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                              >
                                <subitem.Icon className="w-3 h-3 mr-2" />
                                <span className="text-xs font-medium">{subitem.label}</span>
                                {isActive && (
                                  <div className="ml-auto w-1 h-1 rounded-full bg-white" />
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded transition-colors relative ${
                        (isMobile || !isCollapsed) ? 'px-3 py-2' : 'justify-center px-2 py-2'
                      } ${
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={(isMobile || !isCollapsed) ? '' : item.label}
                    >
                      {(isMobile || !isCollapsed) ? (
                        <>
                          <item.Icon className="w-4 h-4 mr-2" />
                          <span className="font-medium text-xs">{item.label}</span>
                          {pathname === item.href && (
                            <div className="absolute right-3 w-1 h-1 rounded-full bg-white" />
                          )}
                        </>
                      ) : (
                        <item.Icon className="w-4 h-4" />
                      )}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

      </nav>

      <div className={`border-t border-border/50 bg-card ${isMobile ? 'p-4' : (isCollapsed ? 'p-2' : 'p-3')}`}>
        {/* User Info */}
        {user && (
          <div className={`bg-background rounded border border-border/50 ${isMobile ? 'p-3' : (isCollapsed ? 'p-2' : 'p-3')}`}>
            {!isMobile && isCollapsed ? (
              <div className="flex flex-col items-center space-y-1.5">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center" title={user.username}>
                  <UserCircleIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <button
                  onClick={logout}
                  className="w-8 h-8 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded transition-colors shadow-sm"
                  title="Cerrar Sesión"
                >
                  <ArrowRightOnRectangleIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.rol === 'admin' ? 'Administrador' : 'Usuario'}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded transition-colors shadow-sm font-medium text-xs"
                >
                  <ArrowRightOnRectangleIcon className="w-3 h-3" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
