'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Alerta } from '@/types';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  FireIcon,
  BellAlertIcon,
  CheckCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filteredAlertas, setFilteredAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCriticidad, setFilterCriticidad] = useState('');
  const [filterLeida, setFilterLeida] = useState('');

  useEffect(() => {
    loadAlertas();
  }, []);

  useEffect(() => {
    filterAlertasData();
  }, [filterCriticidad, filterLeida, alertas]);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const data = await authApi.get<Alerta[]>('/alertas');
      setAlertas(data);
    } catch (error) {
      console.error('Error loading alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlertasData = () => {
    let filtered = [...alertas];

    if (filterCriticidad) {
      filtered = filtered.filter((alerta) => alerta.criticidad === filterCriticidad);
    }

    if (filterLeida === 'leidas') {
      filtered = filtered.filter((alerta) => alerta.leida);
    } else if (filterLeida === 'no_leidas') {
      filtered = filtered.filter((alerta) => !alerta.leida);
    }

    setFilteredAlertas(filtered);
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await authApi.patch(`/alertas/${id}/marcar-leida`, {});
      // Actualizar el estado local sin recargar toda la página
      setAlertas(prevAlertas =>
        prevAlertas.map(alerta =>
          alerta.id === id ? { ...alerta, leida: true } : alerta
        )
      );
    } catch (error) {
      console.error('Error marking alerta as read:', error);
      alert('Error al marcar la alerta como leída');
    }
  };

  const handleMarcarTodasLeidas = async (inspeccionId: number) => {
    try {
      const alertasInspeccion = alertas.filter(a => a.inspeccionId === inspeccionId && !a.leida);

      // Marcar todas las alertas de esta inspección como leídas
      await Promise.all(
        alertasInspeccion.map(alerta =>
          authApi.patch(`/alertas/${alerta.id}/marcar-leida`, {})
        )
      );

      // Actualizar el estado local
      setAlertas(prevAlertas =>
        prevAlertas.map(alerta =>
          alerta.inspeccionId === inspeccionId ? { ...alerta, leida: true } : alerta
        )
      );
    } catch (error) {
      console.error('Error marking alertas as read:', error);
      alert('Error al marcar las alertas como leídas');
    }
  };

  // Agrupar alertas por inspección
  const groupAlertasByInspeccion = (alertas: Alerta[]) => {
    const grouped = new Map<number, Alerta[]>();

    alertas.forEach(alerta => {
      const existing = grouped.get(alerta.inspeccionId) || [];
      grouped.set(alerta.inspeccionId, [...existing, alerta]);
    });

    return Array.from(grouped.values());
  };

  const getCriticidadStyles = (criticidad: string) => {
    const styles = {
      alta: {
        border: 'border-red-500',
        bg: 'bg-red-50/80',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800',
        icon: FireIcon
      },
      media: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-50/80',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: ExclamationTriangleIcon
      },
      baja: {
        border: 'border-blue-500',
        bg: 'bg-blue-50/80',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-800',
        icon: BellAlertIcon
      }
    };
    return styles[criticidad as keyof typeof styles] || styles.baja;
  };

  const stats = [
    {
      label: 'Total de Alertas',
      value: alertas.length,
      icon: BellAlertIcon,
      color: 'from-gray-500 to-gray-600'
    },
    {
      label: 'Alertas Críticas',
      value: alertas.filter((a) => a.criticidad === 'alta').length,
      icon: FireIcon,
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Alertas Medias',
      value: alertas.filter((a) => a.criticidad === 'media').length,
      icon: ExclamationTriangleIcon,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      label: 'No Leídas',
      value: alertas.filter((a) => !a.leida).length,
      icon: BellAlertIcon,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/20 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-600/10"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Cargando alertas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Gestión de Alertas
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Monitorea y gestiona las alertas del sistema en tiempo real
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-200/60"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl">
              <FunnelIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Filtros de Búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Criticidad
              </label>
              <select
                value={filterCriticidad}
                onChange={(e) => setFilterCriticidad(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Todas las criticidades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Estado
              </label>
              <select
                value={filterLeida}
                onChange={(e) => setFilterLeida(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Todas</option>
                <option value="no_leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {groupAlertasByInspeccion(filteredAlertas).map((alertasGrupo, index) => {
            // Obtener la criticidad más alta del grupo
            const criticidadMasAlta = alertasGrupo.reduce((max, alerta) => {
              const orden = { alta: 3, media: 2, baja: 1 };
              return (orden[alerta.criticidad as keyof typeof orden] || 0) > (orden[max as keyof typeof orden] || 0) ? alerta.criticidad : max;
            }, 'baja');

            const styles = getCriticidadStyles(criticidadMasAlta);
            const IconComponent = styles.icon;
            const todasLeidas = alertasGrupo.every(a => a.leida);
            const algunaNoLeida = alertasGrupo.some(a => !a.leida);
            const primeraAlerta = alertasGrupo[0];

            return (
              <motion.div
                key={`inspeccion-${primeraAlerta.inspeccionId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`bg-white/70 backdrop-blur-xl p-6 rounded-2xl border-l-4 ${styles.border} ${styles.bg} hover:shadow-xl transition-all duration-300 ${
                  todasLeidas ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${styles.badge}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-xl font-semibold ${styles.badge}`}>
                        {criticidadMasAlta.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {alertasGrupo.length} {alertasGrupo.length === 1 ? 'alerta' : 'alertas'}
                      </span>
                      {todasLeidas && (
                        <span className="flex items-center text-xs bg-green-100 text-green-700 px-3 py-1 rounded-xl font-medium">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Leídas
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      {alertasGrupo.map((alerta) => (
                        <div key={alerta.id} className="flex items-start space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                            alerta.criticidad === 'alta' ? 'bg-red-500' :
                            alerta.criticidad === 'media' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></span>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm">
                              <span className="font-medium">{alerta.tipoAlerta.replace(/_/g, ' ')}:</span> {alerta.descripcion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(primeraAlerta.fechaCreacion).toLocaleString('es-ES')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Inspección #{primeraAlerta.inspeccionId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <a
                      href={`/inspecciones/${primeraAlerta.inspeccionId}`}
                      className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-semibold text-center"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver inspección</span>
                    </a>
                    {algunaNoLeida && (
                      <button
                        onClick={() => handleMarcarTodasLeidas(primeraAlerta.inspeccionId)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-semibold"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Marcar todas como leídas</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredAlertas.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60"
            >
              <BellAlertIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No se encontraron alertas con los filtros seleccionados
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
