import jsPDF from 'jspdf';
import { Inspeccion } from '@/types';

interface PDFOptions {
  containerRef?: React.RefObject<HTMLDivElement>;
  hideTemperatureRanges?: boolean; // Para usuarios normales
  hideAlerts?: boolean; // Para usuarios normales - ocultar sección de alertas
}

/**
 * Genera un PDF con toda la información de la inspección y las fotos
 * @param inspeccion - Datos de la inspección
 * @param options - Opciones para la generación del PDF
 */
export async function generateInspectionPDF(
  inspeccion: Inspeccion,
  options?: PDFOptions
): Promise<void> {
  try {
    // Crear documento PDF en tamaño A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Función auxiliar para agregar línea de separación
    const addSeparator = () => {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    };

    // Función para verificar si necesita nueva página
    const checkNewPage = (neededSpace: number = 50) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Función auxiliar para agregar sección
    const addSection = (title: string) => {
      checkNewPage(15);
      addSeparator();
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, margin, yPosition);
      yPosition += 8;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
    };

    // Función para agregar texto con etiqueta
    const addField = (label: string, value: string, inline: boolean = false) => {
      const labelWidth = 50;
      if (inline) {
        pdf.setFont(undefined, 'bold');
        pdf.text(label + ':', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(value, margin + labelWidth, yPosition);
        yPosition += 6;
      } else {
        pdf.setFont(undefined, 'bold');
        pdf.text(label + ':', margin, yPosition);
        yPosition += 5;
        pdf.setFont(undefined, 'normal');
        const splitText = pdf.splitTextToSize(value, contentWidth - 10);
        splitText.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      }
    };

    // ========== TÍTULO PRINCIPAL ==========
    // Header con fondo (simulado con líneas)
    pdf.setDrawColor(41, 128, 185); // Color azul
    pdf.setFillColor(41, 128, 185);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('REPORTE DE INSPECCIÓN', pageWidth / 2, 18, { align: 'center' });
    pdf.setTextColor(0, 0, 0);

    yPosition = 40;

    // Contenedor y fecha en una línea destacada
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
    pdf.text(`Contenedor: ${inspeccion.numeroOrdenContenedor}`, margin + 5, yPosition);
    pdf.text(
      `Fecha: ${new Date(inspeccion.fecha).toLocaleDateString('es-ES')}`,
      pageWidth - margin - 60,
      yPosition
    );
    yPosition += 12;
    addSeparator();

    // ========== INFORMACIÓN GENERAL ==========
    addSection('INFORMACIÓN GENERAL');
    addField(
      'Fecha de Inspección',
      new Date(inspeccion.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      true
    );
    addField('Estado', inspeccion.estado, true);
    addField(
      'Tiene Alertas',
      inspeccion.tieneAlertas ? 'Sí ⚠️' : 'No ✓',
      true
    );
    addField('Inspector', inspeccion.usuario?.nombre || '-', true);
    if (inspeccion.usuario?.area) {
      addField('Área', inspeccion.usuario.area, true);
    }
    addField('Punto de Inspección', inspeccion.puntoInspeccion?.nombre || '-', true);
    addField(
      'Fecha de Creación',
      new Date(inspeccion.fechaCreacion).toLocaleString('es-ES'),
      true
    );

    // ========== DATOS DE LA CARGA ==========
    addSection('DATOS DE LA CARGA');
    addField('Proveedor', inspeccion.proveedor?.nombre || '-', true);
    if (inspeccion.proveedor?.codigo) {
      addField('Código', inspeccion.proveedor.codigo, true);
    }
    if (inspeccion.proveedor?.pais) {
      addField('País', inspeccion.proveedor.pais, true);
    }
    addField('Fruta', inspeccion.fruta?.nombre || '-', true);
    if (inspeccion.fruta && !options?.hideTemperatureRanges) {
      addField(
        'Rango Óptimo de Temperatura',
        `${inspeccion.fruta.tempMinima}°C - ${inspeccion.fruta.tempMaxima}°C`,
        true
      );
    }

    // ========== CANTIDADES ==========
    addSection('CANTIDADES');
    addField('Pallets', `${inspeccion.numeroPallets}`, true);
    addField('Cajas', `${inspeccion.numeroCajas}`, true);
    addField('Trancas', `${inspeccion.numeroTrancas}`, true);

    // ========== CONTROL DE TEMPERATURA ==========
    addSection('CONTROL DE TEMPERATURA');
    addField(
      'Termógrafo Origen',
      inspeccion.termografoOrigen ? 'Presente ✓' : 'Ausente ✗',
      true
    );
    addField(
      'Termógrafo Nacional',
      inspeccion.termografoNacional ? 'Presente ✓' : 'Ausente ✗',
      true
    );

    // Validar si la temperatura está en rango
    const tempEnRango =
      inspeccion.fruta &&
      Number(inspeccion.temperaturaFruta) >= Number(inspeccion.fruta.tempMinima) &&
      Number(inspeccion.temperaturaFruta) <= Number(inspeccion.fruta.tempMaxima);

    const tempStatus = tempEnRango ? 'En rango ✓' : 'Fuera de rango ⚠️';
    addField('Temperatura de la Fruta', `${inspeccion.temperaturaFruta}°C - ${tempStatus}`, true);

    // ========== OBSERVACIONES ==========
    if (inspeccion.observaciones) {
      addSection('OBSERVACIONES');
      addField('', inspeccion.observaciones, false);
    }

    // ========== ALERTAS ==========
    if (!options?.hideAlerts && inspeccion.alertas && inspeccion.alertas.length > 0) {
      addSection(`ALERTAS (${inspeccion.alertas.length})`);
      inspeccion.alertas.forEach((alerta, index) => {
        checkNewPage(20);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${alerta.tipoAlerta.replace(/_/g, ' ').toUpperCase()}`, margin, yPosition);
        yPosition += 5;
        pdf.setFont(undefined, 'normal');

        addField('Criticidad', alerta.criticidad.toUpperCase());
        addField('Descripción', alerta.descripcion, false);
        addField('Fecha', new Date(alerta.fechaCreacion).toLocaleString('es-ES'), true);
        if (alerta.leida) {
          pdf.setFont(undefined, 'italic');
          pdf.text('(Leída ✓)', margin + 5, yPosition);
          pdf.setFont(undefined, 'normal');
          yPosition += 5;
        }
        yPosition += 3;
      });
    }

    // ========== FOTOS ==========
    if (inspeccion.fotos && inspeccion.fotos.length > 0) {
      addSection(`FOTOS (${inspeccion.fotos.length})`);

      for (let i = 0; i < inspeccion.fotos.length; i++) {
        const foto = inspeccion.fotos[i];
        try {
          // Verificar si necesita nueva página - más espacio para fotos grandes
          checkNewPage(90);

          // Recuadro para la foto
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);

          // Número y título de la foto
          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(11);
          const fotoTitle = foto.tipoFoto.replace(/_/g, ' ').toUpperCase();
          pdf.text(`${i + 1}. ${fotoTitle}`, margin, yPosition);
          yPosition += 6;

          // Descripción
          if (foto.descripcion) {
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            const descSplit = pdf.splitTextToSize(foto.descripcion, contentWidth - 10);
            descSplit.forEach((line: string) => {
              pdf.text(line, margin + 5, yPosition);
              yPosition += 4;
            });
            yPosition += 2;
          }

          // Obligatoria/Opcional
          pdf.setFont(undefined, 'italic');
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(foto.esObligatoria ? '(Foto Obligatoria)' : '(Foto Opcional)', margin + 5, yPosition);
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          yPosition += 4;

          // Cargar imagen
          if (foto.urlFoto) {
            try {
              // Convertir URL a base64
              const imgBase64 = await imageUrlToBase64(foto.urlFoto);

              if (imgBase64) {
                // Tamaño de imagen más adecuado - máximo 170mm de ancho
                const imgWidth = Math.min(contentWidth - 10, 170);
                const imgHeight = Math.min((imgWidth * 3) / 4, 100); // Proporción 4:3 y máximo 100mm

                // Verificar si necesita nueva página para la imagen
                checkNewPage(imgHeight + 15);

                // Dibujar marco alrededor de la imagen
                pdf.setDrawColor(180, 180, 180);
                pdf.setLineWidth(0.5);
                pdf.rect(margin + 5, yPosition, imgWidth, imgHeight);

                // Insertar imagen
                pdf.addImage(imgBase64, 'JPEG', margin + 5, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              } else {
                throw new Error('No se pudo cargar la imagen');
              }
            } catch (imgError) {
              console.warn(`Error cargando imagen ${foto.tipoFoto}:`, imgError);

              // Mostrar placeholder cuando no se puede cargar la imagen
              pdf.setDrawColor(220, 220, 220);
              pdf.setLineWidth(0.5);
              const placeholderHeight = 50;
              pdf.rect(margin + 5, yPosition, contentWidth - 10, placeholderHeight);

              pdf.setFont(undefined, 'italic');
              pdf.setTextColor(150, 150, 150);
              pdf.setFontSize(9);
              pdf.text('[Imagen no disponible - ' + (imgError instanceof Error ? imgError.message : 'Error desconocido') + ']', margin + 10, yPosition + placeholderHeight / 2, {
                align: 'center',
                maxWidth: contentWidth - 20
              });
              pdf.setTextColor(0, 0, 0);

              yPosition += placeholderHeight + 5;
            }
          } else {
            // Sin URL de foto
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.5);
            const placeholderHeight = 50;
            pdf.rect(margin + 5, yPosition, contentWidth - 10, placeholderHeight);

            pdf.setFont(undefined, 'italic');
            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(9);
            pdf.text('[Sin imagen disponible]', margin + 10, yPosition + placeholderHeight / 2, {
              align: 'center',
              maxWidth: contentWidth - 20
            });
            pdf.setTextColor(0, 0, 0);

            yPosition += placeholderHeight + 5;
          }

          yPosition += 5;
        } catch (error) {
          console.error(`Error procesando foto ${foto.tipoFoto}:`, error);
          yPosition += 10; // Espacios para errores
        }
      }
    }

    // ========== PIE DE PÁGINA ==========
    checkNewPage(20);
    addSeparator();
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generado automáticamente el ${new Date().toLocaleString('es-ES')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Descargar
    const filename = `Inspeccion_${inspeccion.numeroOrdenContenedor}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

/**
 * Función para convertir imagen URL a base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Error converting image to base64: ${url}`, error);
    return '';
  }
}

