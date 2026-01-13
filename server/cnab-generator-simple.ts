/**
 * Gerador de CNAB 240 Simplificado
 * Padrão FEBRABAN para transferências de crédito em conta corrente
 */

export interface DadosCNAB {
  empresa: {
    cnpj: string; // Sem formatação: 12345678000190
    razaoSocial: string;
  };
  banco: {
    codigo: string; // 001 para Banco do Brasil
    agencia: string; // Sem formatação
    conta: string; // Sem formatação
    digito: string; // Dígito verificador
  };
  lote: {
    numero: number; // Número sequencial do lote
    dataGeracao: Date;
  };
  funcionarios: Array<{
    nome: string;
    cpf: string; // Sem formatação: 12345678901
    banco: {
      codigo: string;
      agencia: string;
      conta: string;
      digito: string;
    };
    valor: number;
  }>;
}

/**
 * Formatar número com zeros à esquerda
 */
function formatarNumero(valor: number | string, tamanho: number): string {
  return String(valor).padStart(tamanho, '0');
}

/**
 * Formatar data para DDMMYYYY
 */
function formatarData(data: Date): string {
  const dia = formatarNumero(data.getDate(), 2);
  const mes = formatarNumero(data.getMonth() + 1, 2);
  const ano = formatarNumero(data.getFullYear(), 4);
  return `${dia}${mes}${ano}`;
}

/**
 * Formatar hora para HHMMSS
 */
function formatarHora(data: Date): string {
  const horas = formatarNumero(data.getHours(), 2);
  const minutos = formatarNumero(data.getMinutes(), 2);
  const segundos = formatarNumero(data.getSeconds(), 2);
  return `${horas}${minutos}${segundos}`;
}

/**
 * Remover caracteres especiais
 */
