'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Fruta, CreateFrutaDto } from '@/types';

export default function FrutasPage() {
  const [frutas, setFrutas] = useState<Fruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFruta, setEditingFruta] = useState<Fruta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [unidadTemperatura, setUnidadTemperatura] = useState<'celsius' | 'fahrenheit'>('celsius');
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
    loadFrutas();
  }, []);

  const loadFrutas = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tempMinima >= formData.tempMaxima) {
      alert('La temperatura mínima debe ser menor que la máxima');
      return;
    }

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

  const handleEdit = (fruta: Fruta) => {
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

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta fruta?')) return;

    try {
      await authApi.delete(`/frutas/${id}`);
      await loadFrutas();
    } catch (error) {
      console.error('Error deleting fruta:', error);
      alert('Error al desactivar la fruta');
    }
  };

  const resetForm = () => {
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
  };

  // Pagination logic
  const totalPages = Math.ceil(frutas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFrutas = frutas.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/20 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-600/10"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Cargando frutas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Gestión de Frutas
            </h1>
            <p className="text-sm md:text-lg text-gray-600 mt-2">
              Administra las frutas y sus rangos de temperatura óptimos
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-5 md:px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 shadow-lg font-semibold text-sm md:text-base"
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

        {/* Formulario */}
        {showForm && (
          <div className="bg-white/70 backdrop-blur-xl p-4 md:p-8 rounded-xl md:rounded-3xl shadow-2xl border border-gray-200/60">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span>{editingFruta ? 'Editar Fruta' : 'Crear Nueva Fruta'}</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Fruta
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 40) })}
                    required
                    maxLength={40}
                    placeholder="Ej: Uva, Manzana, Pera"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Unidad de Temperatura</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="unidad"
                        value="celsius"
                        checked={unidadTemperatura === 'celsius'}
                        onChange={() => setUnidadTemperatura('celsius')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Celsius (°C)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="unidad"
                        value="fahrenheit"
                        checked={unidadTemperatura === 'fahrenheit'}
                        onChange={() => setUnidadTemperatura('fahrenheit')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Fahrenheit (°F)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        // Limitar a máximo 3 dígitos antes del punto decimal
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
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {tempMinDisplay && parseFloat(tempMinDisplay) > 0 && unidadTemperatura === 'celsius' && (
                    <p className="text-xs text-gray-500 mt-1">Equivalente: {celsiusToFahrenheit(parseFloat(tempMinDisplay)).toFixed(2)}°F</p>
                  )}
                  {tempMinDisplay && parseFloat(tempMinDisplay) > 0 && unidadTemperatura === 'fahrenheit' && (
                    <p className="text-xs text-gray-500 mt-1">Equivalente: {fahrenheitToCelsius(parseFloat(tempMinDisplay)).toFixed(2)}°C</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        // Limitar a máximo 3 dígitos antes del punto decimal
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
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  {tempMaxDisplay && parseFloat(tempMaxDisplay) > 0 && unidadTemperatura === 'celsius' && (
                    <p className="text-xs text-gray-500 mt-1">Equivalente: {celsiusToFahrenheit(parseFloat(tempMaxDisplay)).toFixed(2)}°F</p>
                  )}
                  {tempMaxDisplay && parseFloat(tempMaxDisplay) > 0 && unidadTemperatura === 'fahrenheit' && (
                    <p className="text-xs text-gray-500 mt-1">Equivalente: {fahrenheitToCelsius(parseFloat(tempMaxDisplay)).toFixed(2)}°C</p>
                  )}
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activo" className="ml-3 block text-sm font-semibold text-gray-700">
                    Fruta Activa
                  </label>
                </div>
              </div>

              <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 text-sm text-blue-800 flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>El rango de temperatura se utiliza para validar las inspecciones y generar alertas automáticas</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 md:px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 md:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-semibold text-sm md:text-base"
                >
                  {editingFruta ? 'Actualizar Fruta' : 'Crear Fruta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de Frutas */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl md:rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/60">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Fruta</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                      <span>Temp. Mín.</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Temp. Máx.</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Rango Óptimo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/60">
                {paginatedFrutas.map((fruta) => (
                  <tr key={fruta.id} className="hover:bg-green-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {fruta.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {fruta.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-800">
                        {fruta.tempMinima}°C
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-red-100 text-red-800">
                        {fruta.tempMaxima}°C
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl border border-gray-200">
                          <span className="text-sm font-semibold text-gray-700">
                            {fruta.tempMinima}°C - {fruta.tempMaxima}°C
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${
                          fruta.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          fruta.activo ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {fruta.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(fruta)}
                          className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-xs md:text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(fruta.id)}
                          className="inline-flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-xs md:text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Desactivar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {frutas.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200/60 flex items-center justify-between bg-white/50">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, frutas.length)} de {frutas.length} frutas
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
                          ? 'bg-green-600 text-white'
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
    </DashboardLayout>
  );
}
