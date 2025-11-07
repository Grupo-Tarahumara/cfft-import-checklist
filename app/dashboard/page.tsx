'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NotificationPermission } from '@/components/NotificationPermission';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Alerta } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  FireIcon,
  CalendarIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inspeccionesData, alertasData] = await Promise.all([
        authApi.get<Inspeccion[]>('/inspecciones'),
        authApi.get<Alerta[]>('/alertas?noLeidas=true'),
      ]);

      // Tomar solo las últimas 5 inspecciones
      setInspecciones(inspeccionesData.slice(0, 5));
      setAlertasNoLeidas(alertasData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    {
      label: 'Total Inspecciones',
      value: inspecciones.length,
      icon: ClipboardDocumentListIcon,
      color: 'blue'
    },
    {
      label: 'Con Alertas',
      value: inspecciones.filter(i => i.tieneAlertas).length,
      icon: ExclamationTriangleIcon,
      color: 'orange'
    },
    {
      label: 'Alertas No Leídas',
      value: alertasNoLeidas.length,
      icon: BellAlertIcon,
      color: 'red'
    },
    {
      label: 'Alertas Críticas',
      value: alertasNoLeidas.filter(a => a.criticidad === 'alta').length,
      icon: FireIcon,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-muted to-muted/80',
      orange: 'from-muted/80 to-muted/60',
      red: 'from-muted/90 to-muted/70'
    };
    return colors[color as keyof typeof colors] || 'from-muted to-muted/80';
  };

  const getCriticidadStyles = (criticidad: string) => {
    const styles = {
      alta: {
        border: 'border-muted-foreground/30',
        bg: 'bg-muted/30',
        text: 'text-muted-foreground',
        badge: 'bg-muted/50 text-muted-foreground'
      },
      media: {
        border: 'border-muted-foreground/20',
        bg: 'bg-muted/20',
        text: 'text-muted-foreground',
        badge: 'bg-muted/40 text-muted-foreground'
      },
      baja: {
        border: 'border-muted-foreground/15',
        bg: 'bg-muted/15',
        text: 'text-muted-foreground',
        badge: 'bg-muted/30 text-muted-foreground'
      }
    };
    return styles[criticidad as keyof typeof styles] || styles.baja;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando datos del dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-lg">
              Resumen general de inspecciones y alertas del sistema
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 md:px-5 py-2 md:py-2.5 rounded-lg border border-border transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </motion.div>

        {/* Notificaciones Push */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <NotificationPermission />
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-border group-hover:border-border">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <p className="text-2xl md:text-3xl font-bold text-card-foreground mb-1">{stat.value}</p>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alertas No Leídas */}
        {alertasNoLeidas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card rounded-xl md:rounded-2xl shadow-lg border border-border overflow-hidden"
          >
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <BellAlertIcon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-card-foreground">Alertas Pendientes</h2>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      {alertasNoLeidas.length} alertas requieren atención
                    </p>
                  </div>
                </div>
                <Link
                  href="/alertas"
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Ver todas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {alertasNoLeidas.slice(0, 5).map((alerta, index) => {
                const styles = getCriticidadStyles(alerta.criticidad);
                return (
                  <Link
                    key={alerta.id}
                    href={`/inspecciones/${alerta.inspeccionId}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl border-l-4 ${styles.border} ${styles.bg} hover:shadow-md transition-all duration-200 cursor-pointer hover:brightness-95`}
                    >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <p className="font-semibold text-sm md:text-base text-gray-900">{alerta.tipoAlerta}</p>
                          <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full font-medium ${styles.badge}`}>
                            {alerta.criticidad.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">{alerta.descripcion}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{new Date(alerta.fechaCreacion).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BuildingStorefrontIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span>Inspección #{alerta.inspeccionId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Últimas Inspecciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-card rounded-xl md:rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-card-foreground">Últimas Inspecciones</h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {inspecciones.length} inspecciones recientes
                  </p>
                </div>
              </div>
              <Link
                href="/inspecciones"
                className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>Ver todas</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {inspecciones.map((inspeccion, index) => (
              <Link
                key={inspeccion.id}
                href={`/inspecciones/${inspeccion.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-3 md:p-4 rounded-lg md:rounded-xl border border-border hover:border-border hover:shadow-md transition-all duration-200 bg-gradient-to-r from-card to-card/95 cursor-pointer"
                >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="p-1.5 md:p-2 bg-muted rounded-lg">
                      <TruckIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-card-foreground">
                        {inspeccion.numeroOrdenContenedor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inspeccion.proveedor?.nombre || '-'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                    {inspeccion.estado}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{new Date(inspeccion.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BuildingStorefrontIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{inspeccion.fruta?.nombre || '-'}</span>
                    </div>
                  </div>
                  <div>
                    {inspeccion.tieneAlertas ? (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <ExclamationTriangleIcon className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="font-medium text-xs">Con alertas</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <CheckBadgeIcon className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="font-medium text-xs">Sin alertas</span>
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}