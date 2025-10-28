'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function NotificationPermission() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const [isEnabling, setIsEnabling] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Mostrar banner solo si es admin, las notificaciones están soportadas y no tiene permiso
  useEffect(() => {
    if (
      user?.rol === 'admin' &&
      notifications.isSupported &&
      notifications.permission === 'default'
    ) {
      // Verificar si el usuario ya descartó el banner anteriormente
      const dismissed = localStorage.getItem('notification-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, [user, notifications.isSupported, notifications.permission]);

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    try {
      // Solicitar permiso
      const granted = await notifications.requestPermission();

      if (granted) {
        // Obtener token FCM
        const fcmToken = await notifications.getFCMToken();

        if (fcmToken) {
          // Registrar token con el backend
          const registered = await notifications.registerToken(fcmToken);

          if (registered) {
            toast.success('¡Notificaciones habilitadas correctamente!');
            setShowBanner(false);
          } else {
            toast.error('Error al registrar las notificaciones');
          }
        } else {
          toast.error('No se pudo obtener el token de notificaciones');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Error al habilitar notificaciones');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetDismiss = () => {
    localStorage.removeItem('notification-banner-dismissed');
    setShowBanner(true);
  };

  // No mostrar si no es admin
  if (user?.rol !== 'admin') {
    return null;
  }

  // No mostrar si no están soportadas
  if (!notifications.isSupported) {
    return null;
  }

  // Mostrar estado de notificaciones en la configuración
  if (notifications.permission === 'granted' && notifications.token) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Notificaciones push habilitadas
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Recibirás notificaciones cuando se detecten alertas en las inspecciones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar banner si el permiso está por defecto
  if (showBanner && notifications.permission === 'default') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Habilita las notificaciones push
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Recibe alertas en tiempo real cuando se detecten problemas en las inspecciones.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isEnabling}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isEnabling ? 'Habilitando...' : 'Habilitar notificaciones'}
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si fue denegado
  if (notifications.permission === 'denied') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Notificaciones bloqueadas
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Has bloqueado las notificaciones. Para habilitarlas, debes permitirlas desde la configuración de tu navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
