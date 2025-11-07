'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
      description: 'Registra y administra todas las inspecciones de embarques con información detallada de proveedores, frutas y condiciones de transporte.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FireIcon,
      title: 'Control de Temperatura',
      description: 'Monitorea la temperatura de las frutas y valida automáticamente contra rangos óptimos para garantizar la calidad del producto.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BellAlertIcon,
      title: 'Sistema de Alertas Inteligentes',
      description: 'Recibe alertas automáticas ante condiciones fuera de rango o falta de termógrafos para acción inmediata.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Dashboard Analítico',
      description: 'Visualiza estadísticas en tiempo real, inspecciones recientes y alertas pendientes con análisis predictivo.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: PhotoIcon,
      title: 'Registro Fotográfico Digital',
      description: 'Adjunta fotos de termógrafos, mercancía y evidencias para documentación completa de cada inspección.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: EnvelopeIcon,
      title: 'Notificaciones Multiplataforma',
      description: 'Sistema de notificaciones por email, sistema y push para mantener informado a todo el equipo.',
      gradient: 'from-amber-500 to-yellow-500'
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
      value: 'Tiempo Real',
      label: 'Analítica Avanzada',
      icon: CpuChipIcon
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-primary/10"></div>
          </div>
          <p className="mt-6 text-muted-foreground text-lg font-medium">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section - Cinematic Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background with light particles and fog */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="absolute inset-0">
            {/* Layered light orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-8 md:mb-10"
          >
            <div className="relative inline-block">
              <div className="relative bg-card backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm">
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Logo"
                  width={100}
                  height={100}
                  className="object-contain mx-auto"
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-foreground"
          >
            CFFT Import
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Sistema de Gestión
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4"
          >
            Plataforma integral para la gestión, control y trazabilidad de calidad
            <br />
            <span className="text-xs md:text-sm">
              Monitoreo en tiempo real y alertas predictivas inteligentes.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {isAuthenticated ? (
              <Link
                href={user?.rol === 'admin' ? '/dashboard' : '/inspecciones'}
                className="group relative inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-primary-foreground
                           bg-primary hover:bg-primary/90
                           transition-all duration-200"
              >
                <span className="relative z-10">Comenzar</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-primary-foreground
                           bg-primary hover:bg-primary/90
                           transition-all duration-200"
              >
                <span className="relative z-10">Acceder al Sistema</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            )}
          </motion.div>

          <motion.div
            className="mt-16 md:mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.5 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <p className="text-muted-foreground text-xs md:text-sm font-medium">Desliza para explorar</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-5 h-9 border-2 border-primary/40 rounded-full flex items-start justify-center p-1.5"
              >
                <motion.div
                  className="w-1 h-2 bg-primary/70 rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 bg-background overflow-hidden">
        
        <div className="absolute inset-0 bg-muted/30 opacity-30"></div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 md:mb-20"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 md:mb-6">
                  <span className="text-primary text-xs md:text-sm font-semibold">PLATAFORMA INTEGRAL</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                  Tecnología Avanzada para{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Control de Calidad
                  </span>
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                  Soluciones innovadoras diseñadas para optimizar cada etapa del proceso de inspección y garantizar la excelencia operativa.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border transform group-hover:shadow-md group-hover:border-border transition-all duration-200"></div>
                    <div className="relative p-4 md:p-5 lg:p-6">
                      <div className={`inline-flex p-2 md:p-2.5 rounded-lg bg-gradient-to-r ${feature.gradient} shadow-sm mb-3 md:mb-4`}>
                        <feature.icon className="h-5 w-5 md:h-5 md:w-5 text-white" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center text-primary text-xs md:text-sm font-semibold">
                          <span>Descubrir más</span>
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border"></div>

              <div className="relative z-10 p-6 md:p-10 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center mb-8 md:mb-12"
                >
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4">
                    Excelencia Operativa en
                    <span className="text-primary"> Tiempo Real</span>
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                    Métricas que demuestran nuestro compromiso con la calidad y eficiencia en cada proceso
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="inline-flex p-2.5 md:p-3 rounded-lg bg-muted border border-border mb-3 md:mb-4 group-hover:bg-muted/80 transition-all duration-200">
                        <stat.icon className="h-5 w-5 md:h-5 md:w-5 text-foreground" />
                      </div>
                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-background text-foreground py-10 md:py-16 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center space-x-3 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Checklist"
                  width={60}
                  height={60}
                  className="relative object-contain"
                />
              </div>
              <div className="text-left">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  CFFT Import
                </span>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">
                  Sistema de gestión
                </p>
              </div>
            </motion.div>

            <motion.p
              className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Plataforma de vanguardia especializada en la gestión inteligente y control predictivo
              de calidad para importaciones de frutas, estableciendo nuevos estándares en la industria.
            </motion.p>

            <motion.div
              className="border-t border-border pt-6 md:pt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-muted-foreground text-xs md:text-sm font-light">
                © {new Date().getFullYear()} CFFT Import. IYHE. Todos los derechos reservados.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
