#!/usr/bin/env node

/**
 * Script para gerar holerite de teste
 * Uso: node generate-holerite-teste.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simulação da classe CLTCalculator
class CLTCalculator {
  constructor(parametros = {}) {
    this.parametros = {
      inss: {
        faixas: [
          { limite: 1412.0, aliquota: 0.075 },
          { limite: 2666.68, aliquota: 0.09 },
          { limite: 4000.03, aliquota: 0.12 },
          { limite: 7786.02, aliquota: 0.14 },
          { limite: Infinity, aliquota: 0.14 },
        ],
      },
      irrf: {
        faixas: [
          { limite: 2428.8, aliquota: 0, deducao: 0 },
          { limite: 3751.48, aliquota: 0.075, deducao: 182.16 },
          { limite: 4664.68, aliquota: 0.15, deducao: 468.84 },
          { limite: 5597.48, aliquota: 0.225, deducao: 817.17 },
          { limite: Infinity, aliquota: 0.275, deducao: 1206.8 },
        ],
      },
      fgts: 0.08,
      valeTransporte: 0.06,
      ...parametros,
    };
  }

  calcularINSS(salarioBruto) {
    let inss = 0;
    let saldoCalcular = salarioBruto;
    let limiteAnterior = 0;

    for (const faixa of this.parametros.inss.faixas) {
      if (saldoCalcular <= 0) break;
      const valorFaixa = Math.min(saldoCalcular, faixa.limite - limiteAnterior);
      inss += valorFaixa * faixa.aliquota;
      saldoCalcular -= valorFaixa;
      limiteAnterior = faixa.limite;
    }

    return Math.round(inss * 100) / 100;
  }

  calcularIRRF(base) {
    for (const faixa of this.parametros.irrf.faixas) {
      if (base <= faixa.limite) {
        const irrf = base * faixa.aliquota - faixa.deducao;
        return Math.max(0, Math.round(irrf * 100) / 100);
      }
    }
    return 0;
  }

  calcularFolha(dados) {
    const salarioBase = dados.salarioBase;
    const horasExtras50 = dados.horasExtras50 || 0;
    const horasExtras100 = dados.horasExtras100 || 0;

    const totalProventos = salarioBase + horasExtras50 + horasExtras100;
    const baseINSS = totalProventos;
    const inss = this.calcularINSS(baseINSS);
    const baseIRRF = baseINSS - inss;
    const irrf = this.calcularIRRF(baseIRRF);
    const valeTransporte = Math.min(200, salarioBase * 0.06);

    const totalDescontos = inss + irrf + valeTransporte;
    const liquido = totalProventos - totalDescontos;

    return {
      funcionario: {
        nome: dados.nome,
        cpf: dados.cpf,
      },
      proventos: {
        salarioBase,
        horasExtras50,
        horasExtras100,
        adicionais: 0,
        comissoes: 0,
        bonus: 0,
        ferias: 0,
        decimoTerceiro: 0,
        total: totalProventos,
      },
      descontos: {
        inss,
        irrf,
        valeTransporte,
        valeAlimentacao: 0,
        contribuicaoSindical: 0,
        pensaoAlimenticia: 0,
        adiantamento: 0,
        total: totalDescontos,
      },
      obrigacoesEmpresa: {
        fgts: Math.round(salarioBase * 0.08 * 100) / 100,
        contribuicaoPatronal: Math.round(salarioBase * 0.2 * 100) / 100,
        sat: Math.round(salarioBase * 0.02 * 100) / 100,
        total: Math.round(salarioBase * (0.08 + 0.2 + 0.02) * 100) / 100,
      },
      liquido,
      baseINSS,
      baseIRRF,
    };
  }
}

// Simulação da classe HoleriteGenerator
class HoleriteGenerator {
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR').format(data);
  }

  obterNomeMes(mes) {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return meses[mes - 1];
  }

  gerarHTML(dados) {
    const mesNome = this.obterNomeMes(dados.mesReferencia);
    const periodoReferencia = `${mesNome}/${dados.anoReferencia}`;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Holerite - ${dados.funcionario.nome}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background-color: white; padding: 40px; border: 1px solid #ddd; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .periodo { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 12px; }
        .info-box { border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; }
        .info-box h3 { font-size: 12px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .table-section { margin-bottom: 30px; }
        .table-section h3 { font-size: 13px; font-weight: bold; background-color: #e8e8e8; padding: 8px; margin-bottom: 10px; border: 1px solid #999; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
        table th { background-color: #f0f0f0; border: 1px solid #999; padding: 8px; text-align: left; font-weight: bold; }
        table td { border: 1px solid #999; padding: 8px; text-align: left; }
        table td.valor { text-align: right; font-family: 'Courier New', monospace; }
        .total-row { background-color: #f0f0f0; font-weight: bold; }
        .resumo { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .resumo-box { border: 2px solid #333; padding: 15px; text-align: center; }
        .resumo-valor { font-size: 18px; font-weight: bold; color: #2ecc71; }
        .footer { text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px; }
        @media print { body { background-color: white; padding: 0; } .container { box-shadow: none; border: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${dados.empresa.razaoSocial}</h1>
            <div>CNPJ: ${dados.empresa.cnpj}</div>
        </div>
        
        <div class="periodo">HOLERITE - PERÍODO: ${periodoReferencia}</div>
        
        <div class="info-grid">
            <div class="info-box">
                <h3>DADOS DO FUNCIONÁRIO</h3>
                <div class="info-row"><span>Nome:</span><span>${dados.funcionario.nome}</span></div>
                <div class="info-row"><span>CPF:</span><span>${dados.funcionario.cpf}</span></div>
                <div class="info-row"><span>Matrícula:</span><span>${dados.funcionario.matricula}</span></div>
                <div class="info-row"><span>Cargo:</span><span>${dados.funcionario.cargo}</span></div>
            </div>
            <div class="info-box">
                <h3>INFORMAÇÕES DO HOLERITE</h3>
                <div class="info-row"><span>Período:</span><span>${periodoReferencia}</span></div>
                <div class="info-row"><span>Data Emissão:</span><span>${this.formatarData(dados.dataEmissao)}</span></div>
                <div class="info-row"><span>Base INSS:</span><span>${this.formatarMoeda(dados.calculo.baseINSS)}</span></div>
                <div class="info-row"><span>Base IRRF:</span><span>${this.formatarMoeda(dados.calculo.baseIRRF)}</span></div>
            </div>
        </div>
        
        <div class="table-section">
            <h3>PROVENTOS</h3>
            <table>
                <thead><tr><th>Descrição</th><th style="text-align: right;">Valor</th></tr></thead>
                <tbody>
                    <tr><td>Salário Base</td><td class="valor">${this.formatarMoeda(dados.calculo.proventos.salarioBase)}</td></tr>
                    ${dados.calculo.proventos.horasExtras50 > 0 ? `<tr><td>Horas Extras 50%</td><td class="valor">${this.formatarMoeda(dados.calculo.proventos.horasExtras50)}</td></tr>` : ''}
                    ${dados.calculo.proventos.horasExtras100 > 0 ? `<tr><td>Horas Extras 100%</td><td class="valor">${this.formatarMoeda(dados.calculo.proventos.horasExtras100)}</td></tr>` : ''}
                    <tr class="total-row"><td>TOTAL DE PROVENTOS</td><td class="valor">${this.formatarMoeda(dados.calculo.proventos.total)}</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="table-section">
            <h3>DESCONTOS</h3>
            <table>
                <thead><tr><th>Descrição</th><th style="text-align: right;">Valor</th></tr></thead>
                <tbody>
                    <tr><td>INSS</td><td class="valor">${this.formatarMoeda(dados.calculo.descontos.inss)}</td></tr>
                    <tr><td>IRRF</td><td class="valor">${this.formatarMoeda(dados.calculo.descontos.irrf)}</td></tr>
                    <tr><td>Vale Transporte</td><td class="valor">${this.formatarMoeda(dados.calculo.descontos.valeTransporte)}</td></tr>
                    <tr class="total-row"><td>TOTAL DE DESCONTOS</td><td class="valor">${this.formatarMoeda(dados.calculo.descontos.total)}</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="resumo">
            <div class="resumo-box"><h4>TOTAL DE PROVENTOS</h4><div class="resumo-valor">${this.formatarMoeda(dados.calculo.proventos.total)}</div></div>
            <div class="resumo-box"><h4>TOTAL DE DESCONTOS</h4><div class="resumo-valor" style="color: #e74c3c;">${this.formatarMoeda(dados.calculo.descontos.total)}</div></div>
        </div>
        
        <div class="resumo">
            <div class="resumo-box" style="grid-column: 1 / -1;">
                <h4>LÍQUIDO A RECEBER</h4>
                <div class="resumo-valor" style="font-size: 24px; color: #27ae60;">${this.formatarMoeda(dados.calculo.liquido)}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Este documento foi gerado automaticamente pelo sistema de folha de pagamento.</p>
            <p>Emitido em: ${this.formatarData(new Date())}</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

// Dados de teste
const dadosEmpresa = {
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'MARTINS TURISMO LTDA',
  endereco: 'Rua das Flores, 123',
  cidade: 'CURITIBA',
  uf: 'PR',
  cep: '80000000',
};

const dadosFuncionario = {
  nome: 'JOÃO SILVA SANTOS',
  cpf: '123.456.789-01',
  matricula: '00001',
  cargo: 'Gerente Administrativo',
  departamento: 'Administrativo',
  dataAdmissao: new Date('2020-01-15'),
  salarioBase: 4500.0,
};

// Gerar cálculo
const calculator = new CLTCalculator();
const calculo = calculator.calcularFolha({
  nome: dadosFuncionario.nome,
  cpf: dadosFuncionario.cpf,
  salarioBase: dadosFuncionario.salarioBase,
  horasExtras50: 10,
  horasExtras100: 0,
});

// Gerar holerite
const generator = new HoleriteGenerator();
const html = generator.gerarHTML({
  empresa: dadosEmpresa,
  funcionario: dadosFuncionario,
  calculo,
  mesReferencia: 1,
  anoReferencia: 2026,
  dataEmissao: new Date(),
  sequencialHolerite: 1,
  observacoes: 'Holerite de teste gerado automaticamente',
});

// Salvar arquivo
const caminhoSaida = path.join(__dirname, 'HOLERITE_TESTE_JOAO_SILVA.html');
fs.writeFileSync(caminhoSaida, html, 'utf-8');

console.log('✅ Holerite de teste gerado com sucesso!');
console.log(`📁 Caminho: ${caminhoSaida}`);
console.log(`👤 Funcionário: ${dadosFuncionario.nome}`);
console.log(`💰 Salário Base: R$ ${dadosFuncionario.salarioBase.toFixed(2)}`);
console.log(`📊 Total de Proventos: R$ ${calculo.proventos.total.toFixed(2)}`);
console.log(`📉 Total de Descontos: R$ ${calculo.descontos.total.toFixed(2)}`);
console.log(`💵 Líquido a Receber: R$ ${calculo.liquido.toFixed(2)}`);
console.log(`\n📄 Abra o arquivo em um navegador para visualizar o holerite formatado.`);
