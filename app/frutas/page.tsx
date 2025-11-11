'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Fruta, CreateFrutaDto } from '@/types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function FrutasPage(): React.JSX.Element {
  const [frutas, setFrutas] = useState<Fruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFruta, setEditingFruta] = useState<Fruta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [unidadTemperatura, setUnidadTemperatura] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [errors, setErrors] = useState<{ nombre?: string }>({});
  const [formData, setFormData] = useState<CreateFrutaDto>({
    nombre: '',
    tempMinima: 0,
    tempMaxima: 0,
    activo: true,
  });
  const [tempMinDisplay, setTempMinDisplay] = useState('');
  const [tempMaxDisplay, setTempMaxDisplay] = useState('');

  const fahrenheitToCelsius = (f: number): number => {
    return Math.round(((f - 32) * 5) / 9 * 100) / 100;
  };

  const celsiusToFahrenheit = (c: number): number => {
    return Math.round(((c * 9) / 5 + 32) * 100) / 100;
  };

  useEffect(() => {
    void loadFrutas();
  }, []);

  const loadFrutas = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await authApi.get<Fruta[]>('/frutas');
      setFrutas(data);
    } catch (error) {
      console.error('Error loading frutas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadFrutas();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: { nombre?: string } = {};

    if (formData.tempMinima >= formData.tempMaxima) {
      alert('La temperatura mínima debe ser menor que la máxima');
      return;
    }

    const duplicateNombre = frutas.some(
      f => f.nombre.toLowerCase() === formData.nombre.toLowerCase() && (!editingFruta || f.id !== editingFruta.id)
    );
    if (duplicateNombre) {
      newErrors.nombre = 'Esta fruta ya existe';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      if (editingFruta) {
        await authApi.patch(`/frutas/${editingFruta.id}`, formData);
      } else {
        await authApi.post('/frutas', formData);
      }
      await loadFrutas();
      resetForm();
    } catch (error) {
      console.error('Error saving fruta:', error);
      alert('Error al guardar la fruta');
    }
  };

  const handleEdit = (fruta: Fruta): void => {
    setEditingFruta(fruta);
    setFormData({
      nombre: fruta.nombre,
      tempMinima: fruta.tempMinima,
      tempMaxima: fruta.tempMaxima,
      activo: fruta.activo,
    });
    setTempMinDisplay(fruta.tempMinima?.toString() || '');
    setTempMaxDisplay(fruta.tempMaxima?.toString() || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta fruta?')) return;

    try {
      await authApi.delete(`/frutas/${id}`);
      await loadFrutas();
    } catch (error) {
      console.error('Error deleting fruta:', error);
      alert('Error al desactivar la fruta');
    }
  };

  const resetForm = (): void => {
    setFormData({
      nombre: '',
      tempMinima: 0,
      tempMaxima: 0,
      activo: true,
    });
    setTempMinDisplay('');
    setTempMaxDisplay('');
    setEditingFruta(null);
    setShowForm(false);
    setErrors({});
  };

  const totalPages = Math.ceil(frutas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFrutas = frutas.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg font-medium">Cargando frutas...</p>
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
              Gestión de Frutas
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Administra las frutas y sus rangos de temperatura óptimos
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
              <span>{showForm ? 'Cancelar' : 'Nueva Fruta'}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm border border-border">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 md:mb-4">
              {editingFruta ? 'Editar Fruta' : 'Crear Nueva Fruta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nombre de la Fruta
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 40) })}
                    required
                    maxLength={40}
                    placeholder="Ej: Uva, Manzana, Pera"
                    className={`w-full px-3 py-1.5 bg-background border ${
                      errors.nombre ? 'border-destructive/50' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground`}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-destructive mt-0.5">{errors.nombre}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-3">Unidad de Temperatura</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="unidad"
                        value="celsius"
                        checked={unidadTemperatura === 'celsius'}
                        onChange={() => setUnidadTemperatura('celsius')}
                        className="h-4 w-4 text-primary focus:ring-primary border-border"
                      />
                      <span className="ml-2 text-sm font-medium text-foreground">Celsius (°C)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="unidad"
                        value="fahrenheit"
                        checked={unidadTemperatura === 'fahrenheit'}
                        onChange={() => setUnidadTemperatura('fahrenheit')}
                        className="h-4 w-4 text-primary focus:ring-primary border-border"
                      />
                      <span className="ml-2 text-sm font-medium text-foreground">Fahrenheit (°F)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    Temperatura Mínima ({unidadTemperatura === 'celsius' ? '°C' : '°F'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      max={999}
                      value={tempMinDisplay}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('.')) {
                          const [intPart, decPart] = val.split('.');
                          if (intPart.length > 3) {
                            val = intPart.slice(0, 3) + '.' + decPart;
                          }
                        } else if (val.length > 3 && val !== '') {
                          val = val.slice(0, 3);
                        }
                        setTempMinDisplay(val);
                        if (val === '' || val === '.') {
                          setFormData({ ...formData, tempMinima: 0 });
                        } else {
                          const value = parseFloat(val);
                          if (!isNaN(value) && value <= 999 && /^[0-9.]*$/.test(val)) {
                            setFormData({ ...formData, tempMinima: value });
                          }
                        }
                      }}
                      required
                      placeholder="Ingrese temperatura"
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                    <style>{`
                      input[type="number"]::-webkit-outer-spin-button,
                      input[type="number"]::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                    `}</style>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {tempMinDisplay && parseFloat(tempMinDisplay) > 0 && unidadTemperatura === 'celsius' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Equivalente: {celsiusToFahrenheit(parseFloat(tempMinDisplay)).toFixed(2)}°F</p>
                  )}
                  {tempMinDisplay && parseFloat(tempMinDisplay) > 0 && unidadTemperatura === 'fahrenheit' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Equivalente: {fahrenheitToCelsius(parseFloat(tempMinDisplay)).toFixed(2)}°C</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    Temperatura Máxima ({unidadTemperatura === 'celsius' ? '°C' : '°F'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      max={999}
                      value={tempMaxDisplay}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('.')) {
                          const [intPart, decPart] = val.split('.');
                          if (intPart.length > 3) {
                            val = intPart.slice(0, 3) + '.' + decPart;
                          }
                        } else if (val.length > 3 && val !== '') {
                          val = val.slice(0, 3);
                        }
                        setTempMaxDisplay(val);
                        if (val === '' || val === '.') {
                          setFormData({ ...formData, tempMaxima: 0 });
                        } else {
                          const value = parseFloat(val);
                          if (!isNaN(value) && value <= 999 && /^[0-9.]*$/.test(val)) {
                            setFormData({ ...formData, tempMaxima: value });
                          }
                        }
                      }}
                      required
                      placeholder="Ingrese temperatura"
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm text-foreground"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                    <style>{`
                      input[type="number"]::-webkit-outer-spin-button,
                      input[type="number"]::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                    `}</style>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  {tempMaxDisplay && parseFloat(tempMaxDisplay) > 0 && unidadTemperatura === 'celsius' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Equivalente: {celsiusToFahrenheit(parseFloat(tempMaxDisplay)).toFixed(2)}°F</p>
                  )}
                  {tempMaxDisplay && parseFloat(tempMaxDisplay) > 0 && unidadTemperatura === 'fahrenheit' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Equivalente: {fahrenheitToCelsius(parseFloat(tempMaxDisplay)).toFixed(2)}°C</p>
                  )}
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
                    Fruta Activa
                  </label>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground flex items-start space-x-3">
                <svg className="w-5 h-5 text-muted-foreground mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>El rango de temperatura se utiliza para validar las inspecciones y generar alertas automáticas</span>
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
                  {editingFruta ? 'Actualizar Fruta' : 'Crear Fruta'}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Fruta</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Temp. Mín.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Temp. Máx.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Rango Óptimo
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
                {paginatedFrutas.map((fruta) => (
                  <tr key={fruta.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center mr-3">
                          <span className="text-primary-foreground font-bold text-xs">
                            {fruta.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {fruta.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border">
                        {fruta.tempMinima}°C
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border">
                        {fruta.tempMaxima}°C
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center px-3 py-1 bg-muted/50 rounded-xl border border-border">
                          <span className="text-xs font-semibold text-foreground">
                            {fruta.tempMinima}°C - {fruta.tempMaxima}°C
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          fruta.activo
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          fruta.activo ? 'bg-primary' : 'bg-destructive'
                        }`}></span>
                        {fruta.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(fruta)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(fruta.id)}
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

          {frutas.length > 0 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1} a {Math.min(endIndex, frutas.length)} de {frutas.length}
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
