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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{imageTitle}</h2>
              <p className="text-xs text-blue-100">Vista completa de la imagen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Image Container con efecto */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 overflow-auto relative min-h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 font-medium">Cargando imagen...</p>
              </div>
            </div>
          )}

          {/* Using regular img tag for external URLs loaded dynamically */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-lg p-4"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Footer Premium */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">
              Haz click en el icono X o fuera de la ventana para cerrar
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 font-medium hover:shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Cerrar al hacer click fuera */}
      <div
        className="absolute inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        role="presentation"
      />
    </div>
  );
}
