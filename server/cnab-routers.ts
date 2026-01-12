import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * CNAB240 - Padrão de arquivo para transferências bancárias
 * Formato: 240 caracteres por linha
 * Estrutura: Header + Lotes + Trailers
 */

interface CNABConfig {
  banco: "001" | "237" | "104"; // 001=BB, 237=Bradesco, 104=Caixa
  agencia: string;
  conta: string;
  contaDigito: string;
  empresa: string;
  cnpj: string;
  sequencial: number;
}

interface Pagamento {
  id: number;
  nome: string;
  cpf: string;
  banco: string;
  agencia: string;
  conta: string;
  contaDigito: string;
  valor: number;
  descricao: string;
}

class CNABGenerator {
  private config: CNABConfig;
  private pagamentos: Pagamento[] = [];
  private linhas: string[] = [];
  private sequencialLinha = 0;
  private sequencialLote = 0;

  constructor(config: CNABConfig) {
    this.config = config;
  }

  private formatarTexto(valor: string, tamanho: number): string {
    return valor.padEnd(tamanho, " ").substring(0, tamanho);
  }

  private formatarNumero(valor: number | string, tamanho: number): string {
    const str = String(valor).replace(/\D/g, "");
    return str.padStart(tamanho, "0").substring(0, tamanho);
  }

  private formatarValor(valor: number, tamanho: number = 15): string {
    const centavos = Math.round(valor * 100);
    return String(centavos).padStart(tamanho, "0").substring(0, tamanho);
  }

  private gerarHeaderArquivo(): string {
    const data = new Date();
    const dataFormatada = this.formatarNumero(
      `${String(data.getDate()).padStart(2, "0")}${String(data.getMonth() + 1).padStart(2, "0")}${data.getFullYear()}`,
      8
    );
    const horaFormatada = this.formatarNumero(
      `${String(data.getHours()).padStart(2, "0")}${String(data.getMinutes()).padStart(2, "0")}${String(data.getSeconds()).padStart(2, "0")}`,
      6
    );

    let linha = "";
    linha += "033";
    linha += "0000";
    linha += "0";
    linha += " ";
    linha += "0";
    linha += this.formatarNumero(this.config.cnpj, 14);
    linha += this.formatarNumero(this.config.sequencial, 20);
    linha += "00001";
    linha += "001";
    linha += "080";
    linha += this.formatarTexto("", 20);
    linha += this.formatarTexto("", 20);
    linha += this.formatarTexto("", 29);
    linha += dataFormatada;
    linha += horaFormatada;
    linha += this.formatarNumero(this.config.sequencial, 6);
    linha += "000000";
    linha += "000000";
    linha += this.formatarTexto("", 69);

    return linha.substring(0, 240);
  }

  private gerarHeaderLote(): string {
    const data = new Date();
    const dataFormatada = this.formatarNumero(
      `${String(data.getDate()).padStart(2, "0")}${String(data.getMonth() + 1).padStart(2, "0")}${data.getFullYear()}`,
      8
    );

    this.sequencialLote++;
    this.sequencialLinha++;

    let linha = "";
    linha += "033";
    linha += this.formatarNumero(this.sequencialLote, 4);
    linha += "1";
    linha += "C";
    linha += "01";
    linha += "030";
    linha += " ";
    linha += "0";
    linha += this.formatarNumero(this.config.cnpj, 14);
    linha += this.formatarNumero(this.config.agencia, 5);
    linha += " ";
    linha += this.formatarNumero(this.config.conta, 12);
    linha += this.config.contaDigito;
    linha += " ";
    linha += this.formatarTexto(this.config.empresa, 30);
    linha += this.formatarTexto("FOLHA DE PAGAMENTO", 30);
    linha += this.formatarNumero(this.sequencialLote, 8);
    linha += dataFormatada;
    linha += this.formatarNumero(0, 8);
    linha += this.formatarNumero(0, 8);
    linha += this.formatarTexto("", 33);
    linha += this.formatarNumero(this.sequencialLinha, 6);

    return linha.substring(0, 240);
  }

