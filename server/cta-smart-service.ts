/**
 * Serviço de Integração com CTA Smart
 * Sincroniza dados de abastecimentos da API CTA Smart
 */

import https from "https";

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

          res.on("end", () => {
            try {
              // Tentar parsear como JSON
              const resultado = JSON.parse(data);

              // Validar resposta
              if (resultado.sucesso || resultado.data) {
                const abastecimentos = Array.isArray(resultado.data)
                  ? resultado.data
                  : Array.isArray(resultado)
                  ? resultado
                  : [];

                resolve({
                  sucesso: true,
                  total: abastecimentos.length,
                  importados: abastecimentos.length,
                  erros: 0,
                  mensagem: `${abastecimentos.length} abastecimentos sincronizados com sucesso`,
                  abastecimentos: abastecimentos.map((item: any) => ({
                    id: item.id || item.ID || `${item.placa}-${item.data}`,
                    data: item.data || item.DATA || "",
                    hora: item.hora || item.HORA || "",
                    placa: item.placa || item.PLACA || "",
                    motorista: item.motorista || item.MOTORISTA || "",
                    combustivel: item.combustivel || item.COMBUSTIVEL || "",
                    litros: parseFloat(item.litros || item.LITROS || 0),
                    valor: parseFloat(item.valor || item.VALOR || 0),
                    odometro: parseInt(item.odometro || item.ODOMETRO || 0),
                    posto: item.posto || item.POSTO || "",
                    cidade: item.cidade || item.CIDADE || "",
                    estado: item.estado || item.ESTADO || "",
                    observacoes: item.observacoes || item.OBSERVACOES || "",
                  })),
                });
              } else {
                resolve({
                  sucesso: false,
                  total: 0,
                  importados: 0,
                  erros: 1,
                  mensagem: "Resposta inválida da API CTA Smart",
                });
              }
            } catch (parseError) {
              // Se não for JSON, tentar parsear como XML ou texto
              console.error("Erro ao parsear resposta:", parseError);
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

  const formatarData = (data: Date) => data.toISOString().split("T")[0];

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
