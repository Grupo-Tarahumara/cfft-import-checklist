'use client';

import React, { useMemo, useState } from 'react';

interface TruckPalletSelectorProps {
  totalPallets: number;
  termografoOrigenSelected?: number;
  termografoNacionalSelected?: number;
  onSelectTermografoOrigen: (paletNumber: number) => void;
  onSelectTermografoNacional: (paletNumber: number) => void;
}

export default function TruckPalletSelector({
  totalPallets,
  termografoOrigenSelected,
  termografoNacionalSelected,
  onSelectTermografoOrigen,
  onSelectTermografoNacional,
}: TruckPalletSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<'origen' | 'nacional' | null>(null);

  // Crear layout del camión con DOS FILAS
  const maxPalletsPerRow = Math.ceil(totalPallets / 2);

  const palletLayout = useMemo(() => {
    const pallets: number[] = Array.from({ length: totalPallets }, (_, i) => i + 1);

    // Dividir en dos filas
    const fila1 = pallets.slice(0, maxPalletsPerRow).reverse(); // Fila superior, orden inverso
    const fila2 = pallets.slice(maxPalletsPerRow).reverse(); // Fila inferior, orden inverso

    return [fila1, fila2];
  }, [totalPallets, maxPalletsPerRow]);

  const handlePaletClick = (paletNumber: number) => {
    if (selectionMode === 'origen') {
      onSelectTermografoOrigen(paletNumber);
      setSelectionMode(null);
    } else if (selectionMode === 'nacional') {
      onSelectTermografoNacional(paletNumber);
      setSelectionMode(null);
    }
  };

  const getPaletStyles = (paletNumber: number) => {
    const isOrigenSelected = termografoOrigenSelected === paletNumber;
    const isNacionalSelected = termografoNacionalSelected === paletNumber;

    if (isOrigenSelected && isNacionalSelected) {
      // Ambos en el mismo palet - mostrar dividido
      return {
        background: 'linear-gradient(135deg, rgb(59, 130, 246) 50%, rgb(217, 119, 6) 50%)',
        borderColor: 'rgb(37, 99, 235)',
        textColor: 'text-white',
      };
    } else if (isOrigenSelected) {
      return {
        background: 'rgb(59, 130, 246)',
        borderColor: 'rgb(37, 99, 235)',
        textColor: 'text-white font-bold',
      };
    } else if (isNacionalSelected) {
      return {
        background: 'rgb(217, 119, 6)',
        borderColor: 'rgb(180, 83, 9)',
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
          onClick={() => setSelectionMode(selectionMode === 'origen' ? null : 'origen')}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            selectionMode === 'origen'
              ? 'bg-blue-500 text-white ring-2 ring-blue-300'
              : termografoOrigenSelected
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {termografoOrigenSelected ? (
            <>
              ✓ Origen: Palet {termografoOrigenSelected}
            </>
          ) : (
            'Seleccionar Origen'
          )}
        </button>

        <button
          onClick={() => setSelectionMode(selectionMode === 'nacional' ? null : 'nacional')}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            selectionMode === 'nacional'
              ? 'bg-amber-500 text-white ring-2 ring-amber-300'
              : termografoNacionalSelected
              ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {termografoNacionalSelected ? (
            <>
              ✓ Nacional: Palet {termografoNacionalSelected}
            </>
          ) : (
            'Seleccionar Nacional'
          )}
        </button>
      </div>

      {/* Selector de Pallets */}
      <div className="relative bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
        {/* Etiqueta PUERTAS */}
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center text-xs font-bold text-gray-700 whitespace-nowrap px-2">
          PUERTAS
        </div>

        {/* Fila Superior */}
        <div className="mb-4">
          <div className="flex gap-2 justify-start flex-wrap">
            {palletLayout[0].map((paletNumber) => {
              const styles = getPaletStyles(paletNumber);
              return (
                <button
                  key={paletNumber}
                  onClick={() => handlePaletClick(paletNumber)}
                  disabled={!selectionMode}
                  className={`
                    w-16 h-16 flex items-center justify-center rounded-md border-3 transition-all
                    font-bold text-base shadow-md
                    ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'}
                    ${styles.textColor}
                  `}
                  style={{
                    backgroundColor: styles.background,
                    borderColor: styles.borderColor,
                  }}
                  title={`Palet ${paletNumber}`}
                >
                  {paletNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Separador visual entre filas */}
        <div className="h-1 bg-gray-300 rounded my-3"></div>

        {/* Fila Inferior */}
        {palletLayout[1].length > 0 && (
          <div>
            <div className="flex gap-2 justify-start flex-wrap">
              {palletLayout[1].map((paletNumber) => {
                const styles = getPaletStyles(paletNumber);
                return (
                  <button
                    key={paletNumber}
                    onClick={() => handlePaletClick(paletNumber)}
                    disabled={!selectionMode}
                    className={`
                      w-16 h-16 flex items-center justify-center rounded-md border-3 transition-all
                      font-bold text-base shadow-md
                      ${!selectionMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'}
                      ${styles.textColor}
                    `}
                    style={{
                      backgroundColor: styles.background,
                      borderColor: styles.borderColor,
                    }}
                    title={`Palet ${paletNumber}`}
                  >
                    {paletNumber}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de estado */}
      <div className="mt-6 p-3 bg-white rounded-lg border border-gray-300 text-center">
        {selectionMode ? (
          <span className="text-sm font-semibold text-gray-700">
            {selectionMode === 'origen' ? '🔵 Haz clic en el palet para Termógrafo de Origen' : '🟠 Haz clic en el palet para Termógrafo Nacional'}
          </span>
        ) : (
          <span className="text-sm text-gray-600">
            Selecciona el tipo de termógrafo para ubicarlo
          </span>
        )}
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 flex gap-6 justify-center text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Termógrafo Origen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-gray-700">Termógrafo Nacional</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-amber-500 rounded"></div>
          <span className="text-gray-700">Ambos</span>
        </div>
      </div>
    </div>
  );
}
