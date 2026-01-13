#!/usr/bin/env node

/**
 * Script para gerar arquivo CNAB 240 para pagamento de folha de pagamento
 * Uso: node generate-cnab.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dados da empresa (Martins Turismo)
const dadosEmpresa = {
  cnpj: '12345678000190',
  razaoSocial: 'MARTINS TURISMO LTDA',
  endereco: 'Rua das Flores, 123',
  cidade: 'CURITIBA',
  uf: 'PR',
  cep: '80000000'
};

// Dados bancários (Banco do Brasil)
const dadosBancarios = {
  codigoBanco: '001',
  agencia: '1234',
  conta: '123456',
  digitoConta: '7'
};

// Funcionários para pagamento
const funcionarios = [
  {
    nome: 'JOAO SILVA SANTOS',
    cpf: '12345678901',
    agencia: '5678',
    conta: '654321',
    digitoConta: '1',
    valor: 4500.00,
    tipoConta: 'CC'
  },
  {
    nome: 'FERNANDA ALVES',
    cpf: '89012345678',
    agencia: '5678',
    conta: '654322',
    digitoConta: '2',
    valor: 2200.00,
    tipoConta: 'CC'
  },
  {
    nome: 'ROBERTO CARLOS SOUZA',
    cpf: '78901234567',
    agencia: '5678',
    conta: '654323',
    digitoConta: '3',
    valor: 4200.00,
    tipoConta: 'CC'
  },
  {
    nome: 'JULIANA FERNANDES',
    cpf: '67890123456',
    agencia: '5678',
    conta: '654324',
    digitoConta: '4',
    valor: 1800.00,
    tipoConta: 'CC'
  },
  {
    nome: 'PEDRO HENRIQUE LIMA',
    cpf: '56789012345',
    agencia: '5678',
    conta: '654325',
    digitoConta: '5',
    valor: 3000.00,
    tipoConta: 'CC'
  }
];

class CNABGenerator {
  constructor() {
    this.linhas = [];
    this.sequencialRegistro = 1;
    this.sequencialLote = 1;
  }

  padRight(str, length, char = ' ') {
    return (str + char.repeat(length)).substring(0, length);
  }

  padLeft(str, length, char = '0') {
    return (char.repeat(length) + str).substring(str.length, str.length + length);
  }

  formatarValor(valor, length = 15) {
    const valorCentavos = Math.round(valor * 100);
    return this.padLeft(valorCentavos.toString(), length, '0');
  }

  formatarData(data) {
    const dia = this.padLeft(data.getDate().toString(), 2, '0');
    const mes = this.padLeft((data.getMonth() + 1).toString(), 2, '0');
    const ano = data.getFullYear().toString();
    return dia + mes + ano;
  }

  formatarHora(data) {
    const hora = this.padLeft(data.getHours().toString(), 2, '0');
    const minuto = this.padLeft(data.getMinutes().toString(), 2, '0');
    const segundo = this.padLeft(data.getSeconds().toString(), 2, '0');
    return hora + minuto + segundo;
  }

  limparDocumento(doc) {
    return doc.replace(/[^\d]/g, '');
  }

  gerarHeaderArquivo(dataGeracao) {
    let linha = '';

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, '0');
    // Posição 004-007: Lote de Serviço
    linha += this.padLeft('0000', 4, '0');
    // Posição 008-008: Tipo de Registro (0 = Header)
    linha += '0';
    // Posição 009-009: Uso Exclusivo FEBRABAN
    linha += ' ';
    // Posição 010-010: Tipo de Inscrição da Empresa (1 = CPF, 2 = CNPJ)
    linha += '2';
    // Posição 011-025: CNPJ da Empresa
    linha += this.padLeft(this.limparDocumento(dadosEmpresa.cnpj), 15, '0');
    // Posição 026-031: Código do Convênio
    linha += this.padLeft('0', 6, '0');
    // Posição 032-036: Agência
    linha += this.padLeft(dadosBancarios.agencia, 5, '0');
    // Posição 037-037: DV Agência
    linha += ' ';
    // Posição 038-047: Conta
    linha += this.padLeft(dadosBancarios.conta, 10, '0');
    // Posição 048-048: DV Conta
    linha += dadosBancarios.digitoConta;
    // Posição 049-049: DV Agência/Conta
    linha += ' ';
    // Posição 050-071: Nome da Empresa
    linha += this.padRight(dadosEmpresa.razaoSocial, 22);
    // Posição 072-094: Nome do Banco
    linha += this.padRight('BANCO DO BRASIL', 23);
    // Posição 095-100: Data de Geração
    linha += this.formatarData(dataGeracao);
    // Posição 101-106: Hora de Geração
    linha += this.formatarHora(dataGeracao);
    // Posição 107-112: NSA - Número Seqüencial do Arquivo
    linha += this.padLeft('1', 6, '0');
    // Posição 113-115: Versão do Layout
    linha += this.padLeft('090', 3, '0');
    // Posição 116-120: Tamanho do Registro
    linha += this.padLeft('240', 5, '0');
    // Posição 121-122: Densidade de Gravação
    linha += this.padLeft('00', 2, '0');
    // Posição 123-240: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 118);

    return linha;
  }

  gerarHeaderLote(dataGeracao) {
    let linha = '';

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, '0');
    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, '0');
    // Posição 008-008: Tipo de Registro (1 = Header de Lote)
    linha += '1';
    // Posição 009-009: Tipo de Operação (C = Crédito)
    linha += 'C';
    // Posição 010-011: Forma de Pagamento (01 = Crédito em Conta Corrente)
    linha += this.padLeft('01', 2, '0');
    // Posição 012-013: Layout do Lote
    linha += this.padLeft('00', 2, '0');
    // Posição 014-014: Uso Exclusivo FEBRABAN
    linha += ' ';
    // Posição 015-015: Tipo de Inscrição da Empresa
    linha += '2';
    // Posição 016-030: CNPJ da Empresa
    linha += this.padLeft(this.limparDocumento(dadosEmpresa.cnpj), 15, '0');
    // Posição 031-036: Código do Convênio
    linha += this.padLeft('0', 6, '0');
    // Posição 037-041: Agência
    linha += this.padLeft(dadosBancarios.agencia, 5, '0');
    // Posição 042-042: DV Agência
    linha += ' ';
    // Posição 043-052: Conta
    linha += this.padLeft(dadosBancarios.conta, 10, '0');
    // Posição 053-053: DV Conta
    linha += dadosBancarios.digitoConta;
    // Posição 054-054: DV Agência/Conta
    linha += ' ';
    // Posição 055-076: Nome da Empresa
    linha += this.padRight(dadosEmpresa.razaoSocial, 22);
    // Posição 077-096: Informação 1
    linha += this.padRight('FOLHA DE PAGAMENTO', 20);
    // Posição 097-116: Informação 2
    linha += this.padRight('', 20);
    // Posição 117-122: Data de Geração
    linha += this.formatarData(dataGeracao);
    // Posição 123-128: Data do Crédito
    linha += this.formatarData(new Date(dataGeracao.getTime() + 2 * 24 * 60 * 60 * 1000)); // +2 dias
    // Posição 129-135: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 7);
    // Posição 136-240: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 105);

    return linha;
  }

  gerarRegistroDetalhe(funcionario, sequencial) {
    let linha = '';

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, '0');
    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, '0');
    // Posição 008-008: Tipo de Registro (3 = Detalhe)
    linha += '3';
    // Posição 009-013: Número Seqüencial do Registro
    linha += this.padLeft(sequencial.toString(), 5, '0');
    // Posição 014-014: Código de Segmento (A = Segmento A)
    linha += 'A';
    // Posição 015-015: Uso Exclusivo FEBRABAN
    linha += ' ';
    // Posição 016-016: Código de Movimento Remessa (0 = Inclusão)
    linha += '0';
    // Posição 017-021: Agência Destino
    linha += this.padLeft(funcionario.agencia, 5, '0');
    // Posição 022-022: DV Agência
    linha += ' ';
    // Posição 023-032: Conta Destino
    linha += this.padLeft(funcionario.conta, 10, '0');
    // Posição 033-033: DV Conta
    linha += funcionario.digitoConta;
    // Posição 034-034: DV Agência/Conta
    linha += ' ';
    // Posição 035-035: Tipo de Conta (1 = Conta Corrente)
    linha += '1';
    // Posição 036-036: Tipo de Inscrição do Favorecido (1 = CPF, 2 = CNPJ)
    linha += '1';
    // Posição 037-051: CPF do Favorecido
    linha += this.padLeft(this.limparDocumento(funcionario.cpf), 15, '0');
    // Posição 052-073: Nome do Favorecido
    linha += this.padRight(funcionario.nome, 22);
    // Posição 074-088: Número da Referência
    linha += this.padLeft('', 15);
    // Posição 089-103: Valor do Pagamento
    linha += this.formatarValor(funcionario.valor);
    // Posição 104-110: Nosso Número
    linha += this.padLeft('', 7);
    // Posição 111-111: Tipo de Inscrição da Empresa Beneficiária
    linha += ' ';
    // Posição 112-126: CNPJ/CPF da Empresa Beneficiária
    linha += this.padLeft('', 15);
    // Posição 127-147: Logradouro
    linha += this.padRight('', 21);
    // Posição 148-151: Número
    linha += this.padLeft('', 4);
    // Posição 152-171: Complemento
    linha += this.padRight('', 20);
    // Posição 172-191: Bairro
    linha += this.padRight('', 20);
    // Posição 192-199: CEP
    linha += this.padLeft('', 8);
    // Posição 200-214: Complemento do Registro
    linha += this.padRight('', 15);
    // Posição 215-240: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 26);

    return linha;
  }

  gerarTrailerLote(totalRegistros, valorTotal) {
    let linha = '';

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, '0');
    // Posição 004-007: Lote de Serviço
    linha += this.padLeft(this.sequencialLote.toString(), 4, '0');
    // Posição 008-008: Tipo de Registro (5 = Trailer de Lote)
    linha += '5';
    // Posição 009-017: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 9);
    // Posição 018-023: Quantidade de Registros do Lote
    linha += this.padLeft((totalRegistros + 2).toString(), 6, '0'); // Header + Detalhes + Trailer
    // Posição 024-041: Soma dos Valores
    linha += this.formatarValor(valorTotal, 18);
    // Posição 042-059: Soma das Quantidades
    linha += this.padLeft('0', 18, '0');
    // Posição 060-077: Quantidade de Aviso de Débito
    linha += this.padLeft('0', 18, '0');
    // Posição 078-095: Soma dos Valores de Aviso
    linha += this.padLeft('0', 18, '0');
    // Posição 096-240: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 145);

    return linha;
  }

  gerarTrailerArquivo(totalLotes, totalRegistros, valorTotal) {
    let linha = '';

    // Posição 001-003: Código do Banco
    linha += this.padLeft(dadosBancarios.codigoBanco, 3, '0');
    // Posição 004-007: Lote de Serviço
    linha += this.padLeft('9999', 4, '0');
    // Posição 008-008: Tipo de Registro (9 = Trailer de Arquivo)
    linha += '9';
    // Posição 009-017: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 9);
    // Posição 018-023: Quantidade de Lotes
    linha += this.padLeft(totalLotes.toString(), 6, '0');
    // Posição 024-029: Quantidade de Registros
    linha += this.padLeft(totalRegistros.toString(), 6, '0');
    // Posição 030-240: Uso Exclusivo FEBRABAN
    linha += this.padRight('', 211);

    return linha;
  }

  gerar(dataGeracao = new Date()) {
    // Header do Arquivo
    this.linhas.push(this.gerarHeaderArquivo(dataGeracao));

    // Header do Lote
    this.linhas.push(this.gerarHeaderLote(dataGeracao));

    // Registros de Detalhe
    let totalValor = 0;
    funcionarios.forEach((func, index) => {
      this.linhas.push(this.gerarRegistroDetalhe(func, index + 1));
      totalValor += func.valor;
    });

    // Trailer do Lote
    this.linhas.push(this.gerarTrailerLote(funcionarios.length, totalValor));

    // Trailer do Arquivo
    this.linhas.push(this.gerarTrailerArquivo(1, this.linhas.length + 1, totalValor));

    return this.linhas.join('\n');
  }
}

// Gerar arquivo
const generator = new CNABGenerator();
const conteudoCNAB = generator.gerar();

// Salvar arquivo
const caminhoSaida = path.join(__dirname, 'CNAB240_FOLHA_PAGAMENTO.txt');
fs.writeFileSync(caminhoSaida, conteudoCNAB, 'utf-8');

console.log('✅ Arquivo CNAB 240 gerado com sucesso!');
console.log(`📁 Caminho: ${caminhoSaida}`);
console.log(`📊 Funcionários processados: ${funcionarios.length}`);
console.log(`💰 Valor total: R$ ${funcionarios.reduce((acc, f) => acc + f.valor, 0).toFixed(2)}`);
console.log(`📝 Linhas geradas: ${conteudoCNAB.split('\n').length}`);
