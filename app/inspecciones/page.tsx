'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Proveedor, Fruta, PuntoInspeccion, Usuario } from '@/types';
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
  FireIcon
} from '@heroicons/react/24/outline';

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInspecciones();
  }, [searchTerm, filterProveedor, inspecciones]);

  const loadData = async () => {
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

  const filterInspecciones = () => {
    let filtered = [...inspecciones];

    if (searchTerm) {
      filtered = filtered.filter((insp) =>
        insp.numeroOrdenContenedor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterProveedor) {
      filtered = filtered.filter((insp) => insp.proveedorId === parseInt(filterProveedor));
    }

    setFilteredInspecciones(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta inspección?')) return;

    try {
      await authApi.delete(`/inspecciones/${id}`);
      await loadData();
    } catch (error) {
      console.error('Error deleting inspección:', error);
      alert('Error al eliminar la inspección');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
      case 'aprobado':
        return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
      case 'pendiente':
        return 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20';
      case 'rechazado':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inspecciones...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inspecciones</h1>
            <p className="text-gray-600 mt-1">Monitorea y gestiona todas las inspecciones de calidad</p>
          </div>
          <Link
            href="/inspecciones/nueva"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Inspección
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inspecciones</p>
                <p className="text-2xl font-bold text-gray-900">{filteredInspecciones.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Con Alertas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInspecciones.filter((i) => i.tieneAlertas).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Problemas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInspecciones.filter((i) => !i.tieneAlertas).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Contenedor
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Número de orden/contenedor..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Proveedor
              </label>
              <select
                value={filterProveedor}
                onChange={(e) => setFilterProveedor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Inspecciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Fecha
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contenedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="w-4 h-4" />
                      Proveedor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fruta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FireIcon className="w-4 h-4" />
                      Temperatura
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Alertas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInspecciones.map((inspeccion) => (
                  <tr 
                    key={inspeccion.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(inspeccion.fecha).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(inspeccion.fecha).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border">
                        {inspeccion.numeroOrdenContenedor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {inspeccion.proveedor?.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inspeccion.fruta?.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {inspeccion.temperaturaFruta}°C
                        </div>
                        {inspeccion.temperaturaFruta > 8 && (
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inspeccion.estado)}`}>
                        {inspeccion.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inspeccion.tieneAlertas ? (
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          Con Alertas
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          Sin Alertas
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/inspecciones/${inspeccion.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver
                        </Link>
                        <button
                          onClick={() => handleDelete(inspeccion.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors font-medium"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInspecciones.length === 0 && (
            <div className="text-center py-16">
              <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron inspecciones</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {searchTerm || filterProveedor 
                  ? 'Intenta ajustar los filtros para ver más resultados.' 
                  : 'Comienza creando tu primera inspección.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}