'use client';

import { useRef, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SignaturePadProps {
  onChange: (signature: string) => void;
  value?: string;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;

export default function SignaturePad({ onChange, value }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Obtener el DPI del dispositivo para mejor resolución
    const dpiValue = window.devicePixelRatio || 1;

    // Establecer tamaño del canvas con DPI
    canvas.width = CANVAS_WIDTH * dpiValue;
    canvas.height = CANVAS_HEIGHT * dpiValue;

    // Escalar el contexto según DPI
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpiValue, dpiValue);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1F2937';

      // Fondo blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Si hay una firma guardada, mostrarla
    if (value && ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Solo prevenir comportamiento por defecto en mouse events
    // Los touch events son listeners pasivos y no permiten preventDefault()
    if (!('touches' in e)) {
      e.preventDefault();
    }
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    let x, y;

    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      x = (touch.clientX - rect.left) / (rect.width / CANVAS_WIDTH);
      y = (touch.clientY - rect.top) / (rect.height / CANVAS_HEIGHT);
    } else if ('clientX' in e) {
      const rect = canvas.getBoundingClientRect();
      x = (e.clientX - rect.left) / (rect.width / CANVAS_WIDTH);
      y = (e.clientY - rect.top) / (rect.height / CANVAS_HEIGHT);
    } else {
      return;
    }

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (isDrawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL('image/png');
    onChange(signature);
  };

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full border-2 border-indigo-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full bg-white cursor-crosshair block"
          style={{
            touchAction: 'none',
            height: `${CANVAS_HEIGHT}px`,
            maxWidth: '100%',
            display: 'block',
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <button
          type="button"
          onClick={saveSignature}
          disabled={!hasSignature}
          className={`flex-1 px-4 py-3 sm:py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
            hasSignature
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Guardar Firma
        </button>
        <button
          type="button"
          onClick={clearSignature}
          className="px-4 py-3 sm:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Limpiar</span>
        </button>
      </div>

      {value && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">✓ Firma guardada</p>
        </div>
      )}
    </div>
  );
}
