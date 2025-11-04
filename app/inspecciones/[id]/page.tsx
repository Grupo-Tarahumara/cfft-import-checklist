'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { UserInfoModal } from '@/components/UserInfoModal';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
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

      // Para usuarios normales, ocultar rangos de temperatura y alertas
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!inspeccion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Inspección no encontrada</p>
          <Link href="/inspecciones" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver a inspecciones
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Validar si la temperatura está en rango
  const tempEnRango = inspeccion.fruta
    ? (Number(inspeccion.temperaturaFruta) >= Number(inspeccion.fruta.tempMinima) &&
       Number(inspeccion.temperaturaFruta) <= Number(inspeccion.fruta.tempMaxima))
    : null;

  // Debug - remover después
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detalle de Inspección</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm font-semibold text-gray-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                Nº Inspección: #{inspeccion.id}
              </div>
              <p className="text-gray-600">
                Contenedor: {inspeccion.numeroOrdenContenedor}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Volver</span>
          </button>
        </div>

        {/* Información General */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fecha de Inspección</p>
              <p className="font-medium text-gray-900">
                {new Date(inspeccion.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {inspeccion.estado}
              </span>
            </div>

            {!isNormalUser && (
              <div>
                <p className="text-sm text-gray-500">Tiene Alertas</p>
                <p className="font-medium">
                  {inspeccion.tieneAlertas ? (
                    <span className="text-red-600">⚠️ Sí</span>
                  ) : (
                    <span className="text-green-600">✓ No</span>
                  )}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Inspector</p>
              {inspeccion.usuario ? (
                <button
                  onClick={() => {
                    if (inspeccion.usuario) {
                      setSelectedUsuario(inspeccion.usuario);
                      setShowUserInfo(true);
                    }
                  }}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                  title={`Ver información de ${inspeccion.usuario.nombre}`}
                >
                  <span className="group-hover:underline">
                    {inspeccion.usuario.nombre}
                  </span>
                  {inspeccion.usuario.area && (
                    <span className="text-sm text-gray-500 group-hover:text-blue-500">({inspeccion.usuario.area})</span>
                  )}
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ) : (
                <p className="font-medium text-gray-900">-</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Punto de Inspección</p>
              <p className="font-medium text-gray-900">
                📍 {inspeccion.puntoInspeccion?.nombre || '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="text-sm text-gray-700">
                {new Date(inspeccion.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* Datos de la Carga */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Datos de la Carga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Proveedor</p>
              <p className="font-medium text-gray-900 text-lg">
                {inspeccion.proveedor?.nombre || '-'}
              </p>
              {inspeccion.proveedor && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Código:</span> {inspeccion.proveedor.codigo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">País:</span> {inspeccion.proveedor.pais}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Fruta</p>
              <p className="font-medium text-gray-900 text-lg">
                {inspeccion.fruta?.nombre || '-'}
              </p>
              {inspeccion.fruta && !isNormalUser && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rango óptimo:</span>{' '}
                    {inspeccion.fruta.tempMinima}°C - {inspeccion.fruta.tempMaxima}°C
                  </p>
                </div>
              )}
            </div>

            {inspeccion.lineaTransportista && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Línea Transportista</p>
                <p className="font-medium text-gray-900 text-lg">
                  {inspeccion.lineaTransportista}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cantidades */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cantidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Pallets</p>
              <p className="text-3xl font-bold text-blue-600">{inspeccion.numeroPallets}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Cajas</p>
              <p className="text-3xl font-bold text-green-600">{inspeccion.numeroCajas}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Trancas</p>
              <p className="text-3xl font-bold text-purple-600">{inspeccion.numeroTrancas}</p>
            </div>
          </div>
        </div>

        {/* Control de Temperatura */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Temperatura</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-500 mb-2">Termógrafo Origen</p>
              <div className="flex items-center mb-1">
                {inspeccion.termografoOrigen ? (
                  <span className="text-green-600 font-medium">✓ Presente</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Ausente</span>
                )}
              </div>
              {inspeccion.termografoOrigen && inspeccion.paletTermografoOrigen && (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(inspeccion.paletTermografoOrigen) ? (
                    inspeccion.paletTermografoOrigen.map((palet) => (
                      <span
                        key={palet}
                        className="text-sm bg-blue-50 text-blue-900 px-2 py-1 rounded inline-block font-semibold"
                      >
                        Palet #{palet}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm bg-blue-50 text-blue-900 px-2 py-1 rounded inline-block font-semibold">
                      Palet #{inspeccion.paletTermografoOrigen}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-500 mb-2">Termógrafo Nacional</p>
              <div className="flex items-center mb-1">
                {inspeccion.termografoNacional ? (
                  <span className="text-green-600 font-medium">✓ Presente</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Ausente</span>
                )}
              </div>
              {inspeccion.termografoNacional && inspeccion.paletTermografoNacional && (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(inspeccion.paletTermografoNacional) ? (
                    inspeccion.paletTermografoNacional.map((palet) => (
                      <span
                        key={palet}
                        className="text-sm bg-green-50 text-green-900 px-2 py-1 rounded inline-block font-semibold"
                      >
                        Palet #{palet}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm bg-green-50 text-green-900 px-2 py-1 rounded inline-block font-semibold">
                      Palet #{inspeccion.paletTermografoNacional}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-gray-500 mb-2">Temperatura de la Fruta</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {inspeccion.temperaturaFruta}°C
                </p>
                {!isNormalUser && tempEnRango !== null && (
                  tempEnRango ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      ✓ En rango
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                      ⚠️ Fuera de rango
                    </span>
                  )
                )}
              </div>
              {inspeccion.fruta && !isNormalUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Rango óptimo: {inspeccion.fruta.tempMinima}°C - {inspeccion.fruta.tempMaxima}°C
                </p>
              )}
            </div>

            {inspeccion.temperaturaCarga && (
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-500 mb-2">Temperatura de la Carga</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inspeccion.temperaturaCarga}°C
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Observaciones */}
        {inspeccion.observaciones && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Observaciones</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{inspeccion.observaciones}</p>
          </div>
        )}

        {/* Firma de Transporte */}
        {inspeccion.firmaTransporte && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Firma de Transporte</h2>
            <div className="flex flex-col items-center">
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                {inspeccion.firmaTransporte.startsWith('data:') || inspeccion.firmaTransporte.startsWith('http') ? (
                  <Image
                    src={normalizeImageUrl(inspeccion.firmaTransporte) || inspeccion.firmaTransporte}
                    alt="Firma de Transporte"
                    width={300}
                    height={160}
                    className="h-40 object-contain"
                  />
                ) : (
                  <p className="text-gray-500 text-center text-sm">Firma registrada</p>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Firma del Responsable del Transporte
              </p>
            </div>
          </div>
        )}

        {/* Alertas */}
        {!isNormalUser && inspeccion.alertas && inspeccion.alertas.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Alertas ({inspeccion.alertas.length})
            </h2>
            <div className="space-y-3">
              {inspeccion.alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 rounded border-l-4 ${
                    alerta.criticidad === 'alta'
                      ? 'border-red-500 bg-red-50'
                      : alerta.criticidad === 'media'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            alerta.criticidad === 'alta'
                              ? 'bg-red-200 text-red-800'
                              : alerta.criticidad === 'media'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {alerta.criticidad.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {alerta.tipoAlerta.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-gray-800">{alerta.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alerta.fechaCreacion).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {alerta.leida && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        ✓ Leída
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fotos */}
        {inspeccion.fotos && inspeccion.fotos.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Fotos ({inspeccion.fotos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspeccion.fotos.map((foto) => (
                <div key={foto.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative aspect-video bg-gray-100">
                    {foto.urlFoto ? (
                      <Image
                        src={normalizeImageUrl(foto.urlFoto) || foto.urlFoto}
                        alt={foto.tipoFoto.replace(/_/g, ' ')}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400 text-4xl">📷</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {foto.tipoFoto.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    {foto.descripcion && (
                      <p className="text-xs text-gray-600 mb-2">{foto.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {foto.esObligatoria && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          Obligatoria
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenImageModal(normalizeImageUrl(foto.urlFoto) || foto.urlFoto, foto.tipoFoto.replace(/_/g, ' ').toUpperCase())}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver imagen completa →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>Última actualización: {new Date(inspeccion.fechaActualizacion).toLocaleString('es-ES')}</p>
          </div>
          <div className="space-x-3 flex">
            <Link
              href={`/inspecciones`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 inline-block transition-colors"
            >
              Volver a Lista
            </Link>
            {isAdmin && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      Descargar PDF
                    </>
                  )}
                </button>
                {inspeccion.pdfGenerado && (
                  <a
                    href={inspeccion.pdfGenerado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block transition-colors"
                  >
                    📄 PDF del servidor
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          imageUrl={selectedImage.url}
          imageTitle={selectedImage.title}
          onClose={handleCloseImageModal}
        />
      )}

      {/* User Info Modal */}
      <UserInfoModal
        usuario={selectedUsuario}
        isOpen={showUserInfo}
        onClose={() => setShowUserInfo(false)}
      />
    </DashboardLayout>
  );
}
