import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const VAPID_KEY = 'BHtYA2zKEfOrbQkjLQohGefebES0S46e5WZmPf4owHzGc9XQ0QHQzRfanLoipZyfd4p9n21lkS06YE9N2a9hlNc';

interface NotificationState {
  permission: NotificationPermission;
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    token: null,
    isSupported: false,
    isLoading: true,
  });

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
        isLoading: false,
      }));
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast.error('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast.success('Notificaciones habilitadas correctamente');
        return true;
      } else if (permission === 'denied') {
        toast.error('Permisos de notificación denegados');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error al solicitar permisos de notificación');
      return false;
    }
  }, [state.isSupported]);

  // Get FCM token
  const getFCMToken = useCallback(async () => {
    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    if (state.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log('FCM Token obtained:', currentToken);
        setState(prev => ({ ...prev, token: currentToken }));
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }, [state.permission]);

  // Register token with backend
  const registerToken = useCallback(async (token: string) => {
    try {
      // Extract browser info for deviceName (max 255 chars)
      const browserInfo = (() => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
      })();

      // Truncate userAgent to 255 chars (database limit)
      const truncatedUserAgent = navigator.userAgent.substring(0, 255);

      // Get CSRF token
      const csrfToken = await api.getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/device-tokens/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          token,
          platform: 'web',
          deviceName: browserInfo,
          userAgent: truncatedUserAgent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', response.status, errorData);
        throw new Error(`Failed to register token: ${response.status}`);
      }

      console.log('Token registered with backend successfully');
      return true;
    } catch (error) {
      console.error('Error registering token with backend:', error);
      return false;
    }
  }, []);

  // Unregister token from backend
  const unregisterToken = useCallback(async (token: string) => {
    try {
      // Get CSRF token
      const csrfToken = await api.getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/device-tokens/unregister`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to unregister token');
      }

      console.log('Token unregistered from backend successfully');
      setState(prev => ({ ...prev, token: null }));
      return true;
    } catch (error) {
      console.error('Error unregistering token from backend:', error);
      return false;
    }
  }, []);

  // Setup foreground message listener
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      const title = payload.notification?.title || 'Nueva notificación';
      const body = payload.notification?.body || '';

      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-gray-600">{body}</div>
          </div>
        ),
        {
          duration: 5000,
          icon: payload.data?.type === 'alert' ? '⚠️' : '🔔',
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...state,
    requestPermission,
    getFCMToken,
    registerToken,
    unregisterToken,
  };
}
