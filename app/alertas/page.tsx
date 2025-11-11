'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Alerta } from '@/types';
import {
  ExclamationTriangleIcon,
  FireIcon,
  BellAlertIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AlertasPage(): React.JSX.Element {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filteredAlertas, setFilteredAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCriticidad, setFilterCriticidad] = useState('');
  const [filterLeida, setFilterLeida] = useState('');
  const [filterArchivado, setFilterArchivado] = useState('');
  const [searchInspeccionId, setSearchInspeccionId] = useState('');

  useEffect(() => {
    void loadAlertas();
  }, []);

  useEffect(() => {
    const filterAlertas = (): void => {
      let filtered = [...alertas];

      if (searchInspeccionId) {
        filtered = filtered.filter((alerta) =>
          alerta.inspeccionId.toString().includes(searchInspeccionId)
        );
      }

      if (filterArchivado === 'archivadas') {
        filtered = filtered.filter((alerta) => alerta.archivado);
      } else if (filterArchivado === '' || filterArchivado === 'no_archivadas') {
        filtered = filtered.filter((alerta) => !alerta.archivado);
      }

      if (filterCriticidad) {
        filtered = filtered.filter((alerta) => alerta.criticidad === filterCriticidad);
      }

      if (filterLeida === 'leidas') {
        filtered = filtered.filter((alerta) => alerta.leida);
      } else if (filterLeida === 'no_leidas') {
        filtered = filtered.filter((alerta) => !alerta.leida);
      }

      setFilteredAlertas(filtered);
    };

    filterAlertas();
  }, [filterCriticidad, filterLeida, filterArchivado, searchInspeccionId, alertas]);

  const loadAlertas = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await authApi.get<Alerta[]>('/alertas');
      setAlertas(data);
    } catch (error) {
      console.error('Error loading alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadAlertas();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleArchivarLote = async (inspeccionId: number): Promise<void> => {
    try {
      await authApi.patch(`/alertas/inspeccion/${inspeccionId}/archivar-todas`, {});
      setAlertas(prevAlertas =>
        prevAlertas.map(alerta =>
          alerta.inspeccionId === inspeccionId ? { ...alerta, archivado: true } : alerta
        )
      );
    } catch (error) {
      console.error('Error archiving alertas:', error);
      alert('Error al archivar las alertas');
    }
  };

  const handleMarcarTodasLeidas = async (inspeccionId: number): Promise<void> => {
    try {
      const alertasInspeccion = alertas.filter(a => a.inspeccionId === inspeccionId && !a.leida);

      await Promise.all(
        alertasInspeccion.map(alerta =>
          authApi.patch(`/alertas/${alerta.id}/marcar-leida`, {})
        )
      );

      setAlertas(prevAlertas =>
        prevAlertas.map(alerta =>
          alerta.inspeccionId === inspeccionId ? { ...alerta, leida: true } : alerta
        )
      );
    } catch (error) {
      console.error('Error marking alertas as read:', error);
      alert('Error al marcar las alertas como leídas');
    }
  };

  const groupAlertasByInspeccion = (alertas: Alerta[]): Alerta[][] => {
    const grouped = new Map<number, Alerta[]>();

    alertas.forEach(alerta => {
      const existing = grouped.get(alerta.inspeccionId) || [];
      grouped.set(alerta.inspeccionId, [...existing, alerta]);
    });

    return Array.from(grouped.values());
  };

  const getCriticidadStyles = (criticidad: string): {
    border: string
    bg: string
    text: string
    badge: string
    icon: typeof FireIcon
  } => {
    const styles = {
      alta: {
        border: 'border-destructive',
        bg: 'bg-card',
        text: 'text-foreground',
        badge: 'bg-destructive/10 text-destructive',
        icon: FireIcon
      },
      media: {
        border: 'border-primary',
        bg: 'bg-card',
        text: 'text-foreground',
        badge: 'bg-primary/10 text-primary',
        icon: ExclamationTriangleIcon
      },
      baja: {
        border: 'border-muted-foreground',
        bg: 'bg-card',
        text: 'text-foreground',
        badge: 'bg-muted text-muted-foreground',
        icon: BellAlertIcon
      }
    };
    return styles[criticidad as keyof typeof styles] || styles.baja;
  };

  const stats = [
    {
      label: 'Total de Alertas',
      value: alertas.length,
      icon: BellAlertIcon,
      color: 'bg-muted',
      iconColor: 'text-muted-foreground'
    },
    {
      label: 'Alertas Críticas',
      value: alertas.filter((a) => a.criticidad === 'alta').length,
      icon: FireIcon,
      color: 'bg-destructive/10',
      iconColor: 'text-destructive'
    },
    {
      label: 'Alertas Medias',
      value: alertas.filter((a) => a.criticidad === 'media').length,
      icon: ExclamationTriangleIcon,
      color: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      label: 'No Leídas',
      value: alertas.filter((a) => !a.leida).length,
      icon: BellAlertIcon,
      color: 'bg-muted',
      iconColor: 'text-muted-foreground'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando alertas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Alertas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitorea y gestiona las alertas del sistema en tiempo real
            </p>
          </div>
          <button
            onClick={() => { void handleRefresh() }}
            disabled={refreshing}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-lg border border-border transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-border flex items-center gap-4 justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          ))}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FunnelIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Número de Inspección
              </label>
              <input
                type="text"
                value={searchInspeccionId}
                onChange={(e) => { setSearchInspeccionId(e.target.value) }}
                placeholder="Ej: 123"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Criticidad
              </label>
              <select
                value={filterCriticidad}
                onChange={(e) => { setFilterCriticidad(e.target.value) }}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground"
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Estado de Lectura
              </label>
              <select
                value={filterLeida}
                onChange={(e) => { setFilterLeida(e.target.value) }}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground"
              >
                <option value="">Todas</option>
                <option value="no_leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Archivo
              </label>
              <select
                value={filterArchivado}
                onChange={(e) => { setFilterArchivado(e.target.value) }}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground"
              >
                <option value="">Alertas Activas</option>
                <option value="archivadas">Archivadas</option>
                <option value="todas">Todas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {groupAlertasByInspeccion(filteredAlertas).map((alertasGrupo) => {
            const criticidadMasAlta = alertasGrupo.reduce((max, alerta) => {
              const orden = { alta: 3, media: 2, baja: 1 };
              return (orden[alerta.criticidad as keyof typeof orden] || 0) > (orden[max as keyof typeof orden] || 0) ? alerta.criticidad : max;
            }, 'baja');

            const styles = getCriticidadStyles(criticidadMasAlta);
            const IconComponent = styles.icon;
            const todasLeidas = alertasGrupo.every(a => a.leida);
            const algunaNoLeida = alertasGrupo.some(a => !a.leida);
            const primeraAlerta = alertasGrupo[0];

            return (
              <div
                key={`inspeccion-${primeraAlerta.inspeccionId}`}
                className={`bg-card p-6 rounded-lg border-l-4 ${styles.border} hover:shadow-lg transition-shadow border border-border ${
                  todasLeidas ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:justify-between">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className={`p-2 rounded-lg ${styles.badge}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-lg font-semibold ${styles.badge}`}>
                        {criticidadMasAlta.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {alertasGrupo.length} {alertasGrupo.length === 1 ? 'alerta' : 'alertas'}
                      </span>
                      {todasLeidas && (
                        <span className="flex items-center text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Leídas
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      {alertasGrupo.map((alerta) => (
                        <div key={alerta.id} className="flex items-start gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                            alerta.criticidad === 'alta' ? 'bg-destructive' :
                            alerta.criticidad === 'media' ? 'bg-primary' : 'bg-muted-foreground'
                          }`}></span>
                          <div className="flex-1">
                            <p className="text-foreground text-sm">
                              <span className="font-medium">{alerta.tipoAlerta.replace(/_/g, ' ')}:</span> {alerta.descripcion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(primeraAlerta.fechaCreacion).toLocaleDateString('es-ES')}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>ID: {primeraAlerta.inspeccionId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <a
                      href={`/inspecciones/${primeraAlerta.inspeccionId}`}
                      className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-lg transition-colors font-semibold border border-border"
                      title="Ver inspección"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver</span>
                    </a>
                    {algunaNoLeida && (
                      <button
                        onClick={() => { void handleMarcarTodasLeidas(primeraAlerta.inspeccionId) }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-semibold"
                        title="Marcar como leídas"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Leídas</span>
                      </button>
                    )}
                    {!filterArchivado || filterArchivado === 'no_archivadas' ? (
                      <button
                        onClick={() => { void handleArchivarLote(primeraAlerta.inspeccionId) }}
                        className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-lg transition-colors font-semibold border border-border"
                        title="Archivar lote"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                        <span>Archivar</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlertas.length === 0 && (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <BellAlertIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                No se encontraron alertas
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
