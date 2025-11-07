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

    setFilteredNotificaciones(filtered);
    setCurrentPage(1);
  }, [filterUsuario, filterMetodo, filterEstado, filterArchivado, notificaciones]);

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


  const handleMarcarEnviada = async (ids: number[]) => {
    try {
      await Promise.all(
        ids.map(id => authApi.patch(`/notificaciones/${id}/marcar-enviada`, {}))
      );

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
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando notificaciones...</p>
          </div>
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
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="py-3 md:py-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Gestión de Notificaciones</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Administra y monitorea todas las notificaciones del sistema
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 md:px-5 py-2 md:py-2.5 rounded-lg border border-border transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>

        <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Usuario
              </label>
              <select
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/20 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm text-foreground"
              >
                <option value="">Todos</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Método
              </label>
              <select
                value={filterMetodo}
                onChange={(e) => setFilterMetodo(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/20 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm text-foreground"
              >
                <option value="">Todos</option>
                <option value="email">Email</option>
                <option value="sistema">Sistema</option>
                <option value="push">Push</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/20 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm text-foreground"
              >
                <option value="">Todas</option>
                <option value="pendientes">Pendientes</option>
                <option value="enviadas">Enviadas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Estatus
              </label>
              <select
                value={filterArchivado}
                onChange={(e) => setFilterArchivado(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/20 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm text-foreground"
              >
                <option value="activas">Activas</option>
                <option value="archivadas">Archivadas</option>
                <option value="todas">Todas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 md:p-4 border border-border">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-lg md:text-xl font-bold text-foreground">{notificaciones.length}</p>
          </div>
          <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 md:p-4 border border-border">
            <p className="text-xs text-amber-700 font-medium">Pendientes</p>
            <p className="text-lg md:text-xl font-bold text-amber-700">
              {notificaciones.filter((n) => !n.enviada).length}
            </p>
          </div>
          <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 md:p-4 border border-border">
            <p className="text-xs text-primary font-medium">Enviadas</p>
            <p className="text-lg md:text-xl font-bold text-primary">
              {notificaciones.filter((n) => n.enviada).length}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Métodos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha Envío
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Alerta ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedNotificaciones.map((group) => (
                <tr key={group.alertaId} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-foreground">
                    {group.usuario?.nombre || `Usuario #${group.usuarioId}`}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1.5">
                      {group.metodos.map((metodo: string, idx: number) => (
                        <span key={idx} className={`px-2 py-0.5 inline-flex text-xs leading-4 font-medium rounded ${
                          metodo === 'email' ? 'bg-blue-500/10 text-blue-700' :
                          metodo === 'sistema' ? 'bg-purple-500/10 text-purple-700' :
                          metodo === 'push' ? 'bg-green-500/10 text-green-700' :
                          'bg-muted/30 text-foreground'
                        }`}>
                          {metodo.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-4 font-medium rounded ${
                        group.enviada
                          ? 'bg-primary/10 text-primary'
                          : 'bg-amber-500/10 text-amber-700'
                      }`}
                    >
                      {group.enviada ? 'Enviada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {group.fechaEnvio
                      ? new Date(group.fechaEnvio).toLocaleDateString('es-ES')
                      : '-'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    #{group.alertaId}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!group.enviada && (
                        <button
                          onClick={() => {
                            handleMarcarEnviada(group.ids);
                          }}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          Marcar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleArchivar(group.ids);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
            <div className="text-center py-8 text-sm text-muted-foreground">
              No se encontraron notificaciones
            </div>
          )}

          {grouped.length > 0 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, grouped.length)} de {grouped.length}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm border border-border"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm border border-border"
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
