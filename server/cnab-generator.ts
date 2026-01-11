/**
 * Gerador de Arquivo CNAB 240 - Padrão FEBRABAN
 * Para pagamento de salários via banco
 * 
 * Formato: 240 caracteres por linha
 * Estrutura: Header do Arquivo, Header do Lote, Registros de Detalhe, Trailer do Lote, Trailer do Arquivo
 */

interface DadosBancarios {
  codigoBanco: string; // 3 dígitos (ex: "001" para Banco do Brasil)
  agencia: string;
  conta: string;
  digitoConta: string;
}

interface PagamentoFuncionario {
  nome: string;
  cpf: string;
  agencia: string;
  conta: string;
  digitoConta: string;
  valor: number;
  tipoConta: "CC" | "CP" | "CS"; // Corrente, Poupança, Salário
}

interface DadosEmpresa {
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
}

export class CNABGenerator {
  private linhas: string[] = [];
  private sequencialRegistro = 1;
  private sequencialLote = 1;

  /**
   * Formata string com padding à direita
   */
  private padRight(str: string, length: number, char = " "): string {
    return (str + char.repeat(length)).substring(0, length);
  }

  /**
   * Formata string com padding à esquerda
   */
  private padLeft(str: string, length: number, char = "0"): string {
    return (char.repeat(length) + str).substring(str.length, str.length + length);
  }

  /**
   * Formata valor monetário (sem vírgula, com 2 casas decimais)
   */
  private formatarValor(valor: number, length = 15): string {
    const valorCentavos = Math.round(valor * 100);
    return this.padLeft(valorCentavos.toString(), length, "0");
  }

  /**
   * Formata data no formato DDMMAAAA
   */
  private formatarData(data: Date): string {
    const dia = this.padLeft(data.getDate().toString(), 2, "0");
    const mes = this.padLeft((data.getMonth() + 1).toString(), 2, "0");
    const ano = data.getFullYear().toString();
    return dia + mes + ano;
  }

  /**
   * Formata hora no formato HHMMSS
   */
  private formatarHora(data: Date): string {
    const hora = this.padLeft(data.getHours().toString(), 2, "0");
    const minuto = this.padLeft(data.getMinutes().toString(), 2, "0");
    const segundo = this.padLeft(data.getSeconds().toString(), 2, "0");
    return hora + minuto + segundo;
  }

  /**
   * Remove caracteres especiais do CPF/CNPJ
   */
  private limparDocumento(doc: string): string {
    return doc.replace(/[^\d]/g, "");
  }

  /**
   * Gera Header do Arquivo (Registro 0)
   */
  private gerarHeaderArquivo(
    dadosBancarios: DadosBancarios,
    dadosEmpresa: DadosEmpresa,
    dataGeracao: Date
  ): string {
    let linha = "";

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 004-007: Lote de Serviço (0000 para header)
    linha += "0000";

    // Posição 008-008: Tipo de Registro (0 = Header)
    linha += "0";

    // Posição 009-017: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 9);

    // Posição 018-018: Tipo de Inscrição da Empresa (2 = CNPJ)
    linha += "2";

    // Posição 019-032: CNPJ da Empresa
    linha += this.padLeft(this.limparDocumento(dadosEmpresa.cnpj), 14, "0");

    // Posição 033-052: Código do Convênio no Banco
    linha += this.padRight("", 20);

    // Posição 053-057: Agência Mantenedora da Conta
    linha += this.padLeft(dadosBancarios.agencia, 5, "0");

    // Posição 058-058: Dígito Verificador da Agência
    linha += " ";

    // Posição 059-070: Número da Conta Corrente
    linha += this.padLeft(dadosBancarios.conta, 12, "0");

    // Posição 071-071: Dígito Verificador da Conta
    linha += dadosBancarios.digitoConta;

    // Posição 072-072: Dígito Verificador da Ag/Conta
    linha += " ";

    // Posição 073-102: Nome da Empresa
    linha += this.padRight(dadosEmpresa.razaoSocial.substring(0, 30), 30);

    // Posição 103-132: Nome do Banco
    linha += this.padRight("BANCO", 30);

    // Posição 133-142: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 10);

    // Posição 143-143: Código Remessa/Retorno (1 = Remessa)
    linha += "1";

    // Posição 144-151: Data de Geração do Arquivo
    linha += this.formatarData(dataGeracao);

    // Posição 152-157: Hora de Geração do Arquivo
    linha += this.formatarHora(dataGeracao);

    // Posição 158-163: Número Sequencial do Arquivo
    linha += this.padLeft("1", 6, "0");

    // Posição 164-166: Versão do Layout do Arquivo
    linha += "084";

    // Posição 167-171: Densidade de Gravação do Arquivo
    linha += this.padLeft("", 5);

    // Posição 172-191: Uso Reservado do Banco
    linha += this.padRight("", 20);

    // Posição 192-211: Uso Reservado da Empresa
    linha += this.padRight("", 20);

    // Posição 212-240: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 29);

    return linha;
  }

