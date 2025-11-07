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
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Con Alertas',
      value: inspecciones.filter(i => i.tieneAlertas).length,
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Alertas No Leídas',
      value: alertasNoLeidas.length,
      icon: BellAlertIcon,
      bgColor: 'bg-blue-50'
    }
  ];

  const getCriticidadStyles = (criticidad: string) => {
    const styles = {
      alta: {
        border: 'border-l-destructive/40',
        bg: 'bg-card border border-border',
        text: 'text-foreground',
        badge: 'bg-destructive/10 text-destructive border border-destructive/20'
      },
      media: {
        border: 'border-l-amber-500/40',
        bg: 'bg-card border border-border',
        text: 'text-foreground',
        badge: 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
      },
      baja: {
        border: 'border-l-primary/40',
        bg: 'bg-card border border-border',
        text: 'text-foreground',
        badge: 'bg-primary/10 text-primary border border-primary/20'
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
      <div className="space-y-3 md:space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-2"
        >
          <div className="py-5">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground ">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Bienvenido. Aquí está el resumen de tu sistema
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-muted/50 hover:bg-muted text-muted-foreground px-4 md:px-5 py-2 md:py-2.5 rounded-lg border border-border transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="rounded-lg border border-border bg-card p-4 md:p-6 transition-all hover:shadow-md hover:border-border/60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alertas No Leídas e Inspecciones - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
          {/* Alertas No Leídas */}
          {alertasNoLeidas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-lg border border-border bg-card overflow-hidden flex flex-col h-full"
            >
              <div className="p-3 md:p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted/50">
                      <BellAlertIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Alertas Pendientes</h2>
                      <p className="text-xs text-muted-foreground">
                        {alertasNoLeidas.length} alertas requieren atención
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/alertas"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Ver todas →
                  </Link>
                </div>
              </div>

              <div className="p-3 md:p-4 space-y-2 flex-1">
                {alertasNoLeidas.slice(0, 4).map((alerta, index) => {
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
                        className="p-3 rounded-md border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer hover:border-border/80"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm text-foreground">{alerta.tipoAlerta}</p>
                          <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${styles.badge}`}>
                            {alerta.criticidad.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alerta.descripcion}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{new Date(alerta.fechaCreacion).toLocaleDateString('es-ES')}</span>
                          <span>•</span>
                          <span>ID: {alerta.inspeccionId}</span>
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
            className="rounded-lg border border-border bg-card overflow-hidden flex flex-col h-full"
          >
            <div className="p-3 md:p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-muted/50">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Últimas Inspecciones</h2>
                    <p className="text-xs text-muted-foreground">
                      {inspecciones.length} inspecciones recientes
                    </p>
                  </div>
                </div>
                <Link
                  href="/inspecciones"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ver todas →
                </Link>
              </div>
            </div>

            <div className="p-3 md:p-4 space-y-2 flex-1">
              {inspecciones.slice(0, 4).map((inspeccion, index) => (
              <Link
                key={inspeccion.id}
                href={`/inspecciones/${inspeccion.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-3 rounded-md border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-border/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-center min-h-[100px]"
                >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center space-x-1 min-w-0">
                    <div className="p-1 bg-muted/50 rounded">
                      <TruckIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {inspeccion.numeroOrdenContenedor}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {inspeccion.proveedor?.nombre || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {inspeccion.tieneAlertas ? (
                      <ExclamationTriangleIcon className="h-4 w-4 text-destructive/70" />
                    ) : (
                      <CheckBadgeIcon className="h-4 w-4 text-green-600/60" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-0.5">
                    <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                    <span>{new Date(inspeccion.fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <BuildingStorefrontIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{inspeccion.fruta?.nombre || '-'}</span>
                  </div>
                </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </DashboardLayout>
  );
}