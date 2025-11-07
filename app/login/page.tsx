'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/inspecciones');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
    } catch (err: unknown) {
      const error = err as { status?: number; response?: { status?: number }; message?: string } | null;
      
      if (error?.status === 401 || error?.response?.status === 401 || error?.message?.includes('401')) {
        setError('Credenciales inválidas. Por favor, verifique su usuario y contraseña.');
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('Error de conexión. Por favor, intente nuevamente.');
      }
      if (error?.status !== 401) {
        console.error('Login error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative bg-card backdrop-blur-sm p-8 md:p-10 rounded-lg shadow-sm w-full max-w-md border border-border transition-all duration-500 group">
       
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
        
        <div className="relative">
          <div className="text-center mb-8 md:mb-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="relative bg-muted p-4 rounded-lg shadow-sm border border-border backdrop-blur-sm">
                  <Image
                    src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                    alt="CFFT Import Logo"
                    width={60}
                    height={60}
                    className="relative object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
              CFFT IMPORT
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Quality Intelligence Platform
            </p>

            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-700 text-xs font-medium">Sistema en línea</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-semibold text-foreground">
                Usuario
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder-muted-foreground text-foreground text-sm"
                    placeholder="usuario@cfft.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder-muted-foreground text-foreground text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 9.811a7.978 7.978 0 00-1.457-4.06 4 4 0 00-6.486 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded-lg flex items-center space-x-2 animate-shake">
                <svg className="h-4 w-4 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs md:text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 md:py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Acceder al Sistema</span>
                    <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Cifrado SSL/TLS</span>
              </div>
              <div className="w-px h-3 bg-border"></div>
              <div className="flex items-center space-x-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Autenticación Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}