  /**
   * Gera Header do Lote (Registro 1)
   */
  private gerarHeaderLote(
    dadosBancarios: DadosBancarios,
    dadosEmpresa: DadosEmpresa
  ): string {
    let linha = "";

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, "0");

    // Posição 008-008: Tipo de Registro (1 = Header de Lote)
    linha += "1";

    // Posição 009-009: Tipo de Operação (C = Crédito)
    linha += "C";

    // Posição 010-011: Tipo de Serviço (30 = Pagamento de Salários)
    linha += "30";

    // Posição 012-013: Forma de Lançamento (01 = Crédito em Conta Corrente)
    linha += "01";

    // Posição 014-016: Versão do Layout do Lote
    linha += "045";

    // Posição 017-017: Uso Exclusivo FEBRABAN/CNAB
    linha += " ";

    // Posição 018-018: Tipo de Inscrição da Empresa
    linha += "2";

    // Posição 019-033: CNPJ da Empresa
    linha += this.padLeft(this.limparDocumento(dadosEmpresa.cnpj), 15, "0");

    // Posição 034-053: Código do Convênio no Banco
    linha += this.padRight("", 20);

    // Posição 054-058: Agência Mantenedora da Conta
    linha += this.padLeft(dadosBancarios.agencia, 5, "0");

    // Posição 059-059: Dígito Verificador da Agência
    linha += " ";

    // Posição 060-071: Número da Conta Corrente
    linha += this.padLeft(dadosBancarios.conta, 12, "0");

    // Posição 072-072: Dígito Verificador da Conta
    linha += dadosBancarios.digitoConta;

    // Posição 073-073: Dígito Verificador da Ag/Conta
    linha += " ";

    // Posição 074-103: Nome da Empresa
    linha += this.padRight(dadosEmpresa.razaoSocial.substring(0, 30), 30);

    // Posição 104-143: Mensagem 1
    linha += this.padRight("", 40);

    // Posição 144-183: Mensagem 2
    linha += this.padRight("", 40);

    // Posição 184-191: Número Remessa/Retorno
    linha += this.padLeft("1", 8, "0");

    // Posição 192-199: Data de Gravação Remessa/Retorno
    linha += this.formatarData(new Date());

    // Posição 200-207: Data do Crédito
    linha += this.formatarData(new Date());

    // Posição 208-240: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 33);

