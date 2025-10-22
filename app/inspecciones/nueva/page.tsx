'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { CreateInspeccionDto, Proveedor, Fruta, PuntoInspeccion, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarIcon,
  TruckIcon,
  CubeIcon,
  UserIcon,
  MapPinIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function NuevaInspeccionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos de relaciones
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [frutas, setFrutas] = useState<Fruta[]>([]);
  const [puntosInspeccion, setPuntosInspeccion] = useState<PuntoInspeccion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Fotos
  const [fotosRequeridas, setFotosRequeridas] = useState<File[]>([]);
  const [fotosOpcionales, setFotosOpcionales] = useState<File[]>([]);

  // Estado para unidad de temperatura
  const [unidadTemperatura, setUnidadTemperatura] = useState<'celsius' | 'fahrenheit'>('celsius');

  // Formulario
  const [formData, setFormData] = useState<CreateInspeccionDto>({
    fecha: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    })(),
    numeroOrdenContenedor: '',
    numeroPallets: 0,
    numeroCajas: 0,
    termografoOrigen: false,
    termografoNacional: false,
    temperaturaFruta: 0,
    numeroTrancas: 0,
    observaciones: '',
    tieneAlertas: false,
    estado: 'Completado',
    proveedorId: 0,
    frutaId: 0,
    puntoInspeccionId: 0,
    usuarioId: 0,
  });

  // Función para convertir Fahrenheit a Celsius
  const fahrenheitToCelsius = (f: number): number => {
    return Math.round(((f - 32) * 5) / 9 * 100) / 100;
  };

  // Función para convertir Celsius a Fahrenheit
  const celsiusToFahrenheit = (c: number): number => {
    return Math.round(((c * 9) / 5 + 32) * 100) / 100;
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Auto-seleccionar el usuario actual como inspector si es usuario normal
  useEffect(() => {
    if (user && user.rol === 'user' && usuarios.length > 0) {
      const usuarioActual = usuarios.find(u => u.username === user.username);
      if (usuarioActual && formData.usuarioId === 0) {
        setFormData({ ...formData, usuarioId: usuarioActual.id });
      }
    }
  }, [user, usuarios]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const [proveedoresData, frutasData, puntosData, usuariosData] = await Promise.all([
        authApi.get<Proveedor[]>('/proveedores'),
        authApi.get<Fruta[]>('/frutas'),
        authApi.get<PuntoInspeccion[]>('/puntos-inspeccion'),
        authApi.get<Usuario[]>('/usuarios'),
      ]);

      setProveedores(proveedoresData.filter(p => p.activo));
      setFrutas(frutasData.filter(f => f.activo));
      setPuntosInspeccion(puntosData.filter(p => p.activo));
      setUsuarios(usuariosData.filter(u => u.activo));
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast.error('Error al cargar los catálogos', {
        description: 'Por favor, intente recargar la página',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFotoRequeridaChange = (index: number, file: File | null) => {
    const newFotos = [...fotosRequeridas];
    if (file) {
      newFotos[index] = file;
    } else {
      newFotos.splice(index, 1);
    }
    setFotosRequeridas(newFotos);
  };

  const handleAddFotoOpcional = (file: File) => {
    setFotosOpcionales([...fotosOpcionales, file]);
  };

  const handleRemoveFotoOpcional = (index: number) => {
    const newFotos = fotosOpcionales.filter((_, i) => i !== index);
    setFotosOpcionales(newFotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.proveedorId || formData.proveedorId === 0) {
      toast.error('Validación requerida', {
        description: 'Debe seleccionar un proveedor',
      });
      return;
    }
    if (!formData.frutaId || formData.frutaId === 0) {
      toast.error('Validación requerida', {
        description: 'Debe seleccionar una fruta',
      });
      return;
    }
    if (!formData.puntoInspeccionId || formData.puntoInspeccionId === 0) {
      toast.error('Validación requerida', {
        description: 'Debe seleccionar un punto de inspección',
      });
      return;
    }
    if (!formData.usuarioId || formData.usuarioId === 0) {
      toast.error('Validación requerida', {
        description: 'Debe seleccionar un usuario',
      });
      return;
    }

    // Validar fotos obligatorias
    if (fotosRequeridas.length < 4) {
      toast.error('Fotos obligatorias faltantes', {
        description: 'Debe adjuntar las 4 fotos obligatorias',
      });
      return;
    }

    // Convertir temperatura a Celsius si está en Fahrenheit
    let temperaturaEnCelsius = formData.temperaturaFruta;
    if (unidadTemperatura === 'fahrenheit') {
      temperaturaEnCelsius = fahrenheitToCelsius(formData.temperaturaFruta);
    }

    // Validar temperatura contra rango de la fruta
    const frutaSeleccionada = frutas.find(f => f.id === formData.frutaId);
    if (frutaSeleccionada) {
      if (temperaturaEnCelsius < frutaSeleccionada.tempMinima ||
          temperaturaEnCelsius > frutaSeleccionada.tempMaxima) {
        // Solo mostrar aviso a administradores
        if (user?.rol === 'admin') {
          toast.warning('Temperatura fuera de rango', {
            description: `La temperatura ${temperaturaEnCelsius.toFixed(2)}°C está fuera del rango óptimo para ${frutaSeleccionada.nombre} (${frutaSeleccionada.tempMinima}°C - ${frutaSeleccionada.tempMaxima}°C). Se generará una alerta.`,
            duration: 6000,
          });
          // Pequeña pausa para que el usuario vea el mensaje
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        formData.tieneAlertas = true;
      }
    }

    // Actualizar la temperatura a Celsius antes de enviar
    formData.temperaturaFruta = temperaturaEnCelsius;

    try {
      setSubmitting(true);

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();

      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof CreateInspeccionDto];
        formDataToSend.append(key, String(value));
      });

      // Agregar fotos obligatorias
      fotosRequeridas.forEach((foto, index) => {
        formDataToSend.append(`fotosRequeridas`, foto, `foto_requerida_${index + 1}.jpg`);
      });

      // Agregar fotos opcionales
      fotosOpcionales.forEach((foto, index) => {
        formDataToSend.append(`fotosOpcionales`, foto, `foto_opcional_${index + 1}.jpg`);
      });

      const nuevaInspeccion = await authApi.post<Inspeccion>('/inspecciones', formDataToSend);

      toast.success('¡Inspección creada exitosamente!', {
        description: `Se ha registrado la inspección #${nuevaInspeccion.id}${formData.tieneAlertas ? ' con alertas generadas' : ''}`,
        duration: 4000,
      });

      // Pequeña pausa para que el usuario vea el mensaje
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push(`/inspecciones/${nuevaInspeccion.id}`);
    } catch (error) {
      console.error('Error creating inspección:', error);
      toast.error('Error al crear la inspección', {
        description: 'Por favor, verifique los datos e intente nuevamente',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Cargando catálogos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Nueva Inspección
            </h1>
            <p className="text-gray-600">
              Complete el formulario para registrar una nueva inspección
            </p>
          </div>
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver</span>
          </motion.button>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Información General */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Información General</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Inspección *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número Orden/Contenedor *
                </label>
                <input
                  type="text"
                  value={formData.numeroOrdenContenedor}
                  onChange={(e) => setFormData({ ...formData, numeroOrdenContenedor: e.target.value })}
                  required
                  placeholder="Ej: CONT-2024-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Relaciones */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Datos de la Carga</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <TruckIcon className="h-4 w-4 text-gray-500" />
                  <span>Proveedor *</span>
                </label>
                <select
                  value={formData.proveedorId}
                  onChange={(e) => setFormData({ ...formData, proveedorId: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value={0}>Seleccione un proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre} ({prov.pais})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4 text-gray-500" />
                  <span>Tipo de Fruta *</span>
                </label>
                <select
                  value={formData.frutaId}
                  onChange={(e) => setFormData({ ...formData, frutaId: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value={0}>Seleccione una fruta</option>
                  {frutas.map((fruta) => (
                    <option key={fruta.id} value={fruta.id}>
                      {fruta.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span>Punto de Inspección *</span>
                </label>
                <select
                  value={formData.puntoInspeccionId}
                  onChange={(e) => setFormData({ ...formData, puntoInspeccionId: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value={0}>Seleccione un punto</option>
                  {puntosInspeccion.map((punto) => (
                    <option key={punto.id} value={punto.id}>
                      {punto.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span>Inspector *</span>
                </label>
                <select
                  value={formData.usuarioId}
                  onChange={(e) => setFormData({ ...formData, usuarioId: parseInt(e.target.value) })}
                  required
                  disabled={user?.rol === 'user'}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    user?.rol === 'user' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  <option value={0}>Seleccione un inspector</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.area})
                    </option>
                  ))}
                </select>
                {user?.rol === 'user' && (
                  <p className="text-xs text-gray-500 mt-1">Se ha seleccionado automáticamente tu usuario</p>
                )}
              </div>
            </div>
          </div>

          {/* Cantidades */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CubeIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Cantidades</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Pallets *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroPallets || ''}
                  onChange={(e) => setFormData({ ...formData, numeroPallets: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Cajas *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroCajas || ''}
                  onChange={(e) => setFormData({ ...formData, numeroCajas: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Trancas *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroTrancas || ''}
                  onChange={(e) => setFormData({ ...formData, numeroTrancas: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Termógrafos y Temperatura */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Control de Temperatura</h2>
            </div>

            {/* Selector de unidad de temperatura */}
            <div className="mb-6 p-4 bg-white rounded-xl border border-orange-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Unidad de Temperatura</p>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="unidad"
                    value="celsius"
                    checked={unidadTemperatura === 'celsius'}
                    onChange={() => setUnidadTemperatura('celsius')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Fahrenheit (°F)</span>
                </label>
              </div>
            </div>

            {/* Termógrafos - ahora como opciones Sí/No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">¿Termógrafo de Origen? *</p>
                <div className="flex gap-3">
                  <label className="flex items-center flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: formData.termografoOrigen ? '#2563eb' : '#d1d5db', backgroundColor: formData.termografoOrigen ? '#eff6ff' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="termografoOrigen"
                      value="yes"
                      checked={formData.termografoOrigen === true}
                      onChange={() => setFormData({ ...formData, termografoOrigen: true })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Sí</span>
                  </label>
                  <label className="flex items-center flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: formData.termografoOrigen === false ? '#dc2626' : '#d1d5db', backgroundColor: formData.termografoOrigen === false ? '#fef2f2' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="termografoOrigenNo"
                      value="no"
                      checked={formData.termografoOrigen === false}
                      onChange={() => setFormData({ ...formData, termografoOrigen: false })}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">¿Termógrafo Nacional? *</p>
                <div className="flex gap-3">
                  <label className="flex items-center flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: formData.termografoNacional ? '#2563eb' : '#d1d5db', backgroundColor: formData.termografoNacional ? '#eff6ff' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="termografoNacional"
                      value="yes"
                      checked={formData.termografoNacional === true}
                      onChange={() => setFormData({ ...formData, termografoNacional: true })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Sí</span>
                  </label>
                  <label className="flex items-center flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: formData.termografoNacional === false ? '#dc2626' : '#d1d5db', backgroundColor: formData.termografoNacional === false ? '#fef2f2' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="termografoNacionalNo"
                      value="no"
                      checked={formData.termografoNacional === false}
                      onChange={() => setFormData({ ...formData, termografoNacional: false })}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Temperatura de la Fruta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temperatura de la Fruta ({unidadTemperatura === 'celsius' ? '°C' : '°F'}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.temperaturaFruta || ''}
                onChange={(e) => setFormData({ ...formData, temperaturaFruta: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                required
                placeholder={unidadTemperatura === 'celsius' ? 'Ej: 5.5' : 'Ej: 41.9'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                {unidadTemperatura === 'fahrenheit' && formData.temperaturaFruta ? `Equivalente: ${fahrenheitToCelsius(formData.temperaturaFruta).toFixed(2)}°C` : ''}
                {unidadTemperatura === 'celsius' && formData.temperaturaFruta ? `Equivalente: ${celsiusToFahrenheit(formData.temperaturaFruta).toFixed(2)}°F` : ''}
              </p>
            </div>
          </div>

          {/* Fotos Obligatorias */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">Fotografías Obligatorias *</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Fotos de ambos termógrafos (origen y nacional), una foto de la temperatura de la fruta y una más de la mercancía antes de cerrar puertas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                'Termógrafo Origen',
                'Termógrafo Nacional',
                'Temperatura de la Fruta',
                'Mercancía'
              ].map((label, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} *
                  </label>
                  <div className="relative">
                    {fotosRequeridas[index] ? (
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(fotosRequeridas[index])}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl border-2 border-blue-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleFotoRequeridaChange(index, null)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                        <PhotoIcon className="h-10 w-10 text-blue-400 mb-2" />
                        <span className="text-sm text-gray-600">Seleccionar foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFotoRequeridaChange(index, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fotos Opcionales */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <PhotoIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Fotografías Opcionales</h2>
                  <p className="text-sm text-gray-600">Incidencias, daños u otras observaciones visuales</p>
                </div>
              </div>
              <label className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <PlusIcon className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-700">Añadir foto</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAddFotoOpcional(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {fotosOpcionales.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {fotosOpcionales.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Foto opcional ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFotoOpcional(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <label className="text-xl font-bold text-gray-800">
                Observaciones
              </label>
            </div>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={5}
              placeholder="Ingrese cualquier observación relevante sobre la inspección..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-2">
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Crear Inspección</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
