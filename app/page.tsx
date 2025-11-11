'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  FireIcon,
  BellAlertIcon,
  PhotoIcon,
  EnvelopeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const features = [
    {
      icon: DocumentCheckIcon,
      title: 'Gestión de Inspecciones',
      description: 'Registra y administra todas las inspecciones de embarques con información detallada de proveedores, frutas y condiciones de transporte.'
    },
    {
      icon: FireIcon,
      title: 'Control de Temperatura',
      description: 'Monitorea la temperatura de las frutas y valida automáticamente contra rangos óptimos para garantizar la calidad del producto.'
    },
    {
      icon: BellAlertIcon,
      title: 'Sistema de Alertas Inteligentes',
      description: 'Recibe alertas automáticas ante condiciones fuera de rango o falta de termógrafos para acción inmediata.'
    },
    {
      icon: ChartBarIcon,
      title: 'Dashboard Analítico',
      description: 'Visualiza estadísticas en tiempo real, inspecciones recientes y alertas pendientes con análisis predictivo.'
    },
    {
      icon: PhotoIcon,
      title: 'Registro Fotográfico Digital',
      description: 'Adjunta fotos de termógrafos, mercancía y evidencias para documentación completa de cada inspección.'
    },
    {
      icon: EnvelopeIcon,
      title: 'Notificaciones Multiplataforma',
      description: 'Sistema de notificaciones por email, sistema y push para mantener informado a todo el equipo.'
    }
  ];

  const stats = [
    {
      value: '100%',
      label: 'Trazabilidad Digital',
      icon: ShieldCheckIcon
    },
    {
      value: '24/7',
      label: 'Monitoreo Continuo',
      icon: ClockIcon
    },
    {
      value: 'Multi',
      label: 'Acceso Colaborativo',
      icon: UserGroupIcon
    },
    {
      value: 'Real',
      label: 'Analítica Avanzada',
      icon: CpuChipIcon
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          </div>
          <p className="mt-4 text-muted-foreground text-base font-medium">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="relative bg-card backdrop-blur-sm p-3 rounded border border-border/50 shadow-sm">
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Logo"
                  width={80}
                  height={80}
                  className="object-contain mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 text-foreground animate-fade-in-up">
            CFFT Import
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Sistema de Gestión
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Plataforma integral para la gestión, control y trazabilidad de calidad
            <br />
            <span className="text-xs">
              Monitoreo en tiempo real y alertas predictivas inteligentes.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {isAuthenticated ? (
              <Link
                href={user?.rol === 'admin' ? '/dashboard' : '/inspecciones'}
                className="group relative inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded text-xs md:text-sm font-medium text-primary-foreground
                           bg-primary hover:bg-primary/90
                           transition-all duration-200"
              >
                <span className="relative z-10">Comenzar</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded text-xs md:text-sm font-medium text-primary-foreground
                           bg-primary hover:bg-primary/90
                           transition-all duration-200"
              >
                <span className="relative z-10">Acceder al Sistema</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            )}
          </div>

          <div className="mt-12 md:mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-muted-foreground text-xs font-medium">Desliza para explorar</p>
              <div className="w-4 h-7 border-2 border-primary/40 rounded-full flex items-start justify-center p-1 animate-bounce-slow">
                <div className="w-1 h-1.5 bg-primary/70 rounded-full animate-scroll-down" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16 bg-background overflow-hidden">

        <div className="absolute inset-0 bg-muted/30 opacity-30"></div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 md:mb-4">
                  <span className="text-primary text-xs font-medium">PLATAFORMA INTEGRAL</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
                  Tecnología Avanzada para{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Control de Calidad
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
                  Soluciones innovadoras diseñadas para optimizar cada etapa del proceso de inspección y garantizar la excelencia operativa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="group relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-card rounded border border-border/50 transform group-hover:shadow-md group-hover:border-border transition-all duration-200"></div>
                    <div className="relative p-4 md:p-5">
                      <div className="inline-flex p-2 rounded bg-primary/10 border border-primary/20 mb-3">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center text-primary text-xs font-medium">
                          <span>Descubrir más</span>
                          <span className="ml-1.5 group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-card rounded border border-border/50 shadow-sm"></div>

              <div className="relative z-10 p-6 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3">
                    Excelencia Operativa en
                    <span className="text-primary"> Tiempo Real</span>
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
                    Métricas que demuestran nuestro compromiso con la calidad y eficiencia en cada proceso
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center group"
                    >
                      <div className="inline-flex p-2 md:p-2.5 rounded bg-muted border border-border/50 mb-2 md:mb-3 group-hover:bg-muted/80 transition-all duration-200">
                        <stat.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background text-foreground py-8 md:py-12 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
              <div className="relative">
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Checklist"
                  width={50}
                  height={50}
                  className="relative object-contain"
                />
              </div>
              <div className="text-left">
                <span className="text-base md:text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  CFFT Import
                </span>
                <p className="text-xs text-muted-foreground font-medium">
                  Sistema de gestión
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed px-4">
              Plataforma de vanguardia especializada en la gestión inteligente y control predictivo
              de calidad para importaciones de frutas, estableciendo nuevos estándares en la industria.
            </p>

            <div className="border-t border-border/50 pt-4 md:pt-6">
              <p className="text-muted-foreground text-xs font-light">
                © {new Date().getFullYear()} CFFT Import. IYHE. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-scroll-down {
          animation: scroll-down 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
