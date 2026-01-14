import { PDFDocument, PDFPage, rgb, PDFImage } from 'pdf-lib';

interface DadosGrafico {
  titulo: string;
  dataGeracao: Date;
  totalRotas: number;
  totalEconomia: number;
  totalCombustivel: number;
  mediaEconomiaPercentual: number;
  rotas: Array<{
    data: string;
    nome: string;
    distanciaOriginal: number;
    distanciaOtimizada: number;
    economia: number;
    percentualEconomia: number;
    algoritmo: string;
    combustivelEconomizado: number;
  }>;
}

/**
 * Gerar PDF com gráficos de economia
 */
export async function gerarPDFComGraficos(dados: DadosGrafico): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = currentPage.getSize();

  let yPosition = height - 40;

  // ===== PÁGINA 1: CAPA =====
  
  // Cabeçalho
  currentPage.drawText('MARTINS VIAGENS E TURISMO', {
    x: 50,
    y: yPosition,
    size: 24,
    color: rgb(1, 0.42, 0.21) // Laranja Martins
  });

  yPosition -= 30;
  currentPage.drawText('Relatório de Otimização de Rotas', {
    x: 50,
    y: yPosition,
    size: 16,
    color: rgb(0, 0, 0)
  });

  yPosition -= 20;
  currentPage.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 2,
    color: rgb(1, 0.42, 0.21)
  });

  // Informações gerais
  yPosition -= 40;
  currentPage.drawText(`Data de Geração: ${dados.dataGeracao.toLocaleDateString('pt-BR')}`, {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0.4, 0.4, 0.4)
  });

  yPosition -= 25;
  currentPage.drawText(`Período Analisado: ${dados.rotas.length} rotas`, {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0.4, 0.4, 0.4)
  });

  // Estatísticas principais (grande)
  yPosition -= 50;
  currentPage.drawText('RESUMO EXECUTIVO', {
    x: 50,
    y: yPosition,
    size: 14,
    color: rgb(1, 0.42, 0.21)
  });

  yPosition -= 30;

  // Caixa 1: Total de Rotas
  drawCaixaEstatistica(currentPage, 50, yPosition - 50, 120, 50, {
    titulo: 'Total de Rotas',
    valor: dados.totalRotas.toString(),
    cor: rgb(1, 0.42, 0.21)
  });

  // Caixa 2: Economia Total
  drawCaixaEstatistica(currentPage, 180, yPosition - 50, 120, 50, {
    titulo: 'Economia Total',
    valor: `${dados.totalEconomia.toFixed(1)} km`,
    cor: rgb(0.11, 0.62, 0.47)
  });

  // Caixa 3: Combustível
  drawCaixaEstatistica(currentPage, 310, yPosition - 50, 120, 50, {
    titulo: 'Combustível Economizado',
    valor: `${dados.totalCombustivel.toFixed(1)} L`,
    cor: rgb(0, 0.31, 0.54)
  });

  // Caixa 4: Economia Média
  drawCaixaEstatistica(currentPage, 440, yPosition - 50, 105, 50, {
    titulo: 'Economia Média',
    valor: `${dados.mediaEconomiaPercentual.toFixed(1)}%`,
    cor: rgb(0.6, 0.2, 0.2)
  });

  // ===== PÁGINA 2: TABELA DE ROTAS =====
  
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = height - 40;

  currentPage.drawText('DETALHES DAS ROTAS', {
    x: 50,
    y: yPosition,
    size: 14,
    color: rgb(1, 0.42, 0.21)
  });

  yPosition -= 25;

  // Cabeçalho da tabela
  const colWidths = [60, 80, 60, 60, 60, 60, 55];
  const headers = ['Data', 'Rota', 'Algoritmo', 'Original', 'Otimizada', 'Economia', 'Combustível'];
  let xPosition = 50;

  currentPage.drawRectangle({
    x: 50,
    y: yPosition - 15,
    width: width - 100,
    height: 15,
    color: rgb(1, 0.42, 0.21)
  });

  for (let i = 0; i < headers.length; i++) {
    currentPage.drawText(headers[i], {
      x: xPosition,
      y: yPosition - 12,
      size: 8,
      color: rgb(1, 1, 1)
    });
    xPosition += colWidths[i];
  }

  yPosition -= 25;

  // Linhas da tabela
  for (let i = 0; i < dados.rotas.length; i++) {
    const rota = dados.rotas[i];

    if (yPosition < 50) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }

    xPosition = 50;
    const linhas = [
      new Date(rota.data).toLocaleDateString('pt-BR'),
      rota.nome.substring(0, 10),
      rota.algoritmo.substring(0, 10),
      `${rota.distanciaOriginal.toFixed(1)}`,
      `${rota.distanciaOtimizada.toFixed(1)}`,
      `${rota.economia.toFixed(1)}`,
      `${rota.combustivelEconomizado.toFixed(2)}`
    ];

    // Alternância de cores
    if (i % 2 === 0) {
      currentPage.drawRectangle({
        x: 50,
        y: yPosition - 12,
        width: width - 100,
        height: 12,
        color: rgb(0.95, 0.95, 0.95)
      });
    }

    for (let j = 0; j < linhas.length; j++) {
      currentPage.drawText(linhas[j], {
        x: xPosition,
        y: yPosition - 10,
        size: 8,
        color: rgb(0, 0, 0)
      });
      xPosition += colWidths[j];
    }

    yPosition -= 15;
  }

  // ===== PÁGINA 3: ANÁLISE =====
  
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = height - 40;

  currentPage.drawText('ANÁLISE E RECOMENDAÇÕES', {
    x: 50,
    y: yPosition,
    size: 14,
    color: rgb(1, 0.42, 0.21)
  });

  yPosition -= 30;

  // Análise por algoritmo
  const algoritmosSet = new Set(dados.rotas.map(r => r.algoritmo))];
  
  currentPage.drawText('Desempenho por Algoritmo:', {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0, 0, 0)
  });

  yPosition -= 20;

  for (let i = 0; i < algoritmos.length; i++) {
    const alg = algoritmos[i]; {
    const rotasAlgo = dados.rotas.filter(r => r.algoritmo === alg);
    const mediaEconomia = rotasAlgo.reduce((sum, r) => sum + r.economia, 0) / rotasAlgo.length;
    const mediaPercentual = rotasAlgo.reduce((sum, r) => sum + r.percentualEconomia, 0) / rotasAlgo.length;

    currentPage.drawText(
      `• ${alg}: ${mediaPercentual.toFixed(1)}% de economia média (${mediaEconomia.toFixed(2)} km)`,
      {
        x: 70,
        y: yPosition,
        size: 10,
        color: rgb(0.2, 0.2, 0.2)
      }
    );

    yPosition -= 15;
  }

  // Recomendações
  yPosition -= 15;
  currentPage.drawText('Recomendações:', {
    x: 50,
    y: yPosition,
    size: 11,
    color: rgb(0, 0, 0)
  });

  yPosition -= 20;

  const recomendacoes = [
    `1. Economia Total: ${dados.totalEconomia.toFixed(1)} km em ${dados.totalRotas} rotas`,
    `2. Combustível Economizado: ${dados.totalCombustivel.toFixed(1)} litros`,
    `3. Economia Média por Rota: ${(dados.totalEconomia / dados.totalRotas).toFixed(2)} km`,
    `4. Algoritmo Mais Eficiente: ${algoritmos[0]} com ${dados.mediaEconomiaPercentual.toFixed(1)}% de economia`,
    `5. Impacto Ambiental: Redução de ${(dados.totalCombustivel * 2.3).toFixed(1)} kg de CO₂`
  ];

  for (const rec of recomendacoes) {
    if (yPosition < 50) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }

    currentPage.drawText(rec, {
      x: 70,
      y: yPosition,
      size: 9,
      color: rgb(0.3, 0.3, 0.3)
    });

    yPosition -= 15;
  }

  // Rodapé
  currentPage.drawText('Gerado pelo Sistema Martins - Roteirização Inteligente', {
    x: 50,
    y: 20,
    size: 8,
    color: rgb(0.6, 0.6, 0.6)
  });

  // Salvar PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Desenhar caixa de estatística
 */
