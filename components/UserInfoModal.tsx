'use client';

import { Usuario } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserInfoModalProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserInfoModal({ usuario, isOpen, onClose }: UserInfoModalProps): React.JSX.Element | null {
  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
      <div className="bg-card rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border/50">
        <div className="bg-primary px-3 md:px-4 py-2 md:py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-foreground">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold text-primary-foreground truncate">{usuario.nombre}</h2>
              <p className="text-xs text-primary-foreground/80 truncate">@{usuario.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 hover:bg-white/20 text-primary-foreground rounded transition-colors ml-2"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 md:p-4 space-y-2 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded p-2 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Estado
              </p>
              <div className="flex items-center gap-1.5">
                {usuario.activo ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-semibold text-primary">Activo</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span className="text-xs font-semibold text-destructive">Inactivo</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded p-2 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Rol
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                usuario.rol === 'admin'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
              </span>
            </div>
          </div>

          <div className="border-t border-border/50 pt-2">
            <h3 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded p-2 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                  Correo
                </p>
                <p className="text-xs font-medium text-foreground break-all">{usuario.email}</p>
              </div>

              <div className="bg-muted/50 rounded p-2 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                  Teléfono
                </p>
                <p className="text-xs font-medium text-foreground">
                  {usuario.telefono ? usuario.telefono : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-2">
            <h3 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Área
            </h3>
            <div className="bg-muted/50 rounded p-2 border border-border/50">
              <p className="text-xs font-medium text-foreground">{usuario.area}</p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-2">
            <h3 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Registro
            </h3>
            <div className="bg-muted/50 rounded p-2 border border-border/50">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Fecha de Creación
              </p>
              <p className="text-xs font-medium text-foreground">
                {new Date(usuario.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 px-3 md:px-4 py-2 flex justify-end gap-2 bg-muted/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors font-semibold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
