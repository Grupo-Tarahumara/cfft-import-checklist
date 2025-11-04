'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoginDto, UserProfile } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

const buildUrl = (baseUrl: string, endpoint: string): string => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const notifications = useNotifications();

  // Cargar el token del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      loadUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async (authToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(buildUrl(apiUrl, '/auth/profile'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const profile = await response.json();
        setUser(profile);

        // Registrar notificaciones push si es admin
        if (profile.rol === 'admin') {
          setupPushNotifications();
        }
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setupPushNotifications = async () => {
    try {
      // Solo intentar si las notificaciones están soportadas
      if (!notifications.isSupported) {
        console.log('Push notifications not supported');
        return;
      }

      // Si ya tiene permiso, obtener el token directamente
      if (notifications.permission === 'granted') {
        const fcmToken = await notifications.getFCMToken();
        if (fcmToken) {
          await notifications.registerToken(fcmToken);
        }
      }
      // Si no tiene permiso, no hacemos nada (el usuario puede habilitarlo después)
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      const response = await api.post<{ access_token: string }, LoginDto>('/auth/login', credentials);
      const { access_token } = response;

      // Guardar el token
      localStorage.setItem('access_token', access_token);
      setToken(access_token);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const profileResponse = await fetch(buildUrl(apiUrl, '/auth/profile'), {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        credentials: 'include',
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUser(profile);

        // Registrar notificaciones push si es admin
        if (profile.rol === 'admin') {
          setupPushNotifications();
        }

        // Redirigir según el rol del usuario
        if (profile.rol === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/inspecciones');
        }
      }
    } catch (error: any) {
      // Solo mostrar en consola si NO es un error 401 (credenciales incorrectas)
      if (error?.status !== 401) {
        console.error('Login error:', error);
      }
      throw error;
    }
  };

  const logout = async () => {
    // Desregistrar token de notificaciones si existe
    if (notifications.token) {
      await notifications.unregisterToken(notifications.token);
    }

    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    api.clearCsrfToken();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
