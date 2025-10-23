import jsPDF from 'jspdf';
import { Inspeccion } from '@/types';

interface PDFOptions {
  hideTemperatureRanges?: boolean;
  hideAlerts?: boolean;
}

/**
 * Genera un PDF profesional con toda la información de la inspección
 */
export async function generateInspectionPDF(
  inspeccion: Inspeccion,
  options?: PDFOptions
): Promise<void> {
  try {
    console.log('Generando PDF para inspección:', inspeccion.id);

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

    // Configurar colores
    const primaryColor = [41, 128, 185];
    const lightBg = [240, 240, 240];
    const darkText = [51, 51, 51];
    const redColor = [231, 76, 60];
    const greenColor = [39, 174, 96];

    // Función para agregar nueva página
    const checkNewPage = (neededSpace: number = 40) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // ========== HEADER ==========
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('INFORME DE INSPECCIÓN', margin, 15);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reporte de Control de Calidad', margin, 22);

    // Información del contenedor
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Contenedor: ${inspeccion.numeroOrdenContenedor}`, pageWidth - 80, 15);
    pdf.text(`Fecha: ${new Date(inspeccion.fecha).toLocaleDateString('es-ES')}`, pageWidth - 80, 22);

    yPosition = 40;
    pdf.setTextColor(darkText[0], darkText[1], darkText[2]);

    // ========== INFORMACIÓN GENERAL ==========
    const addSectionTitle = (title: string) => {
      checkNewPage(15);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text(title, margin, yPosition);
      yPosition += 7;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      yPosition += 3;
    };

    const addField = (label: string, value: any) => {
      checkNewPage(6);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
      pdf.text(`${label}:`, margin + 3, yPosition);

      pdf.setFont('helvetica', 'normal');
      const valueStr = String(value);
      pdf.text(valueStr, margin + 70, yPosition);
      yPosition += 6;
    };

    addSectionTitle('INFORMACIÓN GENERAL');
    addField('Inspector', inspeccion.usuario?.nombre || 'No especificado');
    addField('Área', inspeccion.usuario?.area || 'No especificado');
    addField('Punto de Inspección', inspeccion.puntoInspeccion?.nombre || 'No especificado');
    addField('Estado', inspeccion.estado);
    addField('Fecha Creación', new Date(inspeccion.fechaCreacion).toLocaleString('es-ES'));

    // ========== DATOS DE LA CARGA ==========
    addSectionTitle('DATOS DE LA CARGA');
    addField('Proveedor', inspeccion.proveedor?.nombre || 'No especificado');
    if (inspeccion.proveedor?.codigo) {
      addField('Código Proveedor', inspeccion.proveedor.codigo);
    }
    if (inspeccion.proveedor?.pais) {
      addField('País de Origen', inspeccion.proveedor.pais);
    }
    addField('Tipo de Fruta', inspeccion.fruta?.nombre || 'No especificado');

    if (inspeccion.fruta && !options?.hideTemperatureRanges) {
      addField('Rango Temperatura Optima', `${inspeccion.fruta.tempMinima}°C - ${inspeccion.fruta.tempMaxima}°C`);
    }

    // ========== INVENTARIO ==========
    addSectionTitle('INVENTARIO');
    addField('Pallets', inspeccion.numeroPallets);
    addField('Cajas', inspeccion.numeroCajas);
    addField('Trancas', inspeccion.numeroTrancas);

    // ========== CONTROL DE TEMPERATURA ==========
    addSectionTitle('CONTROL DE TEMPERATURA');

    const tempEnRango = inspeccion.fruta &&
      Number(inspeccion.temperaturaFruta) >= Number(inspeccion.fruta.tempMinima) &&
      Number(inspeccion.temperaturaFruta) <= Number(inspeccion.fruta.tempMaxima);

    addField('Temperatura Fruta', `${inspeccion.temperaturaFruta}°C`);
    addField('Estado Temperatura', tempEnRango ? 'DENTRO DE RANGO' : 'FUERA DE RANGO');

    addField('Termógrafo Origen', inspeccion.termografoOrigen ? `SI (Palet ${inspeccion.paletTermografoOrigen || '-'})` : 'NO');
    addField('Termógrafo Nacional', inspeccion.termografoNacional ? `SI (Palet ${inspeccion.paletTermografoNacional || '-'})` : 'NO');

    // ========== OBSERVACIONES ==========
    if (inspeccion.observaciones) {
      addSectionTitle('OBSERVACIONES');
      checkNewPage(25);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const obsLines = pdf.splitTextToSize(inspeccion.observaciones, contentWidth - 10);
      obsLines.forEach((line: string) => {
        if (yPosition + 5 > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 3;
    }

    // ========== ALERTAS ==========
    if (!options?.hideAlerts && inspeccion.alertas && inspeccion.alertas.length > 0) {
      addSectionTitle(`ALERTAS (${inspeccion.alertas.length})`);

      inspeccion.alertas.forEach((alerta) => {
        checkNewPage(20);

        // Color según criticidad
        const alertColor = alerta.criticidad === 'alta' ? redColor : alerta.criticidad === 'media' ? [243, 156, 18] : greenColor;

        // Header
        pdf.setFillColor(alertColor[0], alertColor[1], alertColor[2]);
        pdf.rect(margin, yPosition - 1, contentWidth, 5, 'F');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${alerta.tipoAlerta.replace(/_/g, ' ').toUpperCase()} [${alerta.criticidad.toUpperCase()}]`, margin + 3, yPosition + 2);

        yPosition += 7;

        // Descripción
        if (alerta.descripcion) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkText[0], darkText[1], darkText[2]);

          const descLines = pdf.splitTextToSize(alerta.descripcion, contentWidth - 10);
          descLines.forEach((line: string) => {
            if (yPosition + 4 > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 5, yPosition);
            yPosition += 4;
          });
        }

        // Metadata
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        const fechaStr = alerta.fechaCreacion ? new Date(alerta.fechaCreacion).toLocaleString('es-ES') : 'N/A';
        pdf.text(`Fecha: ${fechaStr} | Estado: ${alerta.leida ? 'LEIDA' : 'PENDIENTE'}`, margin + 5, yPosition);

        yPosition += 5;
      });
    }

    // ========== GALERÍA DE FOTOS ==========
    if (inspeccion.fotos && inspeccion.fotos.length > 0) {
      addSectionTitle(`GALERIA DE FOTOS (${inspeccion.fotos.length})`);

      for (let i = 0; i < inspeccion.fotos.length; i++) {
        const foto = inspeccion.fotos[i];
        checkNewPage(80);

        // Header foto
        pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        pdf.rect(margin, yPosition - 1, contentWidth, 5, 'F');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text(`FOTO ${i + 1}: ${foto.tipoFoto.replace(/_/g, ' ').toUpperCase()}`, margin + 3, yPosition + 2);

        // Badge
        const badge = foto.esObligatoria ? 'OBLIGATORIA' : 'OPCIONAL';
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        const badgeColor = foto.esObligatoria ? primaryColor : [243, 156, 18];
        pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        pdf.rect(pageWidth - 40, yPosition - 1, 25, 5, 'F');
        pdf.text(badge, pageWidth - 28, yPosition + 2, { align: 'center' });

        yPosition += 7;

        // Descripción
        if (foto.descripcion) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkText[0], darkText[1], darkText[2]);

          const descLines = pdf.splitTextToSize(foto.descripcion, contentWidth - 10);
          descLines.forEach((line: string) => {
            if (yPosition + 4 > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 5, yPosition);
            yPosition += 4;
          });

          yPosition += 2;
        }

        // Imagen
        if (foto.urlFoto) {
          try {
            const imgBase64 = await imageUrlToBase64(foto.urlFoto);

            if (imgBase64) {
              const imgWidth = Math.min(contentWidth - 20, 140);
              const imgHeight = Math.min((imgWidth * 3) / 4, 80);

              checkNewPage(imgHeight + 5);

              // Marco
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.rect(margin + 5, yPosition, imgWidth, imgHeight);

              // Imagen
              pdf.addImage(imgBase64, 'JPEG', margin + 5, yPosition, imgWidth, imgHeight);

              yPosition += imgHeight + 8;
            }
          } catch (imgError) {
            // Imagen no disponible
            pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
            pdf.rect(margin + 5, yPosition, contentWidth - 10, 30, 'F');

            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('[Imagen no disponible]', pageWidth / 2, yPosition + 15, { align: 'center' });

            yPosition += 35;
          }
        }

        yPosition += 3;
      }
    }

    // ========== PIE DE PAGINA ==========
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');

    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(
      `Documento generado el ${new Date().toLocaleString('es-ES')} | Pagina ${pdf.getNumberOfPages()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );

    // Descargar
    const filename = `Inspeccion_${inspeccion.numeroOrdenContenedor}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    console.log('PDF generado exitosamente');

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

/**
 * Convierte una URL de imagen a base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    if (!url) return '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result && result.length > 0) {
            resolve(result);
          } else {
            reject(new Error('Resultado vacío'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (fetchError) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error(`Error convirtiendo imagen: ${url}`, error);
    return '';
  }
}
