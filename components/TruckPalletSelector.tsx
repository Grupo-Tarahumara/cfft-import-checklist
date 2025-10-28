'use client';

import React, { useMemo, useState } from 'react';

interface TruckPalletSelectorProps {
  totalPallets: number;
  termografoOrigenSelected?: number[];
  termografoNacionalSelected?: number[];
  termografoOrigenEnabled?: boolean;
  termografoNacionalEnabled?: boolean;
  onSelectTermografoOrigen: (paletNumber: number) => void;
  onSelectTermografoNacional: (paletNumber: number) => void;
}

export default function TruckPalletSelector({
  totalPallets,
  termografoOrigenSelected = [],
  termografoNacionalSelected = [],
  termografoOrigenEnabled = false,
  termografoNacionalEnabled = false,
  onSelectTermografoOrigen,
  onSelectTermografoNacional,
}: TruckPalletSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<'origen' | 'nacional' | null>(null);
  const [isVertical, setIsVertical] = useState(false);

  // Detectar tamaño de pantalla
  React.useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth < 768); // md breakpoint
    };

    handleResize(); // Llamar al montaje
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Crear layout del camión
  const palletLayout = useMemo(() => {
    const pallets: number[] = Array.from({ length: totalPallets }, (_, i) => i + 1);

    if (isVertical) {
      // Para vista vertical: DOS COLUMNAS
      // Conteo DESDE ABAJO (cabina): 1, 3, 5, 7... (derecha) y 2, 4, 6, 8... (izquierda)
      const columnaDerechaCabina: number[] = [];
      const columnaIzquierda: number[] = [];

      pallets.forEach((palet, index) => {
        if (index % 2 === 0) {
          columnaDerechaCabina.push(palet);
        } else {
          columnaIzquierda.push(palet);
        }
      });

      // Invertir para que el 1 esté abajo (cerca de la cabina)
      return [columnaDerechaCabina.reverse(), columnaIzquierda.reverse()];
    }

    // Para vista horizontal: intercalar pallets entre dos filas
    const fila1: number[] = [];
    const fila2: number[] = [];

    pallets.forEach((palet, index) => {
      if (index % 2 === 0) {
        fila1.push(palet);
      } else {
        fila2.push(palet);
      }
    });

    // Si hay número impar de pallets, agregar espacio vacío al final de fila2
    if (totalPallets % 2 === 1) {
      fila2.push(0); // 0 representa un espacio vacío
    }

    // Invertir orden para que el palet 1 esté al lado del conductor (derecha)
    return [fila1.reverse(), fila2.reverse()];
  }, [totalPallets, isVertical]);

  const handlePaletClick = (paletNumber: number) => {
    if (selectionMode === 'origen' && termografoOrigenEnabled) {
      onSelectTermografoOrigen(paletNumber);
    } else if (selectionMode === 'nacional' && termografoNacionalEnabled) {
      onSelectTermografoNacional(paletNumber);
    }
  };

  const getPaletStyles = (paletNumber: number) => {
    const isOrigenSelected = termografoOrigenSelected.includes(paletNumber);
    const isNacionalSelected = termografoNacionalSelected.includes(paletNumber);

    if (isOrigenSelected && isNacionalSelected) {
      // Ambos en el mismo palet - degradado diagonal azul a rojo
      return {
        background: 'linear-gradient(135deg, #3b82f6 0%, #3b82f6 49%, #ef4444 51%, #ef4444 100%)',
        borderColor: 'rgb(220, 38, 38)',
        textColor: 'text-white font-bold',
      };
    } else if (isOrigenSelected) {
      return {
        background: 'rgb(59, 130, 246)',
        borderColor: 'rgb(37, 99, 235)',
        textColor: 'text-white font-bold',
      };
    } else if (isNacionalSelected) {
      return {
        background: 'rgb(239, 68, 68)',
        borderColor: 'rgb(220, 38, 38)',
        textColor: 'text-white font-bold',
      };
    } else if (selectionMode) {
      return {
        background: 'rgb(209, 213, 219)',
        borderColor: 'rgb(156, 163, 175)',
        textColor: 'text-gray-700',
      };
    } else {
      return {
        background: 'rgb(243, 244, 246)',
        borderColor: 'rgb(209, 213, 219)',
        textColor: 'text-gray-700',
      };
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Selecciona primero el tipo de termógrafo y luego haz clic en su ubicación en el camión
        </p>
      </div>

      {/* Botones de selección de modo */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          type="button"
          onClick={() => termografoOrigenEnabled && setSelectionMode(selectionMode === 'origen' ? null : 'origen')}
          disabled={!termografoOrigenEnabled}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            !termografoOrigenEnabled
              ? 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed opacity-60'
              : selectionMode === 'origen'
              ? 'bg-blue-500 text-white ring-2 ring-blue-300'
              : termografoOrigenSelected.length > 0
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200 cursor-pointer'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 cursor-pointer'
          }`}
        >
          {termografoOrigenSelected.length > 0 ? (
            <>
              ✓ Origen: Palets {termografoOrigenSelected.join(', ')}
            </>
          ) : (
            'Seleccionar Origen'
          )}
        </button>

        <button
          type="button"
          onClick={() => termografoNacionalEnabled && setSelectionMode(selectionMode === 'nacional' ? null : 'nacional')}
          disabled={!termografoNacionalEnabled}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            !termografoNacionalEnabled
              ? 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed opacity-60'
              : selectionMode === 'nacional'
              ? 'bg-red-500 text-white ring-2 ring-red-300'
              : termografoNacionalSelected.length > 0
              ? 'bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200 cursor-pointer'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 cursor-pointer'
          }`}
        >
          {termografoNacionalSelected.length > 0 ? (
            <>
              ✓ Nacional: Palets {termografoNacionalSelected.join(', ')}
            </>
          ) : (
            'Seleccionar Nacional'
          )}
        </button>
      </div>

      {/* Selector de Pallets - Vista del Camión desde arriba */}
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 p-4 rounded-xl border-4 border-gray-400 shadow-xl" style={{ backgroundColor: '#f0f0f0' }}>

        {/* Contenedor con scroll */}
        <div className={isVertical ? '' : (totalPallets > 20 ? 'overflow-x-auto' : '')} style={{ minHeight: isVertical ? 'auto' : '200px' }}>
          {/* VISTA DEL CAMIÓN */}
          {isVertical ? (
            // VISTA VERTICAL - Para teléfonos (DOS COLUMNAS)
            <div className="relative flex flex-col gap-0 w-fit mx-auto">
              {/* Marcas de puertas traseras - HORIZONTAL */}
              <div className="text-xs font-bold text-gray-500 w-full text-center mb-2">
                PUERTAS TRASERAS
              </div>

              {/* CAJA DEL CAMIÓN - DOS COLUMNAS */}
              <div className="relative bg-gradient-to-b from-gray-200 to-gray-150 border-4 border-gray-600 rounded-t-lg p-3 shadow-md flex gap-2">

                {/* Columna Izquierda - Pallets impares (2, 4, 6...) */}
                <div className="flex flex-col gap-1">
                  {palletLayout[1].map((paletNumber, index) => {
                    if (paletNumber === 0) {
                      return (
                        <div key={`empty-${index}`} className="w-14 h-14 flex-shrink-0" />
                      );
                    }

                    const styles = getPaletStyles(paletNumber);

                    return (
                      <div key={paletNumber} className="relative">
                        <button
                          type="button"
                          onClick={() => handlePaletClick(paletNumber)}
                          disabled={!selectionMode}
                          className={`
                            w-14 h-14 flex items-center justify-center rounded-md border-3 transition-all
                            font-bold text-xs shadow-md flex-shrink-0
                            ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}
                            ${styles.textColor}
                          `}
                          style={{
                            background: styles.background,
                            borderColor: styles.borderColor,
                            boxShadow: (styles as any).boxShadow || '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          title={`Palet ${paletNumber}`}
                        >
                          {paletNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Divisor vertical entre columnas */}
                <div className="w-1 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 rounded"></div>

                {/* Columna Derecha (CABINA) - Pallets pares (1, 3, 5...) + CABINA */}
                <div className="flex flex-col gap-1">
                  {palletLayout[0].map((paletNumber, index) => {
                    if (paletNumber === 0) {
                      return (
                        <div key={`empty-${index}`} className="w-14 h-14 flex-shrink-0" />
                      );
                    }

                    const styles = getPaletStyles(paletNumber);

                    return (
                      <div key={paletNumber} className="relative">
                        <button
                          type="button"
                          onClick={() => handlePaletClick(paletNumber)}
                          disabled={!selectionMode}
                          className={`
                            w-14 h-14 flex items-center justify-center rounded-md border-3 transition-all
                            font-bold text-xs shadow-md flex-shrink-0
                            ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}
                            ${styles.textColor}
                          `}
                          style={{
                            background: styles.background,
                            borderColor: styles.borderColor,
                            boxShadow: (styles as any).boxShadow || '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          title={`Palet ${paletNumber}`}
                        >
                          {paletNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divisor horizontal */}
              <div className="h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 rounded"></div>

              {/* CABINA DEL CAMIÓN - VERTICAL */}
              <div className="flex flex-col items-center justify-center p-3 border-b-4 border-gray-600">
                <div className="text-xs font-bold text-gray-700 mb-2 tracking-widest">CABINA</div>
                <div className="relative w-20 h-12 bg-gradient-to-b from-gray-600 to-gray-700 border-3 border-gray-800 shadow-lg rounded-b-2xl flex items-center justify-center">
                  <div className="text-white text-xs font-bold opacity-70 text-center px-1">CONDUCTOR</div>
                </div>
              </div>
            </div>
          ) : (
            // VISTA HORIZONTAL - Para escritorio
            <div className="relative flex gap-0 w-fit" style={{ margin: '0 auto' }}>

          {/* CAJA DEL CAMIÓN - CONTENEDOR - LADO IZQUIERDO */}
          <div className="relative bg-gradient-to-r from-gray-200 to-gray-150 border-4 border-gray-600 rounded-l-lg p-3 shadow-md">

            {/* Marcas de puertas traseras - VERTICAL */}
            <div className="absolute left-0 top-1/2 transform -translate-x-16 -translate-y-1/2 text-xs font-bold text-gray-500" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              PUERTAS TRASERAS
            </div>

            {/* Grid de Pallets - Distribuidos horizontalmente */}
            <div className="flex flex-col gap-2">
              {/* Fila Superior de Pallets */}
              <div className="flex gap-1 justify-start flex-nowrap">
                {palletLayout[0].map((paletNumber, index) => {
                  // Si paletNumber es 0, es un espacio vacío
                  if (paletNumber === 0) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="w-14 h-14 flex-shrink-0"
                      />
                    );
                  }

                  const styles = getPaletStyles(paletNumber);

                  return (
                    <div key={paletNumber} className="relative">
                      <button
                        type="button"
                        onClick={() => handlePaletClick(paletNumber)}
                        disabled={!selectionMode}
                        className={`
                          w-14 h-14 flex items-center justify-center rounded-md border-3 transition-all
                          font-bold text-xs shadow-md flex-shrink-0
                          ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}
                          ${styles.textColor}
                        `}
                        style={{
                          background: styles.background,
                          borderColor: styles.borderColor,
                          boxShadow: (styles as any).boxShadow || '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                        title={`Palet ${paletNumber}`}
                      >
                        {paletNumber}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Divisor central del camión */}
              <div className="w-full h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 rounded"></div>

              {/* Fila Inferior de Pallets */}
              {palletLayout[1].length > 0 && (
                <div className="flex gap-1 justify-start flex-nowrap">
                  {palletLayout[1].map((paletNumber, index) => {
                    // Si paletNumber es 0, es un espacio vacío
                    if (paletNumber === 0) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="w-14 h-14 flex-shrink-0"
                        />
                      );
                    }

                    const styles = getPaletStyles(paletNumber);

                    return (
                      <div key={paletNumber} className="relative">
                        <button
                          type="button"
                          onClick={() => handlePaletClick(paletNumber)}
                          disabled={!selectionMode}
                          className={`
                            w-14 h-14 flex items-center justify-center rounded-md border-3 transition-all
                            font-bold text-xs shadow-md flex-shrink-0
                            ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}
                            ${styles.textColor}
                          `}
                          style={{
                            background: styles.background,
                            borderColor: styles.borderColor,
                            boxShadow: (styles as any).boxShadow || '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          title={`Palet ${paletNumber}`}
                        >
                          {paletNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

              {/* CABINA DEL CAMIÓN - LADO DERECHO */}
              <div className="flex flex-col items-center justify-center pl-3 border-l-4 border-gray-400">
                <div className="text-xs font-bold text-gray-700 mb-1 tracking-widest whitespace-nowrap">CABINA</div>
                {/* Cabina - forma trapecio realista (mirando a la derecha) */}
                <div className="relative w-16 h-24 bg-gradient-to-l from-gray-600 to-gray-700 border-3 border-gray-800 shadow-lg rounded-r-2xl flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 15%, 100% 85%, 0% 100%)'
                  }}>
                  <div className="text-white text-xs font-bold opacity-70 text-center px-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>CONDUCTOR</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-gray-600 font-semibold">
          VISTA SUPERIOR DEL CAMIÓN ({isVertical ? 'Vertical' : 'Horizontal'})
        </div>
      </div>

      

      {/* Leyenda de colores */}
      <div className="mt-4 flex gap-6 justify-center text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Termógrafo Origen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Termógrafo Nacional</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #3b82f6 49%, #ef4444 51%)' }}></div>
          <span className="text-gray-700">Ambos</span>
        </div>
      </div>
    </div>
  );
}