  private gerarDetalhe(pagamento: Pagamento, sequencial: number): string {
    this.sequencialLinha++;

    let linha = "";
    linha += "033";
    linha += this.formatarNumero(this.sequencialLote, 4);
    linha += "3";
    linha += this.formatarNumero(sequencial, 5);
    linha += "0";
    linha += " ";
    linha += "01";
    linha += this.formatarNumero(pagamento.banco, 3);
    linha += this.formatarNumero(pagamento.agencia, 5);
    linha += " ";
    linha += this.formatarNumero(pagamento.conta, 12);
    linha += pagamento.contaDigito;
    linha += " ";
    linha += this.formatarTexto(pagamento.nome, 30);
    linha += this.formatarNumero(pagamento.cpf, 14);
    linha += this.formatarValor(pagamento.valor, 15);
    linha += this.formatarNumero(0, 20);
    linha += this.formatarTexto("", 8);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarNumero(0, 15);
    linha += this.formatarTexto(pagamento.descricao, 30);
    linha += this.formatarTexto("", 10);
    linha += this.formatarNumero(0, 1);
    linha += this.formatarNumero(0, 14);
    linha += this.formatarTexto("", 60);
    linha += this.formatarNumero(this.sequencialLinha, 6);

    return linha.substring(0, 240);
  }

