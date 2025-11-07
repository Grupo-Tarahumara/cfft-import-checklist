'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { UserInfoModal } from '@/components/UserInfoModal';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { generateInspectionPDF } from '@/lib/pdf-generator';
import ImageModal from '@/components/ImageModal';
import { normalizeImageUrl } from '@/lib/image-utils';

export default function DetalleInspeccionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const isNormalUser = user?.rol === 'user';
  const isAdmin = user?.rol === 'admin';

  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    if (id) {
      const loadInspeccionData = async () => {
        try {
          setLoading(true);
          const data = await authApi.get<Inspeccion>(`/inspecciones/${id}`);
          setInspeccion(data);
        } catch (error) {
          console.error('Error loading inspección:', error);
          alert('Error al cargar la inspección');
          router.push('/inspecciones');
        } finally {
          setLoading(false);
        }
      };
      loadInspeccionData();
    }
  }, [id, router]);


  const handleDownloadPDF = async () => {
    if (!inspeccion) return;

    try {
      setIsGeneratingPDF(true);
      toast.loading('Generando PDF...', { id: 'pdf-generation' });

      await generateInspectionPDF(inspeccion, {
        hideTemperatureRanges: isNormalUser,
        hideAlerts: isNormalUser,
      });

      toast.success('PDF descargado correctamente', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast.error('Error al generar el PDF', { id: 'pdf-generation' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleOpenImageModal = (imageUrl: string, imageTitle: string) => {
    setSelectedImage({ url: imageUrl, title: imageTitle });
    setIsModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!inspeccion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Inspección no encontrada</p>
          <Link href="/inspecciones" className="text-primary hover:underline mt-4 inline-block">
            Volver a inspecciones
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const tempEnRango = inspeccion.fruta
    ? (Number(inspeccion.temperaturaFruta) >= Number(inspeccion.fruta.tempMinima) &&
       Number(inspeccion.temperaturaFruta) <= Number(inspeccion.fruta.tempMaxima))
    : null;

  if (inspeccion.fruta) {
    console.log('Validación de temperatura:', {
      temperatura: inspeccion.temperaturaFruta,
      tempNum: Number(inspeccion.temperaturaFruta),
      tempMinima: inspeccion.fruta.tempMinima,
      tempMinNum: Number(inspeccion.fruta.tempMinima),
      tempMaxima: inspeccion.fruta.tempMaxima,
      tempMaxNum: Number(inspeccion.fruta.tempMaxima),
      tempEnRango: tempEnRango
    });
  }

  return (
    <DashboardLayout>
      <div className="mx-auto space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 md:py-4 px-3 md:px-4 rounded-lg bg-card border border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-lg md:text-xl font-bold text-foreground">Detalle de Inspección</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                Nº #{inspeccion.id}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Contenedor:</span> {inspeccion.numeroOrdenContenedor}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-xs font-medium border border-border transition-all duration-200 group whitespace-nowrap"
          >
            <ArrowLeftIcon className="h-3 w-3 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>

        <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
          <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {/* Fecha de Inspección */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">Fecha de Inspección</p>
              <p className="font-semibold text-xs text-foreground">
                {new Date(inspeccion.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">Estado</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-700 rounded text-xs font-semibold border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {inspeccion.estado}
              </span>
            </div>

            {/* Alertas */}
            {!isNormalUser && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">Tiene Alertas</p>
                {inspeccion.tieneAlertas ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-semibold border border-destructive/20">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                    Sí
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-700 rounded text-xs font-semibold border border-green-500/20">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    No
                  </span>
                )}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">Inspector</p>
              {inspeccion.usuario ? (
                <button
                  onClick={() => {
                    if (inspeccion.usuario) {
                      setSelectedUsuario(inspeccion.usuario);
                      setShowUserInfo(true);
                    }
                  }}
                  className="font-semibold text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group hover:underline"
                  title={`Ver información de ${inspeccion.usuario.nombre}`}
                >
                  {inspeccion.usuario.nombre}
                  {inspeccion.usuario.area && (
                    <span className="text-xs text-muted-foreground group-hover:text-primary/60">({inspeccion.usuario.area})</span>
                  )}
                </button>
              ) : (
                <p className="font-semibold text-xs text-foreground">-</p>
              )}
            </div>

            {/* Punto de Inspección */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">Punto de Inspección</p>
              <p className="font-semibold text-xs text-foreground">
                {inspeccion.puntoInspeccion?.nombre || '-'}
              </p>
            </div>

            {/* Fecha de Creación */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">Fecha de Creación</p>
              <p className="text-xs text-foreground">
                {new Date(inspeccion.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
          <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Datos de la Carga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {/* Proveedor */}
            <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Proveedor</p>
              <p className="font-semibold text-xs text-foreground mb-1">
                {inspeccion.proveedor?.nombre || '-'}
              </p>
              {inspeccion.proveedor && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-medium text-foreground">{inspeccion.proveedor.codigo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">País:</span>
                    <span className="font-medium text-foreground">{inspeccion.proveedor.pais}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Fruta</p>
              <p className="font-semibold text-xs text-foreground mb-1">
                {inspeccion.fruta?.nombre || '-'}
              </p>
              {inspeccion.fruta && !isNormalUser && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rango óptimo:</span>
                    <span className="font-medium text-primary">{inspeccion.fruta.tempMinima}°C - {inspeccion.fruta.tempMaxima}°C</span>
                  </div>
                </div>
              )}
            </div>

            {/* Línea Transportista */}
            {inspeccion.lineaTransportista && (
              <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Línea Transportista</p>
                <p className="font-semibold text-xs text-foreground">
                  {inspeccion.lineaTransportista}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
          <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Cantidades</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
           
            <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Pallets</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{inspeccion.numeroPallets}</p>
            </div>

            <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Cajas</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{inspeccion.numeroCajas}</p>
            </div>

            <div className="p-2 md:p-3 rounded bg-muted/20 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Trancas</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{inspeccion.numeroTrancas}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
          <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">Control de Temperatura</h2>
          <div className="space-y-2 md:space-y-3">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              
              <div className="p-2 md:p-3 rounded border border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Termógrafo Origen</p>
                {inspeccion.termografoOrigen ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Presente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                    Ausente
                  </span>
                )}
                {inspeccion.termografoOrigen && inspeccion.paletTermografoOrigen && (
                  <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-border/50">
                    {Array.isArray(inspeccion.paletTermografoOrigen) ? (
                      inspeccion.paletTermografoOrigen.map((palet) => (
                        <span
                          key={palet}
                          className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded border border-border/50 font-semibold"
                        >
                          P#{palet}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded border border-border/50 font-semibold">
                        P#{inspeccion.paletTermografoOrigen}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-2 md:p-3 rounded border border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Termógrafo Nacional</p>
                {inspeccion.termografoNacional ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Presente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                    Ausente
                  </span>
                )}
                {inspeccion.termografoNacional && inspeccion.paletTermografoNacional && (
                  <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-border/50">
                    {Array.isArray(inspeccion.paletTermografoNacional) ? (
                      inspeccion.paletTermografoNacional.map((palet) => (
                        <span
                          key={palet}
                          className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded border border-border/50 font-semibold"
                        >
                          P#{palet}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded border border-border/50 font-semibold">
                        P#{inspeccion.paletTermografoNacional}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              
              <div className="p-2 md:p-3 rounded border border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Temperatura Fruta</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {inspeccion.temperaturaFruta}°
                  </p>
                  <p className="text-xs text-muted-foreground mb-0.5">C</p>
                </div>
                {!isNormalUser && tempEnRango !== null && (
                  <div className="mt-1 pt-1 border-t border-border/50">
                    {tempEnRango ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        En rango
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Fuera rango
                      </span>
                    )}
                  </div>
                )}
                {inspeccion.fruta && !isNormalUser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {inspeccion.fruta.tempMinima}° - {inspeccion.fruta.tempMaxima}°C
                  </p>
                )}
              </div>

              {inspeccion.temperaturaCarga && (
                <div className="p-2 md:p-3 rounded border border-border/50 bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Temperatura Carga</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {inspeccion.temperaturaCarga}°
                    </p>
                    <p className="text-xs text-muted-foreground mb-0.5">C</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {inspeccion.observaciones && (
          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-2">Observaciones</h2>
            <p className="text-xs text-foreground whitespace-pre-wrap">{inspeccion.observaciones}</p>
          </div>
        )}

        {inspeccion.firmaTransporte && (
          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-2">Firma de Transporte</h2>
            <div className="flex flex-col items-center">
              <div className="border border-border rounded p-2 bg-muted/30">
                {inspeccion.firmaTransporte.startsWith('data:') || inspeccion.firmaTransporte.startsWith('http') ? (
                  <img
                    src={normalizeImageUrl(inspeccion.firmaTransporte) || inspeccion.firmaTransporte}
                    alt="Firma de Transporte"
                    className="h-24 md:h-32 object-contain"
                  />
                ) : (
                  <p className="text-muted-foreground text-center text-xs">Firma registrada</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Responsable del Transporte
              </p>
            </div>
          </div>
        )}

        {!isNormalUser && inspeccion.alertas && inspeccion.alertas.length > 0 && (
          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-2 pb-2 border-b border-border/50">
              Alertas ({inspeccion.alertas.length})
            </h2>
            <div className="space-y-2">
              {inspeccion.alertas.map((alerta) => {
                const getCriticidadStyles = () => {
                  switch (alerta.criticidad) {
                    case 'alta':
                      return {
                        border: 'border-border',
                        badge: 'bg-destructive/10 text-destructive'
                      };
                    case 'media':
                      return {
                        border: 'border-border',
                        badge: 'bg-amber-500/10 text-amber-700'
                      };
                    default:
                      return {
                        border: 'border-border',
                        badge: 'bg-primary/10 text-primary'
                      };
                  }
                };

                const styles = getCriticidadStyles();

                return (
                  <div
                    key={alerta.id}
                    className={`p-2 md:p-3 rounded border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${styles.badge}`}>
                            {alerta.criticidad.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {alerta.tipoAlerta.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-foreground mb-1 line-clamp-2">{alerta.descripcion}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alerta.fechaCreacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {alerta.leida && (
                        <span className="flex-shrink-0 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {inspeccion.fotos && inspeccion.fotos.length > 0 && (
          <div className="bg-card p-3 md:p-4 rounded-lg border border-border/50">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-3 pb-2 border-b border-border/50">
              Fotos ({inspeccion.fotos.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {inspeccion.fotos.map((foto) => (
                <div key={foto.id} className="group flex flex-col overflow-hidden rounded border border-border/50 bg-background hover:border-primary/30 transition-all">
                  
                  <div className="relative aspect-square bg-muted/30 overflow-hidden flex-shrink-0">
                    {foto.urlFoto ? (
                      <img
                        src={normalizeImageUrl(foto.urlFoto) || foto.urlFoto}
                        alt={foto.tipoFoto.replace(/_/g, ' ')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted/50">
                        <span className="text-muted-foreground text-3xl">📷</span>
                      </div>
                    )}

                    {foto.esObligatoria && (
                      <div className="absolute top-1 right-1">
                        <span className="text-xs bg-destructive/90 text-white px-1.5 py-0.5 rounded font-semibold">
                          Oblig.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow p-2 md:p-2.5">
                    <h3 className="text-xs font-bold text-foreground mb-1 line-clamp-1">
                      {foto.tipoFoto.replace(/_/g, ' ')}
                    </h3>

                    <div className="mt-auto pt-1 flex justify-center">
                      <button
                        onClick={() => handleOpenImageModal(normalizeImageUrl(foto.urlFoto) || foto.urlFoto, foto.tipoFoto.replace(/_/g, ' ').toUpperCase())}
                        className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all text-xs"
                        title="Ver"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/20 p-2 md:p-3 rounded-lg border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Última actualización: <span className="text-foreground text-xs">{new Date(inspeccion.fechaActualizacion).toLocaleDateString('es-ES')}</span></p>
          </div>
          <div className="flex gap-1 md:gap-2 flex-wrap w-full sm:w-auto">
            <Link
              href={`/inspecciones`}
              className="flex-1 sm:flex-none px-2 md:px-3 py-1 md:py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-xs font-medium inline-flex items-center justify-center transition-all"
            >
              ← Lista
            </Link>
            {isAdmin && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex-1 sm:flex-none px-2 md:px-3 py-1 md:py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded disabled:bg-primary/50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 transition-all text-xs font-medium"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground"></div>
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">PDF</span>
                    </>
                  )}
                </button>
                {inspeccion.pdfGenerado && (
                  <a
                    href={inspeccion.pdfGenerado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-2 md:px-3 py-1 md:py-1.5 bg-green-500 hover:bg-green-600 text-white rounded inline-flex items-center justify-center gap-1 transition-all text-xs font-medium"
                  >
                    <span>📄</span>
                    <span className="hidden sm:inline">Servidor</span>
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          imageUrl={selectedImage.url}
          imageTitle={selectedImage.title}
          onClose={handleCloseImageModal}
        />
      )}

      <UserInfoModal
        usuario={selectedUsuario}
        isOpen={showUserInfo}
        onClose={() => setShowUserInfo(false)}
      />
    </DashboardLayout>
  );
}