function limparCampo(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Calcular dígito verificador (módulo 11)
 */
function calcularDigitoVerificador(linha: string): string {
  const sequencia = '29876545678987654567898765456789876545678987654567';
  let soma = 0;

  for (let i = 0; i < linha.length; i++) {
    soma += parseInt(linha[i]) * parseInt(sequencia[i % sequencia.length]);
  }

  const resto = soma % 11;
  const digito = 11 - resto;

  return digito === 0 || digito === 11 ? '0' : String(digito);
}

/**
 * Gerar Header do Arquivo (Registro 0000)
 */
function gerarHeaderArquivo(dados: DadosCNAB): string {
  const registro = '0'; // Código do registro
  const lote = '0000'; // Lote de serviço
  const sequencia = '00000'; // Sequência do registro no lote
  const reservado1 = ''; // Reservado
  const tipoInscricao = '2'; // 2 = CNPJ
  const inscricao = formatarNumero(limparCampo(dados.empresa.cnpj), 14);
  const codigoBanco = formatarNumero(dados.banco.codigo, 3);
  const agencia = formatarNumero(dados.banco.agencia, 5);
  const agenciaDigito = '0'; // Dígito da agência
  const conta = formatarNumero(dados.banco.conta, 12);
  const contaDigito = dados.banco.digito;
  const razaoSocial = dados.empresa.razaoSocial.padEnd(30, ' ').substring(0, 30);
  const nomeDoBank = 'BANCO DO BRASIL'.padEnd(30, ' ').substring(0, 30);
  const dataGeracao = formatarData(dados.lote.dataGeracao);
  const horaGeracao = formatarHora(dados.lote.dataGeracao);
  const numeroSequencia = formatarNumero(1, 6);
  const versaoLayout = '090000';
  const tamanhoRegistro = '00240';
  const densidadeGravacao = '00000';
  const reservado2 = ''.padEnd(20, ' ');
  const reservado3 = ''.padEnd(20, ' ');

  const linha = `${registro}${lote}${sequencia}${tipoInscricao}${inscricao}${codigoBanco}${agencia}${agenciaDigito}${conta}${contaDigito}${razaoSocial}${nomeDoBank}${dataGeracao}${horaGeracao}${numeroSequencia}${versaoLayout}${tamanhoRegistro}${densidadeGravacao}${reservado2}${reservado3}`;

  return linha.substring(0, 240);
}

/**
 * Gerar Header do Lote (Registro 1000)
 */
function gerarHeaderLote(dados: DadosCNAB): string {
  const registro = '1'; // Código do registro
  const lote = formatarNumero(1, 4); // Número do lote
  const sequencia = '00000'; // Sequência do registro no lote
  const tipoOperacao = '1'; // 1 = Crédito
  const formaLancamento = '01'; // 01 = Transferência de crédito
  const layoutLote = '030'; // Versão do layout
  const tipoInscricao = '2'; // 2 = CNPJ
  const inscricao = formatarNumero(limparCampo(dados.empresa.cnpj), 14);
  const codigoBanco = formatarNumero(dados.banco.codigo, 3);
  const agencia = formatarNumero(dados.banco.agencia, 5);
  const agenciaDigito = '0';
  const conta = formatarNumero(dados.banco.conta, 12);
  const contaDigito = dados.banco.digito;
  const razaoSocial = dados.empresa.razaoSocial.padEnd(30, ' ').substring(0, 30);
  const mensagem1 = ''.padEnd(40, ' ');
  const numeroRemessa = formatarNumero(1, 8);
  const dataGeracao = formatarData(dados.lote.dataGeracao);
  const dataCredito = formatarData(dados.lote.dataGeracao);
  const reservado1 = ''.padEnd(6, ' ');
  const reservado2 = ''.padEnd(1, ' ');
  const reservado3 = ''.padEnd(1, ' ');

  const linha = `${registro}${lote}${sequencia}${tipoOperacao}${formaLancamento}${layoutLote}${tipoInscricao}${inscricao}${codigoBanco}${agencia}${agenciaDigito}${conta}${contaDigito}${razaoSocial}${mensagem1}${numeroRemessa}${dataGeracao}${dataCredito}${reservado1}${reservado2}${reservado3}`;

  return linha.substring(0, 240);
}

/**
 * Gerar Detalhe do Lote (Registro 1300)
 */
function gerarDetalheSegmento(dados: DadosCNAB, funcionario: DadosCNAB['funcionarios'][0], sequencia: number): string {
  const registro = '1'; // Código do registro
  const lote = formatarNumero(1, 4);
  const sequenciaReg = formatarNumero(sequencia, 5);
  const codigoSegmento = 'A'; // Segmento A
  const reservado1 = ''.padEnd(1, ' ');
  const codigoMovimento = '01'; // 01 = Inclusão
  const codigoBancoDestino = formatarNumero(funcionario.banco.codigo, 3);
  const agenciaDestino = formatarNumero(funcionario.banco.agencia, 5);
  const agenciaDestinoDigito = '0';
  const contaDestino = formatarNumero(funcionario.banco.conta, 12);
  const contaDestinoDigito = funcionario.banco.digito;
  const nomeDestino = funcionario.nome.padEnd(30, ' ').substring(0, 30);
  const numeroDocumento = formatarNumero(limparCampo(funcionario.cpf), 15);
  const dataTransferencia = formatarData(dados.lote.dataGeracao);
  const tipoMoeda = '01'; // 01 = Real
  const quantidadeMoeda = '000000000000'; // Não usado para Real
  const valor = formatarNumero(Math.round(funcionario.valor * 100), 15);
  const numeroDocumentoEmpresa = formatarNumero(1, 15);
  const reservado2 = ''.padEnd(1, ' ');
  const indicadorFormaParcelamento = '0';
  const periodoParcelas = '00';
  const numeroParcelas = '00';
  const reservado3 = ''.padEnd(10, ' ');

  const linha = `${registro}${lote}${sequenciaReg}${codigoSegmento}${reservado1}${codigoMovimento}${codigoBancoDestino}${agenciaDestino}${agenciaDestinoDigito}${contaDestino}${contaDestinoDigito}${nomeDestino}${numeroDocumento}${dataTransferencia}${tipoMoeda}${quantidadeMoeda}${valor}${numeroDocumentoEmpresa}${reservado2}${indicadorFormaParcelamento}${periodoParcelas}${numeroParcelas}${reservado3}`;

  return linha.substring(0, 240);
}

/**
 * Gerar Trailer do Lote (Registro 5000)
 */
function gerarTrailerLote(dados: DadosCNAB, quantidadeRegistros: number, valorTotal: number): string {
  const registro = '5'; // Código do registro
  const lote = formatarNumero(1, 4);
  const sequencia = '00000';
  const quantidadeRegistrosLote = formatarNumero(quantidadeRegistros + 2, 6); // +2 (header e trailer)
  const quantidadeContas = formatarNumero(dados.funcionarios.length, 6);
  const valorTotalTransferencias = formatarNumero(Math.round(valorTotal * 100), 18);
  const valorTotalDescontos = '000000000000000000';
  const valorTotalAcrescimos = '000000000000000000';
  const quantidadeAvisos = '000000';
  const reservado = ''.padEnd(117, ' ');

  const linha = `${registro}${lote}${sequencia}${quantidadeRegistrosLote}${quantidadeContas}${valorTotalTransferencias}${valorTotalDescontos}${valorTotalAcrescimos}${quantidadeAvisos}${reservado}`;

  return linha.substring(0, 240);
}

/**
 * Gerar Trailer do Arquivo (Registro 9000)
 */
function gerarTrailerArquivo(quantidadeLotes: number, quantidadeRegistros: number, valorTotal: number): string {
  const registro = '9'; // Código do registro
  const lote = '9999';
  const sequencia = '00001';
  const quantidadeLotesArquivo = formatarNumero(quantidadeLotes, 6);
  const quantidadeRegistrosArquivo = formatarNumero(quantidadeRegistros + 4, 6); // +4 (header, trailer lote, trailer arquivo)
  const quantidadeContasLotes = formatarNumero(1, 6);
  const reservado = ''.padEnd(205, ' ');

  const linha = `${registro}${lote}${sequencia}${quantidadeLotesArquivo}${quantidadeRegistrosArquivo}${quantidadeContasLotes}${reservado}`;

  return linha.substring(0, 240);
}

/**
 * Gerar arquivo CNAB 240
 */
export function gerarCNAB240(dados: DadosCNAB): string {
  const linhas: string[] = [];

  // Header do arquivo
  linhas.push(gerarHeaderArquivo(dados));

  // Header do lote
  linhas.push(gerarHeaderLote(dados));

  // Detalhes (funcionários)
  let valorTotal = 0;
  dados.funcionarios.forEach((funcionario, index) => {
    linhas.push(gerarDetalheSegmento(dados, funcionario, index + 1));
    valorTotal += funcionario.valor;
  });

  // Trailer do lote
  linhas.push(gerarTrailerLote(dados, dados.funcionarios.length, valorTotal));

  // Trailer do arquivo
  linhas.push(gerarTrailerArquivo(1, dados.funcionarios.length, valorTotal));

  return linhas.join('\n');
}

/**
 * Gerar arquivo CNAB 240 a partir de dados de folha
 */
export function gerarCNABDeFolha(
  empresa: {
    cnpj: string;
    razaoSocial: string;
  },
  banco: {
    codigo: string;
    agencia: string;
    conta: string;
    digito: string;
  },
  funcionarios: Array<{
    nome: string;
    cpf: string;
    banco: {
      codigo: string;
      agencia: string;
      conta: string;
      digito: string;
    };
    salarioLiquido: number;
  }>
): string {
  const dados: DadosCNAB = {
    empresa,
    banco,
    lote: {
      numero: 1,
      dataGeracao: new Date(),
    },
    funcionarios: funcionarios.map((f) => ({
      nome: f.nome,
      cpf: f.cpf,
      banco: f.banco,
      valor: f.salarioLiquido,
    })),
  };

  return gerarCNAB240(dados);
}
