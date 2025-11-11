'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserInfoModal } from '@/components/UserInfoModal';
import { authApi } from '@/lib/api-auth';
import { Usuario, CreateUsuarioDto } from '@/types';
import { EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function UsuariosPage(): React.JSX.Element {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; nombre?: string; password?: string }>({});
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioDto>({
    nombre: '',
    username: '',
    email: '',
    password: '',
    telefono: '',
    area: 'Comercio Exterior',
    rol: 'user',
    activo: true,
  });

  useEffect(() => {
    void loadUsuarios();
  }, []);

  const loadUsuarios = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await authApi.get<Usuario[]>('/usuarios');
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadUsuarios();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: { username?: string; nombre?: string } = {};

    if (!editingUsuario && formData.password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!editingUsuario && !formData.password) {
      alert('Debe ingresar una contraseña');
      return;
    }

    if (!editingUsuario || formData.username !== editingUsuario.username) {
      const duplicateUsername = usuarios.some(
        u => u.username === formData.username && (!editingUsuario || u.id !== editingUsuario.id)
      );
      if (duplicateUsername) {
        newErrors.username = 'Este nombre de usuario ya está en uso';
      }
    }

    if (!editingUsuario) {
      const duplicateNombre = usuarios.some(
        u => u.nombre.toLowerCase() === formData.nombre.toLowerCase()
      );
      if (duplicateNombre) {
        newErrors.nombre = 'Ya existe una cuenta con este nombre completo';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      if (editingUsuario) {
        await authApi.patch(`/usuarios/${editingUsuario.id}`, formData);
      } else {
        await authApi.post('/usuarios', formData);
      }
      await loadUsuarios();
      resetForm();
    } catch (error) {
      console.error('Error saving usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleEdit = (usuario: Usuario): void => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      password: '', 
      telefono: usuario.telefono || '',
      area: usuario.area,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) return;

    try {
      await authApi.delete(`/usuarios/${id}`);
      await loadUsuarios();
    } catch (error) {
      console.error('Error deleting usuario:', error);
      alert('Error al desactivar el usuario');
    }
  };

  const resetForm = (): void => {
    setFormData({
      nombre: '',
      username: '',
      email: '',
      password: '',
      telefono: '',
      area: 'Comercio Exterior',
      rol: 'user',
      activo: true,
    });
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditingUsuario(null);
    setShowForm(false);
    setErrors({});
  };

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsuarios = usuarios.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando usuarios...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="py-3 md:py-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Administra los usuarios del sistema y sus permisos
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
              <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showForm ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              <span>{showForm ? 'Cancelar' : 'Nuevo Usuario'}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm border border-border">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 md:mb-4">
              {editingUsuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nombre Completo
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
                    placeholder="Ej: Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-destructive mt-0.5">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.slice(0, 20) })}
                    required
                    disabled={!!editingUsuario}
                    maxLength={20}
                    className={`w-full px-3 py-1.5 bg-background border ${
                      errors.username ? 'border-destructive/50' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground disabled:bg-muted disabled:cursor-not-allowed`}
                    placeholder="usuario_login"
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive mt-0.5">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.slice(0, 40) })}
                    required
                    maxLength={40}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {editingUsuario ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value.slice(0, 20) })}
                      required={!editingUsuario}
                      maxLength={20}
                      className={`w-full px-3 py-1.5 pr-10 bg-background border ${
                        errors.password ? 'border-destructive/50' : 'border-border'
                      } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!editingUsuario && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.slice(0, 20))}
                        required={!editingUsuario}
                        maxLength={20}
                        className={`w-full px-3 py-1.5 pr-10 bg-background border ${
                          confirmPassword && confirmPassword !== formData.password
                            ? 'border-destructive/50'
                            : 'border-border'
                        } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== formData.password && (
                      <p className="text-xs text-destructive mt-0.5">Las contraseñas no coinciden</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.slice(0, 12) })}
                    maxLength={12}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Área de Trabajo
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                  >
                    <option value="Comercio Exterior">Comercio Exterior</option>
                    <option value="Logística Nacional">Logística Nacional</option>
                    <option value="Calidad">Calidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.rol || 'user'}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'user' })}
                    required
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                  >
                    <option value="user">Usuario Normal</option>
                    <option value="admin">Administrador</option>
                  </select>
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
                    Usuario Activo
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
                  {editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario'}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Área</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Rol</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center mr-3">
                          <span className="text-primary-foreground font-bold text-xs">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {usuario.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                        {usuario.area}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          usuario.rol === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          usuario.activo
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          usuario.activo ? 'bg-primary' : 'bg-destructive'
                        }`}></span>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedUsuario(usuario);
                            setShowUserInfo(true);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Ver"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
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

          {usuarios.length > 0 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, usuarios.length)} de {usuarios.length}
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

        <UserInfoModal
          usuario={selectedUsuario}
          isOpen={showUserInfo}
          onClose={() => setShowUserInfo(false)}
        />
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
