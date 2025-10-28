'use client';

import { Usuario } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserInfoModalProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserInfoModal({ usuario, isOpen, onClose }: UserInfoModalProps) {
  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 md:px-8 py-6 md:py-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{usuario.nombre}</h2>
              <p className="text-blue-100 text-sm md:text-base">@{usuario.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Estado del Usuario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider mb-2">
                Estado
              </p>
              <div className="flex items-center gap-2">
                {usuario.activo ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-lg font-bold text-green-700">Activo</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-lg font-bold text-red-700">Inactivo</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider mb-2">
                Rol
              </p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                usuario.rol === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {usuario.rol === 'admin' ? 'Administrador' : 'Usuario Normal'}
              </span>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                <p className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider mb-2">
                  Correo Electrónico
                </p>
                <p className="text-base md:text-lg font-medium text-gray-900 break-all">{usuario.email}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                <p className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider mb-2">
                  Teléfono
                </p>
                <p className="text-base md:text-lg font-medium text-gray-900">
                  {usuario.telefono ? usuario.telefono : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Área de Trabajo */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Área de Trabajo
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6">
              <p className="text-base md:text-lg font-bold text-blue-900">{usuario.area}</p>
            </div>
          </div>

          {/* Información de Registro */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Información de Registro
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider mb-2">
                Fecha de Creación
              </p>
              <p className="text-base md:text-lg font-medium text-gray-900">
                {new Date(usuario.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 md:px-8 py-4 md:py-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm md:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
