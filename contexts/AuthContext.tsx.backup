'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoginDto, UserProfile } from '@/types';

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
      // Configurar el token en los headers
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
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

  const login = async (credentials: LoginDto) => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', credentials);
      const { access_token } = response;

      // Guardar el token
      localStorage.setItem('access_token', access_token);
      setToken(access_token);

      // Cargar el perfil del usuario
      await loadUserProfile(access_token);

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      // Solo mostrar en consola si NO es un error 401 (credenciales incorrectas)
      if (error?.status !== 401) {
        console.error('Login error:', error);
      }
      throw error;
    }
  };

  const logout = () => {
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
