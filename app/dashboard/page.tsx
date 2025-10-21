'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { Inspeccion, Alerta } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  FireIcon,
  CalendarIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inspeccionesData, alertasData] = await Promise.all([
        authApi.get<Inspeccion[]>('/inspecciones'),
        authApi.get<Alerta[]>('/alertas?noLeidas=true'),
      ]);

      // Tomar solo las últimas 5 inspecciones
      setInspecciones(inspeccionesData.slice(0, 5));
      setAlertasNoLeidas(alertasData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Inspecciones',
      value: inspecciones.length,
      icon: ClipboardDocumentListIcon,
      color: 'blue'
    },
    {
      label: 'Con Alertas',
      value: inspecciones.filter(i => i.tieneAlertas).length,
      icon: ExclamationTriangleIcon,
      color: 'orange'
    },
    {
      label: 'Alertas No Leídas',
      value: alertasNoLeidas.length,
      icon: BellAlertIcon,
      color: 'red'
    },
    {
      label: 'Alertas Críticas',
      value: alertasNoLeidas.filter(a => a.criticidad === 'alta').length,
      icon: FireIcon,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCriticidadStyles = (criticidad: string) => {
    const styles = {
      alta: {
        border: 'border-red-500',
        bg: 'bg-red-50',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800'
      },
      media: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      baja: {
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-800'
      }
    };
    return styles[criticidad as keyof typeof styles] || styles.baja;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Cargando datos del dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">
            Resumen general de inspecciones y alertas del sistema
          </p>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 group-hover:border-gray-200">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>

                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-gray-600 text-xs md:text-sm font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alertas No Leídas */}
        {alertasNoLeidas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <BellAlertIcon className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Alertas Pendientes</h2>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {alertasNoLeidas.length} alertas requieren atención
                    </p>
                  </div>
                </div>
                <Link
                  href="/alertas"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Ver todas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {alertasNoLeidas.slice(0, 5).map((alerta, index) => {
                const styles = getCriticidadStyles(alerta.criticidad);
                return (
                  <motion.div
                    key={alerta.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-3 md:p-4 rounded-lg md:rounded-xl border-l-4 ${styles.border} ${styles.bg} hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <p className="font-semibold text-sm md:text-base text-gray-900">{alerta.tipoAlerta}</p>
                          <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full font-medium ${styles.badge}`}>
                            {alerta.criticidad.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">{alerta.descripcion}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{new Date(alerta.fechaCreacion).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BuildingStorefrontIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span>Inspección #{alerta.inspeccionId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Últimas Inspecciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Últimas Inspecciones</h2>
                  <p className="text-gray-600 text-xs md:text-sm">
                    {inspecciones.length} inspecciones recientes
                  </p>
                </div>
              </div>
              <Link
                href="/inspecciones"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>Ver todas</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {inspecciones.map((inspeccion, index) => (
              <motion.div
                key={inspeccion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-white"
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                      <TruckIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-900">
                        {inspeccion.numeroOrdenContenedor}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inspeccion.proveedor?.nombre || '-'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                    {inspeccion.estado}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs text-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{new Date(inspeccion.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BuildingStorefrontIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{inspeccion.fruta?.nombre || '-'}</span>
                    </div>
                  </div>
                  <div>
                    {inspeccion.tieneAlertas ? (
                      <div className="flex items-center space-x-1 text-red-600">
                        <ExclamationTriangleIcon className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="font-medium text-xs">Con alertas</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckBadgeIcon className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="font-medium text-xs">Sin alertas</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}