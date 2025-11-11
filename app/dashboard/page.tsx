'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NotificationPermission } from '@/components/NotificationPermission';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Alerta } from '@/types';
import Link from 'next/link';
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
    void loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [inspeccionesData, alertasData] = await Promise.all([
        authApi.get<Inspeccion[]>('/inspecciones'),
        authApi.get<Alerta[]>('/alertas?noLeidas=true'),
      ]);

      setInspecciones(inspeccionesData.slice(0, 5));
      setAlertasNoLeidas(alertasData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
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
    },
    {
      label: 'Con Alertas',
      value: inspecciones.filter(i => i.tieneAlertas).length,
      icon: ExclamationTriangleIcon,
    },
    {
      label: 'Alertas No Leídas',
      value: alertasNoLeidas.length,
      icon: BellAlertIcon,
    }
  ];

  const getCriticidadBadge = (criticidad: string): string => {
    const styles = {
      alta: 'bg-destructive/10 text-destructive border border-destructive/20',
      media: 'bg-primary/10 text-primary border border-primary/20',
      baja: 'bg-muted text-muted-foreground border border-border'
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Bienvenido. Aquí está el resumen de tu sistema</p>
          </div>
          <button
            onClick={() => { void handleRefresh() }}
            disabled={refreshing}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg border border-border transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>

        {/* Notificaciones Push */}
        <NotificationPermission />

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <stat.icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alertas No Leídas e Inspecciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alertas No Leídas */}
          {alertasNoLeidas.length > 0 && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <BellAlertIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Alertas Pendientes</h2>
                      <p className="text-sm text-muted-foreground">{alertasNoLeidas.length} alertas requieren atención</p>
                    </div>
                  </div>
                  <Link href="/alertas" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Ver todas →
                  </Link>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {alertasNoLeidas.slice(0, 4).map((alerta) => (
                  <Link key={alerta.id} href={`/inspecciones/${alerta.inspeccionId}`}>
                    <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-foreground">{alerta.tipoAlerta}</p>
                        <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${getCriticidadBadge(alerta.criticidad)}`}>
                          {alerta.criticidad.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{alerta.descripcion}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>{new Date(alerta.fechaCreacion).toLocaleDateString('es-ES')}</span>
                        <span>•</span>
                        <span>ID: {alerta.inspeccionId}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Últimas Inspecciones */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Últimas Inspecciones</h2>
                    <p className="text-sm text-muted-foreground">{inspecciones.length} inspecciones recientes</p>
                  </div>
                </div>
                <Link href="/inspecciones" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Ver todas →
                </Link>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {inspecciones.slice(0, 4).map((inspeccion) => (
                <Link key={inspeccion.id} href={`/inspecciones/${inspeccion.id}`}>
                  <div className="p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 bg-muted rounded-lg">
                          <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{inspeccion.numeroOrdenContenedor}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {(inspeccion.proveedor?.nombre !== '' && inspeccion.proveedor?.nombre != null) ? inspeccion.proveedor.nombre : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {inspeccion.tieneAlertas ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckBadgeIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(inspeccion.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BuildingStorefrontIcon className="h-4 w-4" />
                        <span className="truncate">
                          {(inspeccion.fruta?.nombre !== '' && inspeccion.fruta?.nombre != null) ? inspeccion.fruta.nombre : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
