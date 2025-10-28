'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Notificacion, Usuario } from '@/types';
import { toast } from 'sonner';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState<Notificacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterArchivado, setFilterArchivado] = useState('activas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1);
  }, [filterUsuario, filterMetodo, filterEstado, filterArchivado]);

  useEffect(() => {
    filterData();
  }, [notificaciones]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifData, usuariosData] = await Promise.all([
        authApi.get<Notificacion[]>('/notificaciones'),
        authApi.get<Usuario[]>('/usuarios'),
      ]);
      setNotificaciones(notifData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar notificaciones', {
        description: 'Por favor, intente recargar la página',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterData = () => {
    let filtered = [...notificaciones];

    if (filterUsuario) {
      filtered = filtered.filter((n) => n.usuarioId === parseInt(filterUsuario));
    }

    if (filterMetodo) {
      filtered = filtered.filter((n) => n.metodo === filterMetodo);
    }

    if (filterEstado === 'enviadas') {
      filtered = filtered.filter((n) => n.enviada);
    } else if (filterEstado === 'pendientes') {
      filtered = filtered.filter((n) => !n.enviada);
    }

    if (filterArchivado === 'activas') {
      filtered = filtered.filter((n) => !n.archivado);
    } else if (filterArchivado === 'archivadas') {
      filtered = filtered.filter((n) => n.archivado);
    }
    // 'todas' shows all notifications regardless of archivado status

    setFilteredNotificaciones(filtered);
  };

  const handleMarcarEnviada = async (ids: number[]) => {
    try {
      // Marcar todas las notificaciones como enviadas
      await Promise.all(
        ids.map(id => authApi.patch(`/notificaciones/${id}/marcar-enviada`, {}))
      );

      // Actualizar el estado local sin cambiar de página
      setNotificaciones(prevNotificaciones =>
        prevNotificaciones.map(notif =>
          ids.includes(notif.id)
            ? { ...notif, enviada: true, fechaEnvio: new Date().toISOString() }
            : notif
        )
      );

      toast.success('Notificación marcada como enviada', {
        description: 'El estado se ha actualizado correctamente',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error marking as sent:', error);
      toast.error('Error al marcar como enviada', {
        description: 'Por favor, intente nuevamente',
      });
    }
  };

  const handleArchivar = async (ids: number[]) => {
    try {
      await Promise.all(
        ids.map(id => authApi.patch(`/notificaciones/${id}/archivar`, {}))
      );

      // Actualizar localmente marcando como archivado
      setNotificaciones(prevNotificaciones =>
        prevNotificaciones.map(notif =>
          ids.includes(notif.id)
            ? { ...notif, archivado: true }
            : notif
        )
      );

      toast.success('Notificaciones archivadas', {
        description: 'Las notificaciones se han archivado correctamente',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error archiving notifications:', error);
      toast.error('Error al archivar', {
        description: 'Por favor, intente nuevamente',
      });
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'email':
        return '📧';
      case 'sistema':
        return '🔔';
      case 'push':
        return '📱';
      default:
        return '📬';
    }
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sistema':
        return 'bg-purple-100 text-purple-800';
      case 'push':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupar notificaciones por alertaId
  const groupedNotificaciones = () => {
    const grouped = new Map();

    filteredNotificaciones.forEach((notif) => {
      const key = notif.alertaId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          alertaId: notif.alertaId,
          usuarioId: notif.usuarioId,
          usuario: notif.usuario,
          metodos: [],
          fechaEnvio: notif.fechaEnvio,
          enviada: true,
          ids: [],
        });
      }

      const group = grouped.get(key);
      group.metodos.push(notif.metodo);
      group.ids.push(notif.id);

      // Si cualquier notificación del grupo no está enviada, marcar como no enviada
      if (!notif.enviada) {
        group.enviada = false;
        group.fechaEnvio = notif.fechaEnvio;
      }
    });

    return Array.from(grouped.values());
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const grouped = groupedNotificaciones();
  const totalPages = Math.ceil(grouped.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotificaciones = grouped.slice(startIndex, endIndex);

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Gestión de Notificaciones</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 md:px-5 py-2 md:py-2.5 rounded-lg border border-gray-300 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Usuario
              </label>
              <select
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Método
              </label>
              <select
                value={filterMetodo}
                onChange={(e) => setFilterMetodo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los métodos</option>
                <option value="email">Email</option>
                <option value="sistema">Sistema</option>
                <option value="push">Push</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="pendientes">Pendientes</option>
                <option value="enviadas">Enviadas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Estatus
              </label>
              <select
                value={filterArchivado}
                onChange={(e) => setFilterArchivado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="activas">Activas</option>
                <option value="archivadas">Archivadas</option>
                <option value="todas">Todas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow">
            <p className="text-xs md:text-sm text-gray-500">Total</p>
            <p className="text-xl md:text-2xl font-bold">{notificaciones.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow">
            <p className="text-xs md:text-sm text-yellow-700">Pendientes</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-700">
              {notificaciones.filter((n) => !n.enviada).length}
            </p>
          </div>
          <div className="bg-green-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow">
            <p className="text-xs md:text-sm text-green-700">Enviadas</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              {notificaciones.filter((n) => n.enviada).length}
            </p>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métodos Emitidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Envío
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerta ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedNotificaciones.map((group) => (
                <tr key={group.alertaId} className={`hover:bg-gray-50 ${!group.enviada ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.usuario?.nombre || `Usuario #${group.usuarioId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {group.metodos.map((metodo, idx) => (
                        <span key={idx} className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getMetodoColor(metodo)}`}>
                          {getMetodoIcon(metodo)} {metodo.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        group.enviada
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {group.enviada ? '✓ Enviada' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.fechaEnvio
                      ? new Date(group.fechaEnvio).toLocaleString('es-ES')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{group.alertaId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!group.enviada && (
                        <button
                          onClick={() => {
                            handleMarcarEnviada(group.ids);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Marcar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleArchivar(group.ids);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Archivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {grouped.length === 0 && (
            <div className="text-center py-12 text-sm md:text-base text-gray-500">
              No se encontraron notificaciones con los filtros seleccionados
            </div>
          )}

          {/* Pagination Controls */}
          {grouped.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {startIndex + 1} a {Math.min(endIndex, grouped.length)} de {grouped.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
