import { useCallback } from 'react';
import html2pdf from 'html2pdf.js';

interface HoleritePDFOptions {
  filename?: string;
  margin?: number;
  image?: { type: string; quality: number };
  html2canvas?: { scale: number };
  jsPDF?: { orientation: string; unit: string; format: string };
}

/**
 * Hook para gerar e baixar holerite em PDF
 */
export const useHoleritePDF = () => {
  const gerarPDF = useCallback(
    (htmlContent: string, funcionarioNome: string, periodo: string, options?: HoleritePDFOptions) => {
      try {
        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        const opt = {
          margin: options?.margin || 10,
          filename: options?.filename || `Holerite_${funcionarioNome}_${periodo}.pdf`,
          image: options?.image || { type: 'jpeg', quality: 0.98 },
          html2canvas: options?.html2canvas || { scale: 2 },
          jsPDF: options?.jsPDF || { orientation: 'portrait', unit: 'mm', format: 'a4' },
        };

        html2pdf().set(opt).from(element).save();

        return { success: true, message: 'PDF gerado com sucesso' };
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return { success: false, message: 'Erro ao gerar PDF' };
      }
    },
    []
  );

  const gerarPDFComDados = useCallback(
    (
      htmlContent: string,
      funcionarioNome: string,
      mesReferencia: number,
      anoReferencia: number,
      options?: HoleritePDFOptions
    ) => {
      const meses = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];
      const mesNome = meses[mesReferencia - 1];
      const periodo = `${mesNome}_${anoReferencia}`;

      return gerarPDF(htmlContent, funcionarioNome, periodo, options);
    },
    [gerarPDF]
  );

  return { gerarPDF, gerarPDFComDados };
};