  private gerarTrailerLote(totalPagamentos: number, valorTotal: number): string {
    this.sequencialLinha++;

    let linha = "";
    linha += "033";
    linha += this.formatarNumero(this.sequencialLote, 4);
    linha += "5";
    linha += this.formatarTexto("", 10);
    linha += this.formatarNumero(totalPagamentos, 6);
    linha += this.formatarValor(valorTotal, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarNumero(0, 18);
    linha += this.formatarTexto("", 117);
    linha += this.formatarNumero(this.sequencialLinha, 6);

    return linha.substring(0, 240);
  }

  private gerarTrailerArquivo(totalLotes: number, totalRegistros: number): string {
    this.sequencialLinha++;

    let linha = "";
    linha += "033";
    linha += "9999";
    linha += "9";
    linha += this.formatarTexto("", 6);
    linha += this.formatarNumero(totalLotes, 6);
    linha += this.formatarNumero(totalRegistros, 6);
    linha += this.formatarTexto("", 211);
    linha += this.formatarNumero(this.sequencialLinha, 6);

    return linha.substring(0, 240);
  }

  public gerar(pagamentos: Pagamento[]): string {
    this.pagamentos = pagamentos;
    this.linhas = [];
    this.sequencialLinha = 0;
    this.sequencialLote = 0;

    if (pagamentos.length === 0) {
      throw new Error("Nenhum pagamento para gerar CNAB240");
    }

    this.linhas.push(this.gerarHeaderArquivo());
    this.linhas.push(this.gerarHeaderLote());

    let totalValor = 0;
    pagamentos.forEach((pag, idx) => {
      this.linhas.push(this.gerarDetalhe(pag, idx + 1));
      totalValor += pag.valor;
    });

    this.linhas.push(this.gerarTrailerLote(pagamentos.length + 2, totalValor));
    this.linhas.push(this.gerarTrailerArquivo(1, this.sequencialLinha));

    return this.linhas.join("\r\n");
  }
}

export const cnabRouter = router({
  gerarCNAB240: protectedProcedure
    .input(
      z.object({
        folhaId: z.number(),
        banco: z.enum(["001", "237", "104"]).default("001"),
        agencia: z.string(),
        conta: z.string(),
        contaDigito: z.string(),
        empresa: z.string(),
        cnpj: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT 
          f.id,
          f.nome,
          f.cpf,
          '001' as banco,
          '0001' as agencia,
          '123456' as conta,
          '0' as contaDigito,
          COALESCE(i.total_liquido, 0) as valor
        FROM folhas_pagamento fp
        JOIN itens_folha i ON fp.id = i.folha_id
        JOIN funcionarios f ON i.funcionario_id = f.id
        WHERE fp.id = ${input.folhaId}
        AND fp.status IN ('fechada', 'paga')
      `);

      const pagamentos = (result as unknown as any[][])[0] || [];

      if (pagamentos.length === 0) {
        throw new Error("Nenhum pagamento aprovado encontrado na folha");
      }

      const pagamentosFormatados: Pagamento[] = pagamentos.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        cpf: p.cpf,
        banco: p.banco || "001",
        agencia: p.agencia || input.agencia,
        conta: p.conta || input.conta,
        contaDigito: p.contaDigito || input.contaDigito,
        valor: parseFloat(p.valor) || 0,
        descricao: "FOLHA DE PAGAMENTO",
      }));

      const generator = new CNABGenerator({
        banco: input.banco as "001" | "237" | "104",
        agencia: input.agencia,
        conta: input.conta,
        contaDigito: input.contaDigito,
        empresa: input.empresa,
        cnpj: input.cnpj,
        sequencial: Math.floor(Math.random() * 999999),
      });

      const conteudo = generator.gerar(pagamentosFormatados);

      const dataAtual = new Date();
      const nomeArquivo = `CNAB240_${input.folhaId}_${dataAtual.getTime()}.txt`;

      try {
        await db.execute(sql`
          INSERT INTO cnab_arquivos (folha_id, nome_arquivo, conteudo, status)
          VALUES (${input.folhaId}, ${nomeArquivo}, ${conteudo}, 'gerado')
        `);
      } catch (error) {
        console.log("Tabela cnab_arquivos pode nao existir ainda");
      }

      return {
        sucesso: true,
        nomeArquivo,
        conteudo,
        totalPagamentos: pagamentosFormatados.length,
        valorTotal: pagamentosFormatados.reduce((sum, p) => sum + p.valor, 0),
      };
    }),

  listarArquivos: protectedProcedure
    .input(z.object({ folhaId: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        let query = sql`SELECT * FROM cnab_arquivos`;

        if (input.folhaId) {
          query = sql`SELECT * FROM cnab_arquivos WHERE folha_id = ${input.folhaId}`;
        }

        const result = await db.execute(sql`${query} ORDER BY data_geracao DESC LIMIT 100`);
        return (result as unknown as any[][])[0] || [];
      } catch (error) {
        return [];
      }
    }),

  obterArquivo: protectedProcedure
    .input(z.object({ arquivoId: z.number() }))
    .query(async ({ input }) => {
      try {
        const result = await db.execute(sql`
          SELECT * FROM cnab_arquivos WHERE id = ${input.arquivoId}
        `);

        const arquivo = (result as unknown as any[][])[0]?.[0];
        if (!arquivo) {
          throw new Error("Arquivo nao encontrado");
        }

        return arquivo;
      } catch (error) {
        throw new Error("Erro ao obter arquivo CNAB240");
      }
    }),

  atualizarStatus: protectedProcedure
    .input(
      z.object({
        arquivoId: z.number(),
        status: z.enum(["gerado", "enviado", "processado", "erro"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.execute(sql`
          UPDATE cnab_arquivos 
          SET status = ${input.status}, data_atualizacao = NOW()
          WHERE id = ${input.arquivoId}
        `);
      } catch (error) {
        console.log("Erro ao atualizar status do arquivo CNAB");
      }

      return { sucesso: true };
    }),

  deletarArquivo: protectedProcedure
    .input(z.object({ arquivoId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.execute(sql`
          DELETE FROM cnab_arquivos WHERE id = ${input.arquivoId}
        `);
      } catch (error) {
        console.log("Erro ao deletar arquivo CNAB");
      }

      return { sucesso: true };
    }),
});