    return linha;
  }

  /**
   * Gera Registro de Detalhe (Segmento A)
   */
  private gerarDetalhe(
    dadosBancarios: DadosBancarios,
    pagamento: PagamentoFuncionario,
    numeroRegistro: number
  ): string {
    let linha = "";

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, "0");

    // Posição 008-008: Tipo de Registro (3 = Detalhe)
    linha += "3";

    // Posição 009-013: Número Sequencial do Registro no Lote
    linha += this.padLeft(numeroRegistro.toString(), 5, "0");

    // Posição 014-014: Código Segmento do Registro Detalhe (A)
    linha += "A";

    // Posição 015-017: Tipo de Movimento (000 = Inclusão)
    linha += "000";

    // Posição 018-020: Código da Câmara de Compensação
    linha += "000";

    // Posição 021-023: Código do Banco do Favorecido
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 024-028: Agência do Favorecido
    linha += this.padLeft(pagamento.agencia, 5, "0");

    // Posição 029-029: Dígito Verificador da Agência
    linha += " ";

    // Posição 030-041: Número da Conta do Favorecido
    linha += this.padLeft(pagamento.conta, 12, "0");

    // Posição 042-042: Dígito Verificador da Conta
    linha += pagamento.digitoConta;

    // Posição 043-043: Dígito Verificador da Ag/Conta
    linha += " ";

    // Posição 044-073: Nome do Favorecido
    linha += this.padRight(pagamento.nome.substring(0, 30), 30);

    // Posição 074-093: Número do Documento Atribuído pela Empresa
    linha += this.padRight("", 20);

    // Posição 094-101: Data do Pagamento
    linha += this.formatarData(new Date());

    // Posição 102-104: Tipo da Moeda (BRL)
    linha += "BRL";

    // Posição 105-119: Quantidade da Moeda
    linha += this.padLeft("", 15, "0");

    // Posição 120-134: Valor do Pagamento
    linha += this.formatarValor(pagamento.valor);

    // Posição 135-154: Número do Documento Atribuído pelo Banco
    linha += this.padRight("", 20);

    // Posição 155-162: Data Real da Efetivação do Pagamento
    linha += this.padLeft("", 8, "0");

    // Posição 163-177: Valor Real da Efetivação do Pagamento
    linha += this.padLeft("", 15, "0");

    // Posição 178-217: Outras Informações
    linha += this.padRight("", 40);

    // Posição 218-219: Código de Ocorrências para Retorno
    linha += "  ";

    // Posição 220-240: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 21);

    return linha;
  }

  /**
   * Gera Trailer do Lote (Registro 5)
   */
  private gerarTrailerLote(
    dadosBancarios: DadosBancarios,
    quantidadeRegistros: number,
    valorTotal: number
  ): string {
    let linha = "";

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, "0");

    // Posição 008-008: Tipo de Registro (5 = Trailer de Lote)
    linha += "5";

    // Posição 009-017: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 9);

    // Posição 018-023: Quantidade de Registros do Lote
    linha += this.padLeft((quantidadeRegistros + 2).toString(), 6, "0"); // +2 para header e trailer do lote

    // Posição 024-041: Somatória dos Valores
    linha += this.formatarValor(valorTotal, 18);

    // Posição 042-059: Somatória de Quantidade de Moedas
    linha += this.padLeft("", 18, "0");

    // Posição 060-065: Número Aviso de Débito
    linha += this.padLeft("", 6, "0");

    // Posição 066-240: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 175);

    return linha;
  }

  /**
   * Gera Trailer do Arquivo (Registro 9)
   */
  private gerarTrailerArquivo(
    dadosBancarios: DadosBancarios,
    quantidadeLotes: number,
    quantidadeRegistros: number
  ): string {
    let linha = "";

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, "0");

    // Posição 004-007: Lote de Serviço (9999 para trailer)
    linha += "9999";

    // Posição 008-008: Tipo de Registro (9 = Trailer)
    linha += "9";

    // Posição 009-017: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 9);

    // Posição 018-023: Quantidade de Lotes do Arquivo
    linha += this.padLeft(quantidadeLotes.toString(), 6, "0");

    // Posição 024-029: Quantidade de Registros do Arquivo
    linha += this.padLeft(quantidadeRegistros.toString(), 6, "0");

    // Posição 030-035: Quantidade de Contas para Conciliação
    linha += this.padLeft("", 6, "0");

    // Posição 036-240: Uso Exclusivo FEBRABAN/CNAB
    linha += this.padRight("", 205);

    return linha;
  }

  /**
   * Gera arquivo CNAB 240 completo
   */
  public gerarArquivo(
    dadosBancarios: DadosBancarios,
    dadosEmpresa: DadosEmpresa,
    pagamentos: PagamentoFuncionario[]
  ): string {
    this.linhas = [];
    this.sequencialRegistro = 1;
    this.sequencialLote = 1;

    const dataGeracao = new Date();

    // Header do Arquivo
    this.linhas.push(this.gerarHeaderArquivo(dadosBancarios, dadosEmpresa, dataGeracao));

    // Header do Lote
    this.linhas.push(this.gerarHeaderLote(dadosBancarios, dadosEmpresa));

    // Detalhes (Pagamentos)
    let valorTotal = 0;
    pagamentos.forEach((pagamento, index) => {
      this.linhas.push(this.gerarDetalhe(dadosBancarios, pagamento, index + 1));
      valorTotal += pagamento.valor;
    });

    // Trailer do Lote
    this.linhas.push(this.gerarTrailerLote(dadosBancarios, pagamentos.length, valorTotal));

    // Trailer do Arquivo
    const totalRegistros = pagamentos.length + 4; // header arquivo + header lote + trailer lote + trailer arquivo
    this.linhas.push(this.gerarTrailerArquivo(dadosBancarios, 1, totalRegistros));

    return this.linhas.join("\r\n");
  }
}
