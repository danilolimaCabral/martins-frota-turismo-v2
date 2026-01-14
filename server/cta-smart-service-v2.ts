/**
 * Serviço de Integração com CTA Smart - V2 com Suporte a XML
 * Sincroniza dados de abastecimentos da API CTA Smart
 */

import https from "https";
import { parseStringPromise } from "xml2js";

export interface AbastecimentoCTA {
  id: string;
  data: string;
  hora: string;
  placa: string;
  motorista: string;
  combustivel: string;
  litros: number;
  valor: number;
  odometro: number;
  posto: string;
  cidade: string;
  estado: string;
  observacoes?: string;
  frentista?: string;
  tanque?: string;
}

export interface ResultadoSincronizacao {
  sucesso: boolean;
  total: number;
  importados: number;
  erros: number;
  mensagem: string;
  abastecimentos?: AbastecimentoCTA[];
}

/**
 * Sincroniza abastecimentos da API CTA Smart
 * @param token Token de autenticação da API CTA Smart
 * @param dataInicio Data inicial para sincronização (YYYY-MM-DD)
 * @param dataFim Data final para sincronização (YYYY-MM-DD)
 */
export async function sincronizarAbastecimentosCTA(
  token: string,
  dataInicio?: string,
  dataFim?: string
): Promise<ResultadoSincronizacao> {
  return new Promise((resolve, reject) => {
    try {
      // Construir URL com parâmetros
      let url = `https://ctasmart.com.br:8443/SvWebSincronizaAbastecimentos?token=${token}`;

      if (dataInicio) {
        url += `&dataInicio=${dataInicio}`;
      }
      if (dataFim) {
        url += `&dataFim=${dataFim}`;
      }

      // Fazer requisição HTTPS
      https
        .get(url, { rejectUnauthorized: false }, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", async () => {
            try {
              // Tentar parsear como XML
              const xmlData = await parseStringPromise(data);

              // Extrair abastecimentos do XML
              const abastecimentos: AbastecimentoCTA[] = [];

              if (
                xmlData.CTAPLUS &&
                xmlData.CTAPLUS.ABASTECIMENTOS &&
                xmlData.CTAPLUS.ABASTECIMENTOS[0].ABASTECIMENTO
              ) {
                const items = xmlData.CTAPLUS.ABASTECIMENTOS[0].ABASTECIMENTO;
                const itemsArray = Array.isArray(items) ? items : [items];

                for (const item of itemsArray) {
                  try {
                    // Extrair dados do XML
                    const id = item.ID?.[0] || `${item.VEICULO?.[0]?.PLACA?.[0]}-${item.DATA_INICIO?.[0]}`;
                    const dataInicio = item.DATA_INICIO?.[0] || "";
                    const horaInicio = item.HORA_INICIO?.[0] || "";
                    const placa = item.VEICULO?.[0]?.PLACA?.[0] || "";
                    const motorista = item.MOTORISTA?.[0]?.NOME?.[0] || "";
                    const frentista = item.FRENTISTA?.[0]?.NOME?.[0] || "";
                    const volume = parseFloat(
                      String(item.VOLUME?.[0] || item.VOLUME_FIXED?.[0] || 0).replace(",", ".")
                    );
                    const custo = parseFloat(
                      String(item.CUSTO?.[0] || 0).replace(",", ".")
                    );
                    const odometro = parseInt(item.ODOMETRO?.[0] || "0");
                    const posto = item.POSTO?.[0]?.NOME?.[0] || "";
                    const estado = item.POSTO?.[0]?.UF?.[0] || "";
                    const tanque = item.TANQUE?.[0]?.NOME?.[0] || "";

                    // Extrair combustível da categoria
                    let combustivel = "Diesel";
                    const categoria = item.PRODUTO_CATEGORIA_ID?.[0];
                    if (categoria === "1") combustivel = "Diesel";
                    else if (categoria === "2") combustivel = "Gasolina";
                    else if (categoria === "3") combustivel = "Etanol";
                    else if (categoria === "4") combustivel = "GNV";

                    // Extrair cidade do nome do posto
                    const partes = posto.split("-");
                    const cidade = partes.length > 1 ? partes[1].trim() : "";

                    abastecimentos.push({
                      id: String(id),
                      data: dataInicio,
                      hora: horaInicio,
                      placa,
                      motorista,
                      combustivel,
                      litros: volume,
                      valor: custo,
                      odometro,
                      posto,
                      cidade,
                      estado,
                      frentista,
                      tanque,
                    });
                  } catch (itemError) {
                    console.error("Erro ao processar item:", itemError);
                  }
                }
              }

              resolve({
                sucesso: true,
                total: abastecimentos.length,
                importados: abastecimentos.length,
                erros: 0,
                mensagem: `${abastecimentos.length} abastecimentos sincronizados com sucesso`,
                abastecimentos,
              });
            } catch (parseError) {
              console.error("Erro ao parsear XML:", parseError);
              resolve({
                sucesso: false,
                total: 0,
                importados: 0,
                erros: 1,
                mensagem: `Erro ao processar resposta: ${parseError instanceof Error ? parseError.message : "Formato desconhecido"}`,
              });
            }
          });
        })
        .on("error", (error) => {
          console.error("Erro na requisição HTTPS:", error);
          resolve({
            sucesso: false,
            total: 0,
            importados: 0,
            erros: 1,
            mensagem: `Erro de conexão: ${error.message}`,
          });
        });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      resolve({
        sucesso: false,
        total: 0,
        importados: 0,
        erros: 1,
        mensagem: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    }
  });
}

