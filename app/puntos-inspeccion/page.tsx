'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { PuntoInspeccion, CreatePuntoInspeccionDto } from '@/types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PuntosInspeccionPage(): React.JSX.Element {
  const [puntos, setPuntos] = useState<PuntoInspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPunto, setEditingPunto] = useState<PuntoInspeccion | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [errors, setErrors] = useState<{ nombre?: string }>({});
  const [formData, setFormData] = useState<CreatePuntoInspeccionDto>({
    nombre: '',
    ubicacion: '',
    activo: true,
  });

  useEffect(() => {
    void loadPuntos();
  }, []);

  const loadPuntos = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await authApi.get<PuntoInspeccion[]>('/puntos-inspeccion');
      setPuntos(data);
    } catch (error) {
      console.error('Error loading puntos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadPuntos();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: { nombre?: string } = {};

    const duplicateNombre = puntos.some(
      p => p.nombre.toLowerCase() === formData.nombre.toLowerCase() && (!editingPunto || p.id !== editingPunto.id)
    );
    if (duplicateNombre) {
      newErrors.nombre = 'Este punto de inspección ya existe';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      if (editingPunto) {
        await authApi.patch(`/puntos-inspeccion/${editingPunto.id}`, formData);
      } else {
        await authApi.post('/puntos-inspeccion', formData);
      }
      await loadPuntos();
      resetForm();
    } catch (error) {
      console.error('Error saving punto:', error);
      alert('Error al guardar el punto de inspección');
    }
  };

  const handleEdit = (punto: PuntoInspeccion): void => {
    setEditingPunto(punto);
    setFormData({
      nombre: punto.nombre,
      ubicacion: punto.ubicacion,
      activo: punto.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas desactivar este punto de inspección?')) return;

    try {
      await authApi.delete(`/puntos-inspeccion/${id}`);
      await loadPuntos();
    } catch (error) {
      console.error('Error deleting punto:', error);
      alert('Error al desactivar el punto de inspección');
    }
  };

  const resetForm = (): void => {
    setFormData({
      nombre: '',
      ubicacion: '',
      activo: true,
    });
    setEditingPunto(null);
    setShowForm(false);
    setErrors({});
  };

  const totalPages = Math.ceil(puntos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPuntos = puntos.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-14 md:w-14 border-4 border-primary border-t-transparent mx-auto mb-3"></div>
            <p className="text-muted-foreground text-sm md:text-base font-medium">Cargando puntos de inspección...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Puntos de Inspección
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Administra las ubicaciones físicas donde se realizan las inspecciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void handleRefresh() }}
              disabled={refreshing}
              className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded border border-border transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded transition-colors font-medium text-xs"
            >
              <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showForm ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              <span>{showForm ? 'Cancelar' : 'Nuevo Punto'}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-3 md:p-4 rounded border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3">
              {editingPunto ? 'Editar Punto de Inspección' : 'Crear Nuevo Punto de Inspección'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Nombre del Punto
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 40) })}
                    required
                    maxLength={40}
                    placeholder="Ej: Puerto Principal, Almacén Central"
                    className={`w-full px-3 py-1.5 bg-background border ${
                      errors.nombre ? 'border-destructive/50' : 'border-border'
                    } rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground`}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-destructive mt-0.5">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value.slice(0, 50) })}
                    required
                    maxLength={50}
                    placeholder="Ej: Av. Principal 123, Zona Industrial"
                    className="w-full px-3 py-1.5 bg-background border border-border rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="activo" className="ml-2 block text-xs font-medium text-foreground">
                    Punto Activo
                  </label>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded p-3 text-xs text-muted-foreground flex items-start space-x-2">
                <svg className="w-4 h-4 text-muted-foreground mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Los puntos de inspección representan ubicaciones físicas donde se realizan las inspecciones</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 border border-border rounded text-foreground hover:bg-muted transition-colors font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium text-xs"
                >
                  {editingPunto ? 'Actualizar Punto' : 'Crear Punto'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span>Ubicación</span>
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPuntos.map((punto) => (
                  <tr key={punto.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {punto.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 text-xs text-muted-foreground">
                      {punto.ubicacion}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          punto.activo
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          punto.activo ? 'bg-primary' : 'bg-destructive'
                        }`}></span>
                        {punto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(punto)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(punto.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Desactivar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {puntos.length === 0 && (
            <div className="text-center py-16 bg-muted">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-muted-foreground text-lg font-medium">
                No hay puntos de inspección registrados
              </p>
            </div>
          )}

          {puntos.length > 0 && (
            <div className="px-3 md:px-4 py-2.5 border-t border-border flex items-center justify-between bg-muted/30">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, puntos.length)} de {puntos.length}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
