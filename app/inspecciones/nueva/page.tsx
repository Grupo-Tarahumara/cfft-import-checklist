'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { CreateInspeccionDto, Inspeccion, Proveedor, Fruta, PuntoInspeccion, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SignaturePad from '@/components/SignaturePad';
import TruckPalletSelector from '@/components/TruckPalletSelector';
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

export default function NuevaInspeccionPage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [frutas, setFrutas] = useState<Fruta[]>([]);
  const [puntosInspeccion, setPuntosInspeccion] = useState<PuntoInspeccion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [fotosRequeridas, setFotosRequeridas] = useState<File[]>([]);
  const [fotosOpcionales, setFotosOpcionales] = useState<File[]>([]);

  const [unidadTemperatura, setUnidadTemperatura] = useState<'celsius' | 'fahrenheit'>('celsius');

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [isOptionalPhoto, setIsOptionalPhoto] = useState(false);


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
    paletTermografoOrigen: [],
    paletTermografoNacional: [],
    temperaturaFruta: 0,
    temperaturaCarga: 0,
    lineaTransportista: '',
    numeroTrancas: 0,
    observaciones: '',
    tieneAlertas: false,
    estado: 'Completado',
    proveedorId: 0,
    frutaId: 0,
    puntoInspeccionId: 0,
    usuarioId: 0,
  });

  const fahrenheitToCelsius = (f: number): number => {
    return Math.round(((f - 32) * 5) / 9 * 100) / 100;
  };

  const celsiusToFahrenheit = (c: number): number => {
    return Math.round(((c * 9) / 5 + 32) * 100) / 100;
  };

  useEffect(() => {
    void loadCatalogs();
  }, []);

  useEffect(() => {
    if (user && user.rol === 'user' && usuarios.length > 0) {
      const usuarioActual = usuarios.find(u => u.username === user.username);
      if (usuarioActual) {
        setFormData(prev => {
          if (prev.usuarioId === 0) {
            return { ...prev, usuarioId: usuarioActual.id };
          }
          return prev;
        });
      }
    }
  }, [user, usuarios]);

  useEffect(() => {
    setFormData(prevFormData => {
      const updated = { ...prevFormData };
      let hasChanges = false;

      if (!prevFormData.termografoOrigen && prevFormData.paletTermografoOrigen && prevFormData.paletTermografoOrigen.length > 0) {
        updated.paletTermografoOrigen = [];
        hasChanges = true;
      }

      if (!prevFormData.termografoNacional && prevFormData.paletTermografoNacional && prevFormData.paletTermografoNacional.length > 0) {
        updated.paletTermografoNacional = [];
        hasChanges = true;
      }

      return hasChanges ? updated : prevFormData;
    });
  }, [formData.termografoOrigen, formData.termografoNacional]);

  useEffect(() => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    if (video && cameraStream) {
      video.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const loadCatalogs = async (): Promise<void> => {
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

  const handleFotoRequeridaChange = (index: number, file: File | null): void => {
    const newFotos = [...fotosRequeridas];
    if (file) {
      newFotos[index] = file;
    } else {
      newFotos.splice(index, 1);
    }
    setFotosRequeridas(newFotos);
  };

  const handleAddFotoOpcional = (file: File): void => {
    setFotosOpcionales([...fotosOpcionales, file]);
  };

  const handleRemoveFotoOpcional = (index: number): void => {
    const newFotos = fotosOpcionales.filter((_, i) => i !== index);
    setFotosOpcionales(newFotos);
  };

  const openCamera = async (index: number, optional = false): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      setCurrentPhotoIndex(index);
      setIsOptionalPhoto(optional);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Error al acceder a la cámara', {
        description: 'Por favor, verifica los permisos de la cámara',
      });
    }
  };

  const closeCamera = (): void => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCurrentPhotoIndex(null);
    setIsOptionalPhoto(false);
  };

  const capturePhoto = (): void => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (isOptionalPhoto) {
          handleAddFotoOpcional(file);
        } else if (currentPhotoIndex !== null) {
          handleFotoRequeridaChange(currentPhotoIndex, file);
        }
        closeCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

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

    const fotosRequeridas_Count = (formData.termografoOrigen ? 1 : 0) + (formData.termografoNacional ? 1 : 0) + 2; // +2 para Temperatura y Mercancía
    const fotosActuales = fotosRequeridas.filter(f => f !== null && f !== undefined).length;

    if (fotosActuales < fotosRequeridas_Count) {
      const fotosNecesarias = [
        formData.termografoOrigen ? 'Termógrafo Origen' : null,
        formData.termografoNacional ? 'Termógrafo Nacional' : null,
        'Temperatura de la Fruta',
        'Mercancía'
      ].filter(f => f !== null);

      toast.error('Fotos obligatorias faltantes', {
        description: `Debe adjuntar: ${fotosNecesarias.join(', ')}`,
      });
      return;
    }

    if (!formData.lineaTransportista || formData.lineaTransportista.trim() === '') {
      toast.error('Validación requerida', {
        description: 'Debe ingresar la línea transportista',
      });
      return;
    }

    if (!formData.firmaTransporte || formData.firmaTransporte.trim() === '') {
      toast.error('Validación requerida', {
        description: 'Debe trazar la firma de transporte',
      });
      return;
    }

    if (formData.termografoOrigen && (!formData.paletTermografoOrigen || formData.paletTermografoOrigen.length === 0)) {
      toast.error('Validación requerida', {
        description: 'Debe especificar al menos un palet donde está el Termógrafo de Origen',
      });
      return;
    }

    if (formData.termografoNacional && (!formData.paletTermografoNacional || formData.paletTermografoNacional.length === 0)) {
      toast.error('Validación requerida', {
        description: 'Debe especificar al menos un palet donde está el Termógrafo Nacional',
      });
      return;
    }

    if (!formData.temperaturaCarga || formData.temperaturaCarga === 0) {
      toast.error('Validación requerida', {
        description: 'Debe ingresar la temperatura de la carga',
      });
      return;
    }

    if (!formData.observaciones || formData.observaciones.trim() === '') {
      toast.error('Validación requerida', {
        description: 'Debe ingresar observaciones sobre la inspección',
      });
      return;
    }

    let temperaturaEnCelsius = formData.temperaturaFruta;
    if (unidadTemperatura === 'fahrenheit') {
      temperaturaEnCelsius = fahrenheitToCelsius(formData.temperaturaFruta);
    }

    const frutaSeleccionada = frutas.find(f => f.id === formData.frutaId);
    if (frutaSeleccionada) {
      if (temperaturaEnCelsius < frutaSeleccionada.tempMinima ||
          temperaturaEnCelsius > frutaSeleccionada.tempMaxima) {
        if (user?.rol === 'admin') {
          toast.warning('Temperatura fuera de rango', {
            description: `La temperatura ${temperaturaEnCelsius.toFixed(2)}°C está fuera del rango óptimo para ${frutaSeleccionada.nombre} (${frutaSeleccionada.tempMinima}°C - ${frutaSeleccionada.tempMaxima}°C). Se generará una alerta.`,
            duration: 6000,
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        formData.tieneAlertas = true;
      }
    }

    formData.temperaturaFruta = temperaturaEnCelsius;

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof CreateInspeccionDto];
        if (key === 'paletTermografoOrigen' && !formData.termografoOrigen) return;
        if (key === 'paletTermografoNacional' && !formData.termografoNacional) return;
        if (key === 'paletTermografoOrigen' || key === 'paletTermografoNacional') {
          if (Array.isArray(value) && value.length > 0) {
            formDataToSend.append(key, JSON.stringify(value));
          }
          return;
        }
        formDataToSend.append(key, String(value));
      });

      fotosRequeridas.forEach((foto, index) => {
        if (foto && foto instanceof File) {
          formDataToSend.append(`fotosRequeridas`, foto, `foto_requerida_${index + 1}.jpg`);
        }
      });

      fotosOpcionales.forEach((foto, index) => {
        if (foto && foto instanceof File) {
          formDataToSend.append(`fotosOpcionales`, foto, `foto_opcional_${index + 1}.jpg`);
        }
      });

      const nuevaInspeccion = await authApi.post<Inspeccion>('/inspecciones', formDataToSend);

      toast.success('¡Inspección creada exitosamente!', {
        description: `Se ha registrado la inspección #${nuevaInspeccion.id}`,
        duration: 4000,
      });

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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando catálogos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nueva Inspección
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete el formulario para registrar una nueva inspección
            </p>
          </div>
          <button
            onClick={() => { router.back() }}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded transition-colors text-xs font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Volver</span>
          </button>
        </div>

        <form
          onSubmit={(e) => { void handleSubmit(e) }}
          className="space-y-6"
        >
          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Fecha de Inspección *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha}
                  onChange={(e) => { setFormData({ ...formData, fecha: e.target.value }) }}
                  required
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Número Orden/Contenedor *
                </label>
                <input
                  type="text"
                  value={formData.numeroOrdenContenedor}
                  onChange={(e) => { setFormData({ ...formData, numeroOrdenContenedor: e.target.value.slice(0, 30) }) }}
                  required
                  placeholder="Ej: CONT-2024-001"
                  maxLength={30}
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Datos de la Carga</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <TruckIcon className="h-3 w-3" />
                  <span>Proveedor *</span>
                </label>
                <select
                  value={formData.proveedorId}
                  onChange={(e) => { setFormData({ ...formData, proveedorId: parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-background border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
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
                <label className="block text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <SparklesIcon className="h-3 w-3" />
                  <span>Tipo de Fruta *</span>
                </label>
                <select
                  value={formData.frutaId}
                  onChange={(e) => { setFormData({ ...formData, frutaId: parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-background border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
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
                <label className="block text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  <span>Punto de Inspección *</span>
                </label>
                <select
                  value={formData.puntoInspeccionId}
                  onChange={(e) => { setFormData({ ...formData, puntoInspeccionId: parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-background border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
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
                <label className="block text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  <span>Inspector *</span>
                </label>
                <select
                  value={formData.usuarioId}
                  onChange={(e) => { setFormData({ ...formData, usuarioId: parseInt(e.target.value) }) }}
                  required
                  disabled={user?.rol === 'user'}
                  className={`w-full px-3 py-1.5 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs ${
                    user?.rol === 'user' ? 'bg-muted cursor-not-allowed' : 'bg-background'
                  } text-foreground`}
                >
                  <option value={0}>Seleccione un inspector</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.area})
                    </option>
                  ))}
                </select>
                {user?.rol === 'user' && (
                  <p className="text-xs text-muted-foreground mt-0.5">Se ha seleccionado automáticamente tu usuario</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Línea Transportista *
                </label>
                <input
                  type="text"
                  value={formData.lineaTransportista || ''}
                  onChange={(e) => { setFormData({ ...formData, lineaTransportista: e.target.value.slice(0, 50) }) }}
                  placeholder="Ej: Transportes ABC, DHL, etc."
                  required
                  maxLength={50}
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Cantidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Número de Pallets *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroPallets || ''}
                  onChange={(e) => { setFormData({ ...formData, numeroPallets: e.target.value === '' ? 0 : parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Número de Cajas *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroCajas || ''}
                  onChange={(e) => { setFormData({ ...formData, numeroCajas: e.target.value === '' ? 0 : parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Número de Trancas *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroTrancas || ''}
                  onChange={(e) => { setFormData({ ...formData, numeroTrancas: e.target.value === '' ? 0 : parseInt(e.target.value) }) }}
                  required
                  className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Control de Temperatura</h2>

            <div className="mb-3 p-2 md:p-3 bg-muted/20 rounded border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Unidad de Temperatura</p>
              <div className="flex gap-3 md:gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="unidad"
                    value="celsius"
                    checked={unidadTemperatura === 'celsius'}
                    onChange={() => { setUnidadTemperatura('celsius') }}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <span className="ml-2 text-xs font-medium text-foreground">Celsius (°C)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="unidad"
                    value="fahrenheit"
                    checked={unidadTemperatura === 'fahrenheit'}
                    onChange={() => { setUnidadTemperatura('fahrenheit') }}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <span className="ml-2 text-xs font-medium text-foreground">Fahrenheit (°F)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Termógrafo de Origen</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, termografoOrigen: !formData.termografoOrigen })}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all border-2 ${
                      formData.termografoOrigen ? 'bg-primary border-primary' : 'bg-muted border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full transition-transform ${
                        formData.termografoOrigen ? 'bg-white' : 'bg-muted-foreground'
                      } ${
                        formData.termografoOrigen ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-foreground w-6">
                    {formData.termografoOrigen ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Termógrafo Nacional</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, termografoNacional: !formData.termografoNacional })}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all border-2 ${
                      formData.termografoNacional ? 'bg-primary border-primary' : 'bg-muted border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full transition-transform ${
                        formData.termografoNacional ? 'bg-white' : 'bg-muted-foreground'
                      } ${
                        formData.termografoNacional ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-foreground w-6">
                    {formData.termografoNacional ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {(formData.termografoOrigen || formData.termografoNacional) && (
              <div className="p-2 md:p-3 bg-muted/20 rounded border border-border/50 mb-3">
                <label className="block text-xs text-muted-foreground font-semibold mb-2">
                  Selecciona la ubicación de los termógrafos en el camión
                </label>
                <TruckPalletSelector
                  totalPallets={formData.numeroPallets || 1}
                  termografoOrigenSelected={formData.paletTermografoOrigen}
                  termografoNacionalSelected={formData.paletTermografoNacional}
                  termografoOrigenEnabled={formData.termografoOrigen}
                  termografoNacionalEnabled={formData.termografoNacional}
                  onSelectTermografoOrigen={(paletNumber) => {
                    const current = formData.paletTermografoOrigen || [];
                    const updated = current.includes(paletNumber)
                      ? current.filter(p => p !== paletNumber)
                      : [...current, paletNumber];
                    setFormData({ ...formData, paletTermografoOrigen: updated });
                  }}
                  onSelectTermografoNacional={(paletNumber) => {
                    const current = formData.paletTermografoNacional || [];
                    const updated = current.includes(paletNumber)
                      ? current.filter(p => p !== paletNumber)
                      : [...current, paletNumber];
                    setFormData({ ...formData, paletTermografoNacional: updated });
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Temperatura de la Fruta ({unidadTemperatura === 'celsius' ? '°C' : '°F'}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  max={999}
                  value={formData.temperaturaFruta || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    if (value <= 999 && /^[0-9.]*$/.test(e.target.value)) {
                      setFormData({ ...formData, temperaturaFruta: value });
                    }
                  }}
                  required
                  placeholder={unidadTemperatura === 'celsius' ? 'Ej: 5.5' : 'Ej: 41.9'}
                  className="w-full px-3 py-1.5 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-muted/20 text-xs text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unidadTemperatura === 'fahrenheit' && formData.temperaturaFruta ? `Equivalente: ${fahrenheitToCelsius(formData.temperaturaFruta).toFixed(2)}°C` : ''}
                  {unidadTemperatura === 'celsius' && formData.temperaturaFruta ? `Equivalente: ${celsiusToFahrenheit(formData.temperaturaFruta).toFixed(2)}°F` : ''}
                </p>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-semibold mb-1">
                  Temperatura de la Carga ({unidadTemperatura === 'celsius' ? '°C' : '°F'}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  max={999}
                  value={formData.temperaturaCarga || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    if (value <= 999 && /^[0-9.]*$/.test(e.target.value)) {
                      setFormData({ ...formData, temperaturaCarga: value });
                    }
                  }}
                  placeholder={unidadTemperatura === 'celsius' ? 'Ej: 5.5' : 'Ej: 41.9'}
                  required
                  className="w-full px-3 py-1.5 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-muted/20 text-xs text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unidadTemperatura === 'fahrenheit' && formData.temperaturaCarga ? `Equivalente: ${fahrenheitToCelsius(formData.temperaturaCarga).toFixed(2)}°C` : ''}
                  {unidadTemperatura === 'celsius' && formData.temperaturaCarga ? `Equivalente: ${celsiusToFahrenheit(formData.temperaturaCarga).toFixed(2)}°F` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Fotografías Obligatorias *</h2>
            <p className="text-xs text-muted-foreground mb-3">
              {[
                formData.termografoOrigen ? 'Foto del Termógrafo de Origen' : null,
                formData.termografoNacional ? 'Foto del Termógrafo Nacional' : null,
                'Foto de la Temperatura de la Fruta',
                'Foto de la Mercancía antes de cerrar puertas'
              ].filter(f => f !== null).join(', ')}
            </p>

            <div className={`grid gap-2 md:gap-3 ${
              formData.termografoOrigen && formData.termografoNacional
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : formData.termografoOrigen || formData.termografoNacional
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {[
                formData.termografoOrigen ? { label: 'Termógrafo Origen', index: 0 } : null,
                formData.termografoNacional ? { label: 'Termógrafo Nacional', index: 1 } : null,
                { label: 'Temperatura de la Fruta', index: 2 },
                { label: 'Mercancía', index: 3 }
              ].filter(item => item !== null).map((item) => (
                <div key={item!.index} className="relative">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {item!.label} *
                  </label>
                  <div className="relative">
                    {fotosRequeridas[item!.index] ? (
                      <div className="relative group">
                        <Image
                          src={URL.createObjectURL(fotosRequeridas[item!.index])}
                          alt={`Foto ${item!.label}`}
                          width={400}
                          height={160}
                          className="w-full h-32 md:h-40 object-cover rounded border border-border/50"
                        />
                        <button
                          type="button"
                          onClick={() => { handleFotoRequeridaChange(item!.index, null) }}
                          className="absolute top-1 right-1 md:top-2 md:right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-1.5 md:p-2 rounded transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <XMarkIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { void openCamera(item!.index) }}
                        className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-border/50 rounded cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <CameraIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground mb-1 md:mb-2" />
                        <span className="text-xs text-muted-foreground">Tomar foto</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
              <div>
                <h2 className="text-sm md:text-base font-bold text-foreground">Fotografías Opcionales</h2>
                <p className="text-xs text-muted-foreground">Incidencias, daños u otras observaciones visuales</p>
              </div>
              <button
                type="button"
                onClick={() => { void openCamera(-1, true) }}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded transition-colors border border-border/50 text-xs font-semibold text-foreground"
              >
                <CameraIcon className="h-4 w-4" />
                <span>Tomar foto</span>
              </button>
            </div>

            {fotosOpcionales.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mt-3">
                {fotosOpcionales.map((foto, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(foto)}
                      alt={`Foto opcional ${index + 1}`}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover rounded border border-border/50"
                    />
                    <button
                      type="button"
                      onClick={() => { handleRemoveFotoOpcional(index) }}
                      className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Observaciones *</h2>
            <textarea
              value={formData.observaciones}
              onChange={(e) => { setFormData({ ...formData, observaciones: e.target.value.slice(0, 500) }) }}
              rows={4}
              placeholder="Ingrese cualquier observación relevante sobre la inspección..."
              required
              maxLength={500}
              className="w-full px-3 py-1.5 bg-muted/20 border border-border/50 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-xs text-foreground resize-none"
            />
          </div>

          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Firma de Transporte *</h2>
            <p className="text-xs text-muted-foreground mb-2">
              Trace la firma del responsable del transporte en el área de abajo
            </p>
            <SignaturePad
              value={formData.firmaTransporte || ''}
              onChange={(signature) => setFormData({ ...formData, firmaTransporte: signature })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { router.back() }}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded text-xs font-medium border border-border transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Crear Inspección</span>
                </>
              )}
            </button>
          </div>
        </form>

        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-2xl mx-4">
              <div className="bg-card rounded border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <h3 className="text-sm font-bold text-foreground">Capturar Fotografía</h3>
                  <button
                    onClick={closeCamera}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    type="button"
                  >
                    <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="relative bg-black">
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 p-4 bg-muted/20">
                  <button
                    onClick={closeCamera}
                    type="button"
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded transition-colors text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={capturePhoto}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors text-xs font-semibold"
                  >
                    <CameraIcon className="h-4 w-4" />
                    <span>Capturar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
