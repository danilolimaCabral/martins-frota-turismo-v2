import * as XLSX from 'xlsx';
import { publicProcedure, router } from './_core/trpc';
import { z } from 'zod';

interface PontoRota {
  id: string;
  nome: string;
  endereco: string;
  numero: string;
  cep: string;
  cidade: string;
  horario: string;
  lat?: number;
  lng?: number;
}

/**
 * Geocodificar endereço usando Nominatim API
 */
export async function geocodificarEndereco(endereco: string, cep: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = `${endereco}, ${cep}, Brasil`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Martins-Frota-Turismo/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error(`Geocodificação falhou para: ${endereco}`);
      return null;
    }

    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar:', error);
    return null;
  }
}

/**
 * Importar arquivo Excel e extrair dados
 */
export async function importarExcelRoteirizacao(buffer: Buffer): Promise<PontoRota[]> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados = XLSX.utils.sheet_to_json(worksheet);

    const pontos: PontoRota[] = [];

    for (const row of dados) {
      const ponto: PontoRota = {
        id: String(row['ID'] || row['id'] || Math.random()),
        nome: String(row['Nome'] || row['NOME'] || row['Colaborador'] || ''),
        endereco: String(row['Rua'] || row['Endereço'] || row['ENDERECO'] || ''),
        numero: String(row['Número'] || row['Numero'] || row['numero'] || ''),
        cep: String(row['CEP'] || row['cep'] || '').replace(/\D/g, ''),
        cidade: String(row['Cidade'] || row['CIDADE'] || row['cidade'] || 'Curitiba-PR'),
        horario: String(row['Horário'] || row['Horario'] || row['horario'] || '06:00')
      };

      // Validar dados obrigatórios
      if (!ponto.nome || !ponto.endereco) {
        console.warn(`Ponto inválido ignorado: ${JSON.stringify(ponto)}`);
        continue;
      }

      // Geocodificar
      const coords = await geocodificarEndereco(
        `${ponto.endereco}, ${ponto.numero}`,
        ponto.cep
      );

      if (coords) {
        ponto.lat = coords.lat;
        ponto.lng = coords.lng;
      }

      pontos.push(ponto);
    }

    return pontos;
  } catch (error) {
    console.error('Erro ao importar Excel:', error);
    throw new Error('Falha ao processar arquivo Excel');
  }
}

/**
 * Router para importação de Excel
 */
export const excelImportRouter = router({
  importarArquivo: publicProcedure
    .input(z.object({
      buffer: z.string(), // Base64 encoded
      nomeArquivo: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.buffer, 'base64');
        const pontos = await importarExcelRoteirizacao(buffer);

        return {
          sucesso: true,
          total: pontos.length,
          pontos,
          mensagem: `${pontos.length} pontos importados com sucesso`
        };
      } catch (error) {
        return {
          sucesso: false,
          total: 0,
          pontos: [],
          mensagem: error instanceof Error ? error.message : 'Erro ao importar arquivo'
        };
      }
    })
});
