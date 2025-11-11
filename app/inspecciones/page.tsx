'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { useAuth } from '@/contexts/AuthContext';
import { Inspeccion, Proveedor } from '@/types';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  TruckIcon,
  CubeIcon,
  FireIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function InspeccionesPage(): React.JSX.Element {
  const { user } = useAuth();
  const isNormalUser = user?.rol === 'user';

  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [filterAlertas, setFilterAlertas] = useState('');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const celsiusToFahrenheit = (c: number): number => {
    return Math.round(((c * 9) / 5 + 32) * 100) / 100;
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    let filtered = [...inspecciones];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((insp) =>
        insp.numeroOrdenContenedor.toLowerCase().includes(searchLower) ||
        insp.id.toString().includes(searchLower)
      );
    }

    if (filterProveedor) {
      filtered = filtered.filter((insp) => insp.proveedorId === parseInt(filterProveedor));
    }

    if (filterAlertas) {
      if (filterAlertas === 'con') {
        filtered = filtered.filter((insp) => insp.tieneAlertas);
      } else if (filterAlertas === 'sin') {
        filtered = filtered.filter((insp) => !insp.tieneAlertas);
      }
    }

    setFilteredInspecciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterProveedor, filterAlertas, inspecciones]);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [inspeccionesData, proveedoresData] = await Promise.all([
        authApi.get<Inspeccion[]>('/inspecciones'),
        authApi.get<Proveedor[]>('/proveedores'),
      ]);
      setInspecciones(inspeccionesData);
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta inspección?')) return;

    try {
      await authApi.delete(`/inspecciones/${id}`);
      await loadData();
    } catch (error) {
      console.error('Error deleting inspección:', error);
      alert('Error al eliminar la inspección');
    }
  };

  const getStatusColor = (estado: string): string => {
    switch (estado?.toLowerCase()) {
      case 'completado':
      case 'aprobado':
        return 'bg-primary/15 text-primary border border-primary/20';
      case 'pendiente':
        return 'bg-muted text-muted-foreground border border-border';
      case 'rechazado':
        return 'bg-destructive/15 text-destructive border border-destructive/20';
      default:
        return 'bg-muted/50 text-muted-foreground border border-border';
    }
  };

  const totalPages = Math.ceil(filteredInspecciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInspecciones = filteredInspecciones.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando inspecciones...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Gestión de Inspecciones</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Monitorea y gestiona todas las inspecciones de calidad</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void handleRefresh() }}
              disabled={refreshing}
              className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded border border-border transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refrescar inspecciones"
            >
              <ArrowPathIcon className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <Link
              href="/inspecciones/nueva"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 md:px-4 py-1.5 rounded transition-colors text-xs font-semibold"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span>Nueva Inspección</span>
            </Link>
          </div>
        </div>

        <div className={`grid gap-2 md:gap-3 ${isNormalUser ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <div className="bg-card rounded border border-border/50 p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded">
                <CubeIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Inspecciones</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">{filteredInspecciones.length}</p>
              </div>
            </div>
          </div>

          {!isNormalUser && (
            <>
              <div className="bg-card rounded border border-border/50 p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/50 rounded">
                    <ExclamationTriangleIcon className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Con Alertas</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {filteredInspecciones.filter((i) => i.tieneAlertas).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded border border-border/50 p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/50 rounded">
                    <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sin Problemas</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {filteredInspecciones.filter((i) => !i.tieneAlertas).length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-card rounded border border-border/50 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm md:text-base font-bold text-foreground">Filtros y Búsqueda</h2>
          </div>

          <div className={`grid gap-2 md:gap-3 ${isNormalUser ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Buscar por Contenedor
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value) }}
                  placeholder="Número de orden/contenedor..."
                  className="w-full pl-9 pr-3 py-1.5 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {!isNormalUser && (
              <>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Filtrar por Proveedor
                  </label>
                  <select
                    value={filterProveedor}
                    onChange={(e) => { setFilterProveedor(e.target.value) }}
                    className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                  >
                    <option value="">Todos los proveedores</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Filtrar por Alertas
                  </label>
                  <select
                    value={filterAlertas}
                    onChange={(e) => { setFilterAlertas(e.target.value) }}
                    className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                  >
                    <option value="">Todas las inspecciones</option>
                    <option value="con">Con alertas</option>
                    <option value="sin">Sin alertas</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nº Inspección
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3" />
                      Fecha
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contenedor
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <TruckIcon className="w-3 h-3" />
                      Proveedor
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fruta
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <FireIcon className="w-3 h-3" />
                      Temperatura
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  {!isNormalUser && (
                    <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Alertas
                    </th>
                  )}
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedInspecciones.map((inspeccion) => (
                  <tr
                    key={inspeccion.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block">
                        #{inspeccion.id}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs font-medium text-foreground">
                        {new Date(inspeccion.fecha).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inspeccion.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border inline-block">
                        {inspeccion.numeroOrdenContenedor}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs text-foreground font-medium">
                        {(inspeccion.proveedor?.nombre !== '' && inspeccion.proveedor?.nombre != null) ? inspeccion.proveedor.nombre : '-'}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs text-foreground">
                        {(inspeccion.fruta?.nombre !== '' && inspeccion.fruta?.nombre != null) ? inspeccion.fruta.nombre : '-'}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="text-xs font-semibold text-foreground">
                          <div>{inspeccion.temperaturaFruta}°C</div>
                          <div className="text-xs text-muted-foreground">{celsiusToFahrenheit(Number(inspeccion.temperaturaFruta)).toFixed(2)}°F</div>
                        </div>
                        {!isNormalUser && inspeccion.temperaturaFruta > 8 && (
                          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspeccion.estado)}`}>
                        {inspeccion.estado}
                      </span>
                    </td>
                    {!isNormalUser && (
                      <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                        {inspeccion.tieneAlertas ? (
                          <ExclamationTriangleIcon className="w-4 h-4 text-destructive" title="Con Alertas" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 text-muted-foreground" title="Sin Alertas" />
                        )}
                      </td>
                    )}
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/inspecciones/${inspeccion.id}`}
                          title="Ver inspección"
                        >
                          <EyeIcon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
                        {!isNormalUser && (
                          <button
                            onClick={() => { void handleDelete(inspeccion.id) }}
                            title="Eliminar inspección"
                          >
                            <TrashIcon className="w-4 h-4 text-destructive hover:text-destructive/80 transition-colors" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInspecciones.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="w-12 h-12 md:w-14 md:h-14 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-sm md:text-base font-bold text-foreground mb-1.5">No se encontraron inspecciones</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchTerm !== '' || filterProveedor !== ''
                  ? 'Intenta ajustar los filtros para ver más resultados.'
                  : 'Comienza creando tu primera inspección.'
                }
              </p>
            </div>
          )}

          {filteredInspecciones.length > 0 && (
            <div className="px-3 md:px-4 py-2.5 border-t border-border flex items-center justify-between bg-muted/30">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, filteredInspecciones.length)} de {filteredInspecciones.length}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)) }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page) }}
                      className={`px-2.5 py-1.5 rounded font-medium transition-colors text-xs ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)) }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