/**
 * Obtém abastecimentos recentes da API CTA Smart
 * @param token Token de autenticação
 * @param dias Número de dias anteriores a sincronizar (padrão: 30)
 */
export async function obterAbastecimentosRecentes(
  token: string,
  dias: number = 30
): Promise<ResultadoSincronizacao> {
  const dataFim = new Date();
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  return sincronizarAbastecimentosCTA(
    token,
    formatarData(dataInicio),
    formatarData(dataFim)
  );
}

/**
 * Calcula estatísticas de abastecimentos
 */
export function calcularEstatisticas(abastecimentos: AbastecimentoCTA[]) {
  const totalLitros = abastecimentos.reduce((sum, a) => sum + a.litros, 0);
  const totalValor = abastecimentos.reduce((sum, a) => sum + a.valor, 0);
  const precoMedio = abastecimentos.length > 0 ? totalValor / totalLitros : 0;

  const porVeiculo = abastecimentos.reduce(
    (acc, a) => {
      if (!acc[a.placa]) {
        acc[a.placa] = {
          placa: a.placa,
          litros: 0,
          valor: 0,
          quantidade: 0,
        };
      }
      acc[a.placa].litros += a.litros;
      acc[a.placa].valor += a.valor;
      acc[a.placa].quantidade += 1;
      return acc;
    },
    {} as Record<
      string,
      { placa: string; litros: number; valor: number; quantidade: number }
    >
  );

  const porCombustivel = abastecimentos.reduce(
    (acc, a) => {
      if (!acc[a.combustivel]) {
        acc[a.combustivel] = {
          combustivel: a.combustivel,
          litros: 0,
          valor: 0,
          quantidade: 0,
          precoMedio: 0,
        };
      }
      acc[a.combustivel].litros += a.litros;
      acc[a.combustivel].valor += a.valor;
      acc[a.combustivel].quantidade += 1;
      acc[a.combustivel].precoMedio =
        acc[a.combustivel].valor / acc[a.combustivel].litros;
      return acc;
    },
    {} as Record<
      string,
      {
        combustivel: string;
        litros: number;
        valor: number;
        quantidade: number;
        precoMedio: number;
      }
    >
  );

  return {
    totalLitros,
    totalValor,
    precoMedio,
    quantidade: abastecimentos.length,
    porVeiculo: Object.values(porVeiculo),
    porCombustivel: Object.values(porCombustivel),
  };
}
