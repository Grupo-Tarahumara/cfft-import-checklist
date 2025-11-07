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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in fade-in zoom-in-95">
        
        <div className="bg-gradient-to-r from-primary to-primary/80 px-5 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-primary-foreground truncate">{usuario.nombre}</h2>
              <p className="text-xs text-primary-foreground/80 truncate">@{usuario.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-white/20 text-primary-foreground rounded-lg transition-all duration-200 ml-2"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        
        <div className="p-4 md:p-5 space-y-3 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">
                Estado
              </p>
              <div className="flex items-center gap-2">
                {usuario.activo ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-green-700">Activo</span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-sm font-semibold text-red-700">Inactivo</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">
                Rol
              </p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${
                usuario.rol === 'admin'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">
                  Correo
                </p>
                <p className="text-xs md:text-sm font-medium text-foreground break-all">{usuario.email}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">
                  Teléfono
                </p>
                <p className="text-xs md:text-sm font-medium text-foreground">
                  {usuario.telefono ? usuario.telefono : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Área
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs md:text-sm font-medium text-foreground">{usuario.area}</p>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Registro
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">
                Fecha de Creación
              </p>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {new Date(usuario.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 md:px-6 py-3 flex justify-end gap-2 bg-muted/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 font-medium text-sm border border-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
