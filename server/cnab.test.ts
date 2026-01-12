import { describe, it, expect } from "vitest";

interface CNABConfig {
  banco: "001" | "237" | "104";
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

describe("CNAB240 Generator", () => {
  it("deve gerar arquivo CNAB240 com um pagamento", () => {
    const generator = new CNABGenerator({
      banco: "001",
      agencia: "0001",
      conta: "123456",
      contaDigito: "0",
      empresa: "MARTINS VIAGENS",
      cnpj: "12345678000190",
      sequencial: 1,
    });

    const pagamentos: Pagamento[] = [
      {
        id: 1,
        nome: "JOAO SILVA",
        cpf: "12345678901",
        banco: "001",
        agencia: "0001",
        conta: "654321",
        contaDigito: "0",
        valor: 1500.5,
        descricao: "FOLHA DE PAGAMENTO",
      },
    ];

    const arquivo = generator.gerar(pagamentos);
    const linhas = arquivo.split("\r\n");

    expect(linhas.length).toBeGreaterThan(0);
    expect(linhas[0].length).toBeGreaterThan(200);
    expect(linhas[0].substring(0, 3)).toBe("033");
  });

  it("deve gerar arquivo com múltiplos pagamentos e validar estrutura", () => {
    const generator = new CNABGenerator({
      banco: "001",
      agencia: "0001",
      conta: "123456",
      contaDigito: "0",
      empresa: "MARTINS VIAGENS",
      cnpj: "12345678000190",
      sequencial: 1,
    });

    const pagamentos: Pagamento[] = [
      {
        id: 1,
        nome: "JOAO SILVA",
        cpf: "12345678901",
        banco: "001",
        agencia: "0001",
        conta: "654321",
        contaDigito: "0",
        valor: 1500.5,
        descricao: "FOLHA DE PAGAMENTO",
      },
      {
        id: 2,
        nome: "MARIA SANTOS",
        cpf: "98765432101",
        banco: "001",
        agencia: "0001",
        conta: "654322",
        contaDigito: "0",
        valor: 2000.0,
        descricao: "FOLHA DE PAGAMENTO",
      },
      {
        id: 3,
        nome: "PEDRO OLIVEIRA",
        cpf: "11122233344",
        banco: "001",
        agencia: "0001",
        conta: "654323",
        contaDigito: "0",
        valor: 1800.75,
        descricao: "FOLHA DE PAGAMENTO",
      },
    ];

    const arquivo = generator.gerar(pagamentos);
    const linhas = arquivo.split("\r\n");

    expect(linhas.length).toBeGreaterThan(5);
    expect(linhas[0].substring(0, 3)).toBe("033");
  });

  it("deve validar formato de linhas CNAB240", () => {
    const generator = new CNABGenerator({
      banco: "001",
      agencia: "0001",
      conta: "123456",
      contaDigito: "0",
      empresa: "MARTINS VIAGENS",
      cnpj: "12345678000190",
      sequencial: 1,
    });

    const pagamentos: Pagamento[] = [
      {
        id: 1,
        nome: "JOAO SILVA",
        cpf: "12345678901",
        banco: "001",
        agencia: "0001",
        conta: "654321",
        contaDigito: "0",
        valor: 1500.5,
        descricao: "FOLHA DE PAGAMENTO",
      },
    ];

    const arquivo = generator.gerar(pagamentos);
    const linhas = arquivo.split("\r\n");

    expect(linhas[0].substring(7, 8)).toBe("0");
    expect(linhas[1].substring(7, 8)).toBe("1");
    expect(linhas[2].substring(7, 8)).toBe("3");
    expect(linhas[linhas.length - 2].substring(7, 8)).toBe("5");
    expect(linhas[linhas.length - 1].substring(7, 8)).toBe("9");
  });

  it("deve lançar erro se nenhum pagamento for fornecido", () => {
    const generator = new CNABGenerator({
      banco: "001",
      agencia: "0001",
      conta: "123456",
      contaDigito: "0",
      empresa: "MARTINS VIAGENS",
      cnpj: "12345678000190",
      sequencial: 1,
    });

    expect(() => {
      generator.gerar([]);
    }).toThrow("Nenhum pagamento para gerar CNAB240");
  });

  it("deve validar estrutura completa do arquivo", () => {
    const generator = new CNABGenerator({
      banco: "001",
      agencia: "0001",
      conta: "123456",
      contaDigito: "0",
      empresa: "MARTINS VIAGENS",
      cnpj: "12345678000190",
      sequencial: 1,
    });

    const pagamentos: Pagamento[] = [
      {
        id: 1,
        nome: "JOAO SILVA",
        cpf: "12345678901",
        banco: "001",
        agencia: "0001",
        conta: "654321",
        contaDigito: "0",
        valor: 1000.0,
        descricao: "FOLHA DE PAGAMENTO",
      },
      {
        id: 2,
        nome: "MARIA SANTOS",
        cpf: "98765432101",
        banco: "001",
        agencia: "0001",
        conta: "654322",
        contaDigito: "0",
        valor: 2000.0,
        descricao: "FOLHA DE PAGAMENTO",
      },
    ];

    const arquivo = generator.gerar(pagamentos);
    const linhas = arquivo.split("\r\n");

    expect(linhas.length).toBeGreaterThanOrEqual(5);
    expect(linhas[0].substring(7, 8)).toBe("0");
    expect(linhas[linhas.length - 1].substring(7, 8)).toBe("9");
  });
});
