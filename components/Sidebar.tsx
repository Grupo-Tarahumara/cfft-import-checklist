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
  { href: '/dashboard', label: 'Dashboard', Icon: ChartBarIcon },
  { href: '/inspecciones', label: 'Inspecciones', Icon: ClipboardDocumentCheckIcon },
  { href: '/alertas', label: 'Alertas', Icon: ExclamationTriangleIcon },
  { href: '/notificaciones', label: 'Notificaciones', Icon: BellIcon },
  {
    label: 'Catálogos',
    Icon: BookOpenIcon,
    submenu: [
      { href: '/usuarios', label: 'Usuarios', Icon: UsersIcon },
      { href: '/proveedores', label: 'Proveedores', Icon: TruckIcon },
      { href: '/frutas', label: 'Frutas', Icon: SparklesIcon },
      { href: '/puntos-inspeccion', label: 'Puntos de Inspección', Icon: MapPinIcon },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar, shouldAnimate } = useSidebar();

  // Auto-expand Catálogos if any of its submenu items are active on initial load
  const activeCatalogo = menuItems.find(item =>
    item.submenu?.some(sub => pathname === sub.href)
  );

  // Keep Catálogos expanded if any submenu item is active (only on mount)
  useEffect(() => {
    if (activeCatalogo && expandedMenu === null) {
      setExpandedMenu(activeCatalogo.label);
    }
  }, []); // Only run on mount

  const sidebarWidth = isCollapsed ? '80px' : '18rem';

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: shouldAnimate ? 0.3 : 0, ease: 'easeInOut' }}
      style={{ width: sidebarWidth }}
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen shadow-2xl border-r border-slate-700/50 flex flex-col sticky top-0 relative"
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        {isCollapsed ? (
          <Bars3Icon className="w-4 h-4" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4" />
        )}
      </button>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3 py-4' : 'p-6'}`}>
        {/* Logo y Header Section */}
        <div className={`pb-6 border-b border-slate-700/50 ${isCollapsed ? 'mb-4' : 'mb-8'}`}>
          <div className="flex flex-col items-center">
            <div className={`relative ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl blur-md opacity-30`}></div>
              <div className={`relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-xl border border-slate-600/50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="Logo"
                  width={isCollapsed ? 32 : 60}
                  height={isCollapsed ? 32 : 60}
                  className="object-contain drop-shadow-lg transition-all duration-300"
                />
              </div>
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mt-4"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                  CFFT Import
                </h1>
                <p className="text-xs text-slate-400 font-medium">Sistema de Gestión</p>
              </motion.div>
            )}
          </div>
        </div>

        <ul className="space-y-1.5">
          {menuItems.map((item, index) => {
            const isExpanded = expandedMenu === item.label;
            const hasActiveSubmenu = item.submenu?.some(sub => pathname === sub.href);

            return (
              <li key={index}>
                {item.submenu ? (
                  <div>
                    <motion.button
                      onClick={() => {
                        setExpandedMenu(isExpanded ? null : item.label);
                      }}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
                        isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'
                      } ${
                        hasActiveSubmenu || isExpanded
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                      whileHover={{ x: isCollapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      title={isCollapsed ? item.label : ''}
                    >
                      {isCollapsed ? (
                        <item.Icon className="w-5 h-5" />
                      ) : (
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
                      )}
                    </motion.button>

                    {/* Submenu icons when collapsed */}
                    <AnimatePresence>
                      {isCollapsed && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-1.5 ml-1 pl-2 border-l-2 border-blue-500/50 space-y-1"
                        >
                          {item.submenu.map((subitem, subindex) => {
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
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
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
                      {isExpanded && !isCollapsed && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-4 mt-1.5 space-y-1 overflow-hidden border-l-2 border-slate-700/50 pl-3"
                        >
                          {item.submenu.map((subitem, subindex) => {
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
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
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
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-xl transition-all duration-200 group relative ${
                        isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                      } ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      {isCollapsed ? (
                        <item.Icon className="w-5 h-5" />
                      ) : (
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
                      )}
                    </Link>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>

      </nav>

      {/* User Section - Sticky at bottom */}
      <div className={`border-t border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-800 ${isCollapsed ? 'p-3' : 'p-6'}`}>
        {/* User Info */}
        {user && (
          <div className={`bg-slate-800/50 rounded-xl border border-slate-700/50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center" title={user.username}>
                  <UserCircleIcon className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={logout}
                  className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Cerrar Sesión"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-slate-400">Administrador</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm"
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
  );
}
