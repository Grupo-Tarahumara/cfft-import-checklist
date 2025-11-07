'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
     
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-lg shadow-xl overflow-hidden flex flex-col border border-border animate-in fade-in zoom-in-95">
       
        <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <EyeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">{imageTitle}</h2>
              <p className="text-xs text-muted-foreground">Imagen de inspección en tamaño completo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all duration-200 ml-2"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

    
        <div className="flex-1 flex items-center justify-center bg-muted/20 overflow-auto relative min-h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground font-medium">Cargando imagen...</p>
              </div>
            </div>
          )}

         
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full max-h-full w-auto h-auto object-contain p-4 md:p-6"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

       
        <div className="bg-muted/50 border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
            Presiona Esc o haz clic fuera para cerrar
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-md active:scale-95"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 md:px-5 py-2 md:py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all duration-200 font-medium text-sm border border-border"
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