function drawCaixaEstatistica(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  dados: { titulo: string; valor: string; cor: any }
) {
  // Fundo
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: dados.cor,
    borderWidth: 2
  });

  // Título
  page.drawText(dados.titulo, {
    x: x + 10,
    y: y + height - 20,
    size: 9,
    color: dados.cor
  });

  // Valor
  page.drawText(dados.valor, {
    x: x + 10,
    y: y + 5,
    size: 14,
    color: dados.cor
  });
}

/**
 * Gerar CSV com dados
 */
export function gerarCSVComGraficos(dados: DadosGrafico): string {
  const linhas: string[] = [];

  linhas.push('MARTINS VIAGENS E TURISMO - Relatório de Otimização de Rotas');
  linhas.push(`Data: ${dados.dataGeracao.toLocaleDateString('pt-BR')}`);
  linhas.push('');

  linhas.push('RESUMO EXECUTIVO');
  linhas.push(`Total de Rotas,${dados.totalRotas}`);
  linhas.push(`Economia Total (km),${dados.totalEconomia.toFixed(2)}`);
  linhas.push(`Combustível Economizado (L),${dados.totalCombustivel.toFixed(2)}`);
  linhas.push(`Economia Média (%),${dados.mediaEconomiaPercentual.toFixed(1)}`);
  linhas.push('');

  linhas.push('DETALHES DAS ROTAS');
  linhas.push('Data,Rota,Algoritmo,Distância Original (km),Distância Otimizada (km),Economia (km),Percentual (%),Combustível Economizado (L)');

  for (const rota of dados.rotas) {
    linhas.push(
      `${rota.data},"${rota.nome}","${rota.algoritmo}",${rota.distanciaOriginal.toFixed(2)},${rota.distanciaOtimizada.toFixed(2)},${rota.economia.toFixed(2)},${rota.percentualEconomia.toFixed(1)},${rota.combustivelEconomizado.toFixed(2)}`
    );
  }

  return linhas.join('\n');
}
