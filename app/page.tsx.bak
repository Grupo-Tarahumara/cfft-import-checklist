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
  const { isAuthenticated, isLoading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600/20 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-blue-600/10"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Hero Section - Cinematic Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background with light particles and fog */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#0a0a2a_0%,#01010c_100%)]">
          <div className="absolute inset-0">
            {/* Layered light orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/20 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Particle dots */}
          <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.03]"></div>

          {/* Soft fog overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020210aa] to-[#01010f]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Logo"
                  width={120}
                  height={120}
                  className="object-contain mx-auto drop-shadow-[0_0_20px_rgba(100,150,255,0.5)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-8xl font-extrabold leading-tight mb-6"
          >
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">CFFT Import</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Sistema de Gestión
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-base md:text-lg lg:text-2xl text-blue-100/80 max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4"
          >
            Plataforma integral para la gestión, control y trazabilidad de calidad
            <br />
            <span className="text-blue-200/60 text-sm md:text-base lg:text-lg">
              Monitoreo en tiempo real y alertas predictivas inteligentes.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center space-x-3 px-10 py-5 rounded-2xl text-lg font-bold text-white
                           bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600
                           hover:scale-105 hover:shadow-[0_0_40px_rgba(100,200,255,0.4)]
                           transition-all duration-500 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></span>
                <span className="relative z-10">Comenzar</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative inline-flex items-center space-x-3 px-10 py-5 rounded-2xl text-lg font-bold text-white
                           bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600
                           hover:scale-105 hover:shadow-[0_0_40px_rgba(100,200,255,0.4)]
                           transition-all duration-500 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></span>
                <span className="relative z-10">Acceder al Sistema</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Link>
            )}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.5 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <p className="text-blue-300/70 text-sm font-medium">Desliza para explorar</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-10 border-2 border-blue-400/40 rounded-full flex items-start justify-center p-2"
              >
                <motion.div
                  className="w-1.5 h-3 bg-blue-400/70 rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-slate-950 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#1e293b_0%,#020617_100%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Features Grid */}
            <div className="mb-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20"
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <span className="text-blue-400 text-sm font-semibold">PLATAFORMA INTEGRAL</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Tecnología Avanzada para{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Control de Calidad
                  </span>
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-blue-100/70 max-w-2xl mx-auto font-light px-4">
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
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-white/10 backdrop-blur-sm transform group-hover:shadow-2xl group-hover:border-white/20 transition-all duration-300"></div>
                    <div className="relative p-4 md:p-6 lg:p-8">
                      <div className={`inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg mb-4 md:mb-6`}>
                        <feature.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 md:mb-4 group-hover:text-blue-100 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-blue-100/60 leading-relaxed font-light">
                        {feature.description}
                      </p>
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center text-blue-400 text-sm font-semibold">
                          <span>Descubrir más</span>
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-4xl shadow-2xl"></div>
              <div className="absolute inset-0 bg-black/10 rounded-4xl"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>

              <div className="relative z-10 p-6 md:p-12 lg:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center mb-10 md:mb-16"
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                    Excelencia Operativa en
                    <span className="text-blue-300"> Tiempo Real</span>
                  </h3>
                  <p className="text-sm md:text-lg lg:text-xl text-blue-100 font-light max-w-2xl mx-auto px-4">
                    Métricas que demuestran nuestro compromiso con la calidad y eficiencia en cada proceso
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 md:mb-6 group-hover:bg-white/20 transition-all duration-300">
                        <stat.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 drop-shadow-lg">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base lg:text-lg text-blue-200 font-semibold">
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

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-gray-950 text-white py-12 md:py-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center space-x-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl blur-sm opacity-20"></div>
                <Image
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                  alt="CFFT Import Checklist"
                  width={70}
                  height={70}
                  className="relative object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  CFFT Import
                </span>
                <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">
                  Sistema de gestión
                </p>
              </div>
            </motion.div>

            <motion.p
              className="text-sm md:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed font-light px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Plataforma de vanguardia especializada en la gestión inteligente y control predictivo
              de calidad para importaciones de frutas, estableciendo nuevos estándares en la industria.
            </motion.p>

            <motion.div
              className="border-t border-gray-800 pt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-gray-500 text-sm font-light">
                © {new Date().getFullYear()} CFFT Import. Todos los derechos reservados.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
