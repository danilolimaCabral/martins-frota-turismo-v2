/**
 * Serviço de Sincronização com API CTA Smart
 * Sincroniza dados de abastecimentos do CTASmart para o sistema
 */

import { db } from "./db";
import { fuelings, vehicles, drivers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const CTA_SMART_BASE_URL = "https://ctasmart.com.br:8443";
const CTA_SMART_TOKEN = process.env.CTA_SMART_TOKEN || "8Uj0tAO8TJ";

interface CTASmartAbastecimento {
  id: string;
  placa: string;
  data: string;
  km: number;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  tipoCombustivel: string;
  posto: string;
  cidade: string;
  comprovante?: string;
}

interface CTASmartResponse {
  registros: CTASmartAbastecimento[];
  proximoId?: string;
  erro?: string;
}

/**
 * Busca abastecimentos da API CTA Smart
 */
export async function fetchCTASmartAbastecimentos(
  lastId?: string
): Promise<CTASmartResponse> {
  try {
    const url = new URL(
      `${CTA_SMART_BASE_URL}/SvWebSincronizaAbastecimentos`
    );
    url.searchParams.append("token", CTA_SMART_TOKEN);
    if (lastId) {
      url.searchParams.append("id", lastId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CTA Smart API error: ${response.statusText}`);
    }

    const data = (await response.json()) as CTASmartResponse;
    return data;
  } catch (error) {
    console.error("Erro ao buscar abastecimentos do CTA Smart:", error);
    throw error;
  }
}

/**
 * Informa status de processamento ao CTA Smart
 */
export async function informarStatusCTASmart(
  registroId: string,
  status: "sucesso" | "erro" | "duplicado"
): Promise<void> {
  try {
    const url = new URL(
      `${CTA_SMART_BASE_URL}/SvWebInformaAbastecimentos`
    );
    url.searchParams.append("token", CTA_SMART_TOKEN);
    url.searchParams.append("id", registroId);
    url.searchParams.append("status", status);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `CTA Smart API error: ${response.statusText}`
      );
    }

    console.log(
      `Status informado ao CTA Smart - Registro: ${registroId}, Status: ${status}`
    );
  } catch (error) {
    console.error(
      "Erro ao informar status ao CTA Smart:",
      error
    );
    throw error;
  }
}

/**
 * Mapeia tipo de combustível do CTA Smart para o sistema
 */
function mapearTipoCombustivel(
  ctaType: string
): "gasolina" | "etanol" | "diesel" | "gnv" {
  const typeMap: Record<string, "gasolina" | "etanol" | "diesel" | "gnv"> = {
    gasolina: "gasolina",
    etanol: "etanol",
    diesel: "diesel",
    gnv: "gnv",
    "gasolina comum": "gasolina",
    "gasolina aditivada": "gasolina",
    "diesel s10": "diesel",
    "diesel s500": "diesel",
  };

  return typeMap[ctaType.toLowerCase()] || "diesel";
}

/**
 * Sincroniza um abastecimento do CTA Smart
 */
export async function sincronizarAbastecimento(
  abastecimento: CTASmartAbastecimento
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    // Buscar veículo pela placa
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.plate, abastecimento.placa),
    });

    if (!vehicle) {
      console.warn(
        `Veículo com placa ${abastecimento.placa} não encontrado`
      );
      return {
        sucesso: false,
        erro: `Veículo com placa ${abastecimento.placa} não encontrado`,
      };
    }

    // Verificar se abastecimento já existe (evitar duplicatas)
    const existente = await db.query.fuelings.findFirst({
      where: (fuelings) =>
        fuelings.vehicleId === vehicle.id &&
        fuelings.date === new Date(abastecimento.data) &&
        fuelings.km === abastecimento.km,
    });

    if (existente) {
      console.log(
        `Abastecimento duplicado encontrado para veículo ${abastecimento.placa}`
      );
      return { sucesso: true }; // Retorna sucesso para não bloquear sincronização
    }

    // Inserir abastecimento
    await db.insert(fuelings).values({
      vehicleId: vehicle.id,
      date: new Date(abastecimento.data),
      km: abastecimento.km,
      liters: abastecimento.litros,
      pricePerLiter: abastecimento.valorLitro,
      totalCost: abastecimento.valorTotal,
      fuelType: mapearTipoCombustivel(abastecimento.tipoCombustivel),
      station: abastecimento.posto,
      city: abastecimento.cidade,
      receipt: abastecimento.comprovante,
    });

    console.log(
      `Abastecimento sincronizado: Veículo ${abastecimento.placa}, ${abastecimento.litros}L`
    );
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao sincronizar abastecimento:", error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Sincroniza todos os abastecimentos pendentes do CTA Smart
 */
export async function sincronizarTodosAbastecimentos(): Promise<{
  total: number;
  sucesso: number;
  erro: number;
}> {
  let total = 0;
  let sucesso = 0;
  let erro = 0;
  let lastId: string | undefined;
  let continuar = true;

  console.log("Iniciando sincronização de abastecimentos do CTA Smart...");

  while (continuar) {
    try {
      const response = await fetchCTASmartAbastecimentos(lastId);

      if (response.erro) {
        console.error("Erro na resposta do CTA Smart:", response.erro);
        break;
      }

      if (!response.registros || response.registros.length === 0) {
        console.log("Nenhum novo abastecimento para sincronizar");
        break;
      }

      // Processar cada abastecimento
      for (const abastecimento of response.registros) {
        total++;
        const resultado = await sincronizarAbastecimento(abastecimento);

        if (resultado.sucesso) {
          sucesso++;
          await informarStatusCTASmart(abastecimento.id, "sucesso");
        } else {
          erro++;
          await informarStatusCTASmart(abastecimento.id, "erro");
        }
      }

      // Verificar se há mais registros
      if (response.proximoId) {
        lastId = response.proximoId;
      } else {
        continuar = false;
      }

      // Aguardar 60 segundos antes de próxima requisição (limite da API)
      if (continuar) {
        console.log("Aguardando 60 segundos antes da próxima sincronização...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    } catch (error) {
      console.error("Erro durante sincronização:", error);
      continuar = false;
    }
  }

  console.log(
    `Sincronização concluída: Total=${total}, Sucesso=${sucesso}, Erro=${erro}`
  );
  return { total, sucesso, erro };
}

/**
 * Inicia sincronização periódica (a cada 5 minutos)
 */
export function iniciarSincronizacaoPeriodicaCTASmart(): void {
  // Sincronizar imediatamente na inicialização
  sincronizarTodosAbastecimentos().catch((error) => {
    console.error("Erro na sincronização inicial:", error);
  });

  // Sincronizar a cada 5 minutos
  setInterval(() => {
    sincronizarTodosAbastecimentos().catch((error) => {
      console.error("Erro na sincronização periódica:", error);
    });
  }, 5 * 60 * 1000); // 5 minutos

  console.log("Sincronização periódica do CTA Smart iniciada (a cada 5 minutos)");
}
