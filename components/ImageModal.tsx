'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XMarkIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageTitle: string;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  imageTitle,
  onClose,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando imagen:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded shadow-lg overflow-hidden flex flex-col border border-border/50">
        <div className="bg-muted/50 border-b border-border/50 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <EyeIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-base font-bold text-foreground truncate">{imageTitle}</h2>
              <p className="text-xs text-muted-foreground">Imagen de inspección en tamaño completo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ml-2"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center bg-muted/20 overflow-auto relative min-h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs text-muted-foreground font-medium">Cargando imagen...</p>
              </div>
            </div>
          )}

          <Image
            src={imageUrl}
            alt={imageTitle}
            fill
            className="max-w-full max-h-full w-auto h-auto object-contain p-3 md:p-4"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            unoptimized
          />
        </div>

        <div className="bg-muted/50 border-t border-border/50 px-3 md:px-4 py-2 md:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Presiona Esc o haz clic fuera para cerrar
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors font-semibold text-xs"
            >
              <ArrowDownTrayIcon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded transition-colors font-semibold text-xs border border-border/50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        role="presentation"
      />
    </div>
  );
}
