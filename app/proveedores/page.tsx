'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Proveedor, CreateProveedorDto } from '@/types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ProveedoresPage(): React.JSX.Element {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [errors, setErrors] = useState<{ nombre?: string }>({});
  const [formData, setFormData] = useState<CreateProveedorDto>({
    nombre: '',
    codigo: '',
    pais: '',
    activo: true,
  });

  useEffect(() => {
    void loadProveedores();
  }, []);

  const loadProveedores = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await authApi.get<Proveedor[]>('/proveedores');
      setProveedores(data);
    } catch (error) {
      console.error('Error loading proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadProveedores();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: { nombre?: string } = {};

    const duplicateNombre = proveedores.some(
      p => p.nombre.toLowerCase() === formData.nombre.toLowerCase() && (!editingProveedor || p.id !== editingProveedor.id)
    );
    if (duplicateNombre) {
      newErrors.nombre = 'Este proveedor ya existe';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      if (editingProveedor) {
        await authApi.patch(`/proveedores/${editingProveedor.id}`, formData);
      } else {
        await authApi.post('/proveedores', formData);
      }
      await loadProveedores();
      resetForm();
    } catch (error) {
      console.error('Error saving proveedor:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEdit = (proveedor: Proveedor): void => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      codigo: proveedor.codigo,
      pais: proveedor.pais,
      activo: proveedor.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas desactivar este proveedor?')) return;

    try {
      await authApi.delete(`/proveedores/${id}`);
      await loadProveedores();
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      alert('Error al desactivar el proveedor');
    }
  };

  const resetForm = (): void => {
    setFormData({
      nombre: '',
      codigo: '',
      pais: '',
      activo: true,
    });
    setEditingProveedor(null);
    setShowForm(false);
    setErrors({});
  };

  const totalPages = Math.ceil(proveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProveedores = proveedores.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando proveedores...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="py-3 md:py-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Gestión de Proveedores
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Administra los proveedores y sus datos de contacto
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void handleRefresh() }}
              disabled={refreshing}
              className="flex items-center justify-center space-x-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 md:px-5 py-2 md:py-2.5 rounded-lg border border-border transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 md:px-6 py-2 md:py-2.5 rounded-lg transition-colors font-semibold text-sm"
            >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showForm ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              )}
            </svg>
            <span>{showForm ? 'Cancelar' : 'Nuevo Proveedor'}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm border border-border">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 md:mb-4">
              {editingProveedor ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nombre del Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 40) })}
                    required
                    maxLength={40}
                    className={`w-full px-3 py-1.5 bg-background border ${
                      errors.nombre ? 'border-destructive/50' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground`}
                    placeholder="Ej: Frutas del Valle S.A."
                  />
                  {errors.nombre && (
                    <p className="text-xs text-destructive mt-0.5">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.slice(0, 30) })}
                    required
                    maxLength={30}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                    placeholder="Ej: FDV001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    País de Origen
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value.slice(0, 30) })}
                    required
                    maxLength={30}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                    placeholder="Ej: Chile"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-5 w-5 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="activo" className="ml-3 block text-xs font-semibold text-foreground">
                    Proveedor Activo
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 md:px-6 py-2 md:py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 md:px-6 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
                >
                  {editingProveedor ? 'Actualizar Proveedor' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span>Código</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>País</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-muted text-muted-foreground">
                        {proveedor.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center mr-3">
                          <span className="text-primary-foreground font-bold text-xs">
                            {proveedor.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {proveedor.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {proveedor.pais}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          proveedor.activo
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          proveedor.activo ? 'bg-primary' : 'bg-destructive'
                        }`}></span>
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(proveedor)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(proveedor.id)}
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

          {proveedores.length > 0 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, proveedores.length)} de {proveedores.length}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
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
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
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
