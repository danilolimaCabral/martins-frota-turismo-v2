import { PDFDocument, rgb } from 'pdf-lib';

interface PontoRota {
  id: string;
  nome: string;
  endereco: string;
  cep: string;
  horario: string;
  lat: number;
  lng: number;
}

interface DadosRelatorio {
  titulo: string;
  dataGeracao: Date;
  totalPontos: number;
  distanciaSequencial: number;
  distanciaOtimizada: number;
  economia: number;
  percentualEconomia: number;
  pontos: PontoRota[];
  rota: number[];
  consumoMedio: number; // km/litro
}

/**
 * Gerar PDF com relatório de roteirização
 */
export async function gerarPDFRoteirizacao(dados: DadosRelatorio): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = currentPage.getSize();

  let yPosition = height - 40;

  // Cabeçalho
  currentPage.drawText('MARTINS VIAGENS E TURISMO', {
    x: 50,
    y: yPosition,
    size: 24,
    color: rgb(1, 0.42, 0.21) // Laranja Martins
  });

  yPosition -= 30;
  currentPage.drawText('Relatório de Otimização de Roteirização', {
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
  yPosition -= 25;
  currentPage.drawText(`Data de Geração: ${dados.dataGeracao.toLocaleDateString('pt-BR')}`, {
    x: 50,
    y: yPosition,
    size: 10,
    color: rgb(0.4, 0.4, 0.4)
  });

  yPosition -= 20;
  currentPage.drawText(`Total de Pontos: ${dados.totalPontos}`, {
    x: 50,
    y: yPosition,
    size: 10,
    color: rgb(0.4, 0.4, 0.4)
  });

  // Seção de estatísticas
  yPosition -= 30;
  currentPage.drawText('ESTATÍSTICAS DE ROTA', {
    x: 50,
    y: yPosition,
    size: 14,
    color: rgb(1, 0.42, 0.21)
  });

  yPosition -= 20;
  const stats = [
    `Distância Sequencial: ${dados.distanciaSequencial.toFixed(2)} km`,
    `Distância Otimizada: ${dados.distanciaOtimizada.toFixed(2)} km`,
    `Economia de Distância: ${dados.economia.toFixed(2)} km (${dados.percentualEconomia.toFixed(1)}%)`,
    `Combustível Economizado: ${(dados.economia / dados.consumoMedio).toFixed(2)} litros`,
    `Consumo Médio: ${dados.consumoMedio} km/litro`
  ];

  for (const stat of stats) {
    currentPage.drawText(stat, {
      x: 60,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0)
    });
    yPosition -= 15;
  }

  // Tabela de pontos
  yPosition -= 15;
  currentPage.drawText('PONTOS DA ROTA OTIMIZADA', {
    x: 50,
    y: yPosition,
    size: 14,
    color: rgb(1, 0.42, 0.21)
  });

  yPosition -= 20;

  // Cabeçalho da tabela
  const colWidths = [30, 120, 150, 70, 60];
  const headers = ['Ordem', 'Colaborador', 'Endereço', 'CEP', 'Horário'];
  let xPosition = 50;

  for (let i = 0; i < headers.length; i++) {
    currentPage.drawText(headers[i], {
      x: xPosition,
      y: yPosition,
      size: 9,
      color: rgb(1, 1, 1)
    });
    xPosition += colWidths[i];
  }

  // Fundo do cabeçalho
  currentPage.drawRectangle({
    x: 50,
    y: yPosition - 3,
    width: width - 100,
    height: 15,
    color: rgb(1, 0.42, 0.21),
    opacity: 0.3
  });

  yPosition -= 20;

  // Linhas da tabela
  for (let i = 0; i < Math.min(dados.rota.length, 15); i++) {
    const indice = dados.rota[i];
    const ponto = dados.pontos[indice];

    xPosition = 50;
    const linhas = [
      String(i + 1),
      ponto.nome.substring(0, 15),
      ponto.endereco.substring(0, 20),
      ponto.cep,
      ponto.horario
    ];

    for (let j = 0; j < linhas.length; j++) {
      currentPage.drawText(linhas[j], {
        x: xPosition,
        y: yPosition,
        size: 8,
        color: rgb(0, 0, 0)
      });
      xPosition += colWidths[j];
    }

    yPosition -= 12;

    // Quebra de página se necessário
    if (yPosition < 50 && i < dados.rota.length - 1) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }
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
 * Gerar CSV com dados de roteirização
 */
export function gerarCSVRoteirizacao(dados: DadosRelatorio): string {
  const linhas: string[] = [];

  // Cabeçalho
  linhas.push('MARTINS VIAGENS E TURISMO - Relatório de Roteirização');
  linhas.push(`Data: ${dados.dataGeracao.toLocaleDateString('pt-BR')}`);
  linhas.push('');

  // Estatísticas
  linhas.push('ESTATÍSTICAS');
  linhas.push(`Total de Pontos,${dados.totalPontos}`);
  linhas.push(`Distância Sequencial (km),${dados.distanciaSequencial.toFixed(2)}`);
  linhas.push(`Distância Otimizada (km),${dados.distanciaOtimizada.toFixed(2)}`);
  linhas.push(`Economia (km),${dados.economia.toFixed(2)}`);
  linhas.push(`Percentual de Economia (%),${dados.percentualEconomia.toFixed(1)}`);
  linhas.push(`Combustível Economizado (litros),${(dados.economia / dados.consumoMedio).toFixed(2)}`);
  linhas.push('');

  // Tabela de pontos
  linhas.push('PONTOS DA ROTA');
  linhas.push('Ordem,Colaborador,Endereço,CEP,Cidade,Horário,Latitude,Longitude');

  for (let i = 0; i < dados.rota.length; i++) {
    const indice = dados.rota[i];
    const ponto = dados.pontos[indice];
    linhas.push(
      `${i + 1},"${ponto.nome}","${ponto.endereco}","${ponto.cep}","${ponto.endereco}","${ponto.horario}",${ponto.lat},${ponto.lng}`
    );
  }

  return linhas.join('\n');
}
