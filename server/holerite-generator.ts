/**
 * Gerador de Holerite (Contracheque)
 * Gera holerite em HTML e PDF
 */

import { ResultadoCalculoFolha } from './clt-calculator';

export interface DadosEmpresaHolerite {
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
}

export interface DadosFuncionarioHolerite {
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  dataAdmissao: Date;
  salarioBase: number;
}

export interface DadosHolerite {
  empresa: DadosEmpresaHolerite;
  funcionario: DadosFuncionarioHolerite;
  calculo: ResultadoCalculoFolha;
  mesReferencia: number;
  anoReferencia: number;
  dataEmissao: Date;
  sequencialHolerite?: number;
  observacoes?: string;
}

export class HoleriteGenerator {
  /**
   * Formata valor monetário
   */
  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  /**
   * Formata data
   */
  private formatarData(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(data);
  }

  /**
   * Retorna nome do mês
   */
  private obterNomeMes(mes: number): string {
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

  /**
   * Gera holerite em HTML
   */
  gerarHTML(dados: DadosHolerite): string {
    const mesNome = this.obterNomeMes(dados.mesReferencia);
    const periodoReferencia = `${mesNome}/${dados.anoReferencia}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Holerite - ${dados.funcionario.nome}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header .empresa-info {
            font-size: 12px;
            color: #666;
        }
        
        .periodo {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 12px;
        }
        
        .info-box {
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
        }
        
        .info-box h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .info-label {
            font-weight: bold;
            width: 50%;
        }
        
        .info-value {
            text-align: right;
            width: 50%;
        }
        
        .table-section {
            margin-bottom: 30px;
        }
        
        .table-section h3 {
            font-size: 13px;
            font-weight: bold;
            background-color: #e8e8e8;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #999;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 20px;
        }
        
        table th {
            background-color: #f0f0f0;
            border: 1px solid #999;
            padding: 8px;
            text-align: left;
            font-weight: bold;
        }
        
        table td {
            border: 1px solid #999;
            padding: 8px;
            text-align: left;
        }
        
        table td.valor {
            text-align: right;
            font-family: 'Courier New', monospace;
        }
        
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .resumo {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .resumo-box {
            border: 2px solid #333;
            padding: 15px;
            text-align: center;
        }
        
        .resumo-box h4 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .resumo-valor {
            font-size: 18px;
            font-weight: bold;
            color: #2ecc71;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 30px;
        }
        
        .observacoes {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            margin-top: 20px;
            font-size: 11px;
        }
        
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                border: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>${dados.empresa.razaoSocial}</h1>
            <div class="empresa-info">
                <p>CNPJ: ${dados.empresa.cnpj}</p>
                <p>${dados.empresa.endereco}, ${dados.empresa.cidade} - ${dados.empresa.uf}</p>
            </div>
        </div>
        
        <!-- PERÍODO -->
        <div class="periodo">
            HOLERITE - PERÍODO: ${periodoReferencia}
        </div>
        
        <!-- INFORMAÇÕES FUNCIONÁRIO E EMPRESA -->
        <div class="info-grid">
            <div class="info-box">
                <h3>DADOS DO FUNCIONÁRIO</h3>
                <div class="info-row">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${dados.funcionario.nome}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CPF:</span>
                    <span class="info-value">${dados.funcionario.cpf}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Matrícula:</span>
                    <span class="info-value">${dados.funcionario.matricula}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cargo:</span>
                    <span class="info-value">${dados.funcionario.cargo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Departamento:</span>
                    <span class="info-value">${dados.funcionario.departamento}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Admissão:</span>
                    <span class="info-value">${this.formatarData(dados.funcionario.dataAdmissao)}</span>
                </div>
            </div>
            
            <div class="info-box">
                <h3>INFORMAÇÕES DO HOLERITE</h3>
                <div class="info-row">
                    <span class="info-label">Período:</span>
                    <span class="info-value">${periodoReferencia}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Data Emissão:</span>
                    <span class="info-value">${this.formatarData(dados.dataEmissao)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sequencial:</span>
                    <span class="info-value">${dados.sequencialHolerite || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Base INSS:</span>
                    <span class="info-value">${this.formatarMoeda(dados.calculo.baseINSS)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Base IRRF:</span>
                    <span class="info-value">${this.formatarMoeda(dados.calculo.baseIRRF)}</span>
                </div>
            </div>
        </div>
        
        <!-- PROVENTOS -->
        <div class="table-section">
            <h3>PROVENTOS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th style="text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.calculo.proventos.salarioBase > 0 ? `
                    <tr>
                        <td>Salário Base</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.salarioBase)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.horasExtras50 > 0 ? `
                    <tr>
                        <td>Horas Extras 50%</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.horasExtras50)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.horasExtras100 > 0 ? `
                    <tr>
                        <td>Horas Extras 100%</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.horasExtras100)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.adicionais > 0 ? `
                    <tr>
                        <td>Adicionais (Noturno/Periculosidade/Insalubridade)</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.adicionais)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.comissoes > 0 ? `
                    <tr>
                        <td>Comissões</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.comissoes)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.bonus > 0 ? `
                    <tr>
                        <td>Bônus</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.bonus)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.ferias > 0 ? `
                    <tr>
                        <td>Férias (1/3 adicional)</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.ferias)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.proventos.decimoTerceiro > 0 ? `
                    <tr>
                        <td>13º Salário</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.decimoTerceiro)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>TOTAL DE PROVENTOS</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.proventos.total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- DESCONTOS -->
        <div class="table-section">
            <h3>DESCONTOS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th style="text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.calculo.descontos.inss > 0 ? `
                    <tr>
                        <td>INSS</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.inss)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.irrf > 0 ? `
                    <tr>
                        <td>IRRF</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.irrf)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.valeTransporte > 0 ? `
                    <tr>
                        <td>Vale Transporte</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.valeTransporte)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.valeAlimentacao > 0 ? `
                    <tr>
                        <td>Vale Alimentação</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.valeAlimentacao)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.contribuicaoSindical > 0 ? `
                    <tr>
                        <td>Contribuição Sindical</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.contribuicaoSindical)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.pensaoAlimenticia > 0 ? `
                    <tr>
                        <td>Pensão Alimentícia</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.pensaoAlimenticia)}</td>
                    </tr>
                    ` : ''}
                    ${dados.calculo.descontos.adiantamento > 0 ? `
                    <tr>
                        <td>Adiantamento</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.adiantamento)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>TOTAL DE DESCONTOS</td>
                        <td class="valor">${this.formatarMoeda(dados.calculo.descontos.total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- RESUMO -->
        <div class="resumo">
            <div class="resumo-box">
                <h4>TOTAL DE PROVENTOS</h4>
                <div class="resumo-valor">${this.formatarMoeda(dados.calculo.proventos.total)}</div>
            </div>
            <div class="resumo-box">
                <h4>TOTAL DE DESCONTOS</h4>
                <div class="resumo-valor" style="color: #e74c3c;">${this.formatarMoeda(dados.calculo.descontos.total)}</div>
            </div>
        </div>
        
        <div class="resumo">
            <div class="resumo-box" style="grid-column: 1 / -1;">
                <h4>LÍQUIDO A RECEBER</h4>
                <div class="resumo-valor" style="font-size: 24px; color: #27ae60;">${this.formatarMoeda(dados.calculo.liquido)}</div>
            </div>
        </div>
        
        <!-- OBSERVAÇÕES -->
        ${dados.observacoes ? `
        <div class="observacoes">
            <strong>Observações:</strong> ${dados.observacoes}
        </div>
        ` : ''}
        
        <!-- FOOTER -->
        <div class="footer">
            <p>Este documento foi gerado automaticamente pelo sistema de folha de pagamento.</p>
            <p>Emitido em: ${this.formatarData(new Date())}</p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Gera holerite em texto simples (para email)
   */
  gerarTexto(dados: DadosHolerite): string {
    const mesNome = this.obterNomeMes(dados.mesReferencia);
    const periodoReferencia = `${mesNome}/${dados.anoReferencia}`;

    let texto = '';
    texto += `\n${'='.repeat(80)}\n`;
    texto += `${dados.empresa.razaoSocial.padEnd(80)}\n`;
    texto += `CNPJ: ${dados.empresa.cnpj}\n`;
    texto += `${dados.empresa.endereco}, ${dados.empresa.cidade} - ${dados.empresa.uf}\n`;
    texto += `${'='.repeat(80)}\n\n`;

    texto += `HOLERITE - PERÍODO: ${periodoReferencia}\n`;
    texto += `Data de Emissão: ${this.formatarData(dados.dataEmissao)}\n\n`;

    texto += `DADOS DO FUNCIONÁRIO:\n`;
    texto += `Nome: ${dados.funcionario.nome}\n`;
    texto += `CPF: ${dados.funcionario.cpf}\n`;
    texto += `Matrícula: ${dados.funcionario.matricula}\n`;
    texto += `Cargo: ${dados.funcionario.cargo}\n`;
    texto += `Departamento: ${dados.funcionario.departamento}\n`;
    texto += `Data de Admissão: ${this.formatarData(dados.funcionario.dataAdmissao)}\n\n`;

    texto += `${'─'.repeat(80)}\n`;
    texto += `PROVENTOS\n`;
    texto += `${'─'.repeat(80)}\n`;

    if (dados.calculo.proventos.salarioBase > 0) {
      texto += `Salário Base${' '.repeat(60)}${this.formatarMoeda(dados.calculo.proventos.salarioBase).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.horasExtras50 > 0) {
      texto += `Horas Extras 50%${' '.repeat(56)}${this.formatarMoeda(dados.calculo.proventos.horasExtras50).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.horasExtras100 > 0) {
      texto += `Horas Extras 100%${' '.repeat(55)}${this.formatarMoeda(dados.calculo.proventos.horasExtras100).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.adicionais > 0) {
      texto += `Adicionais${' '.repeat(62)}${this.formatarMoeda(dados.calculo.proventos.adicionais).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.comissoes > 0) {
      texto += `Comissões${' '.repeat(63)}${this.formatarMoeda(dados.calculo.proventos.comissoes).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.bonus > 0) {
      texto += `Bônus${' '.repeat(67)}${this.formatarMoeda(dados.calculo.proventos.bonus).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.ferias > 0) {
      texto += `Férias (1/3 adicional)${' '.repeat(51)}${this.formatarMoeda(dados.calculo.proventos.ferias).padStart(15)}\n`;
    }
    if (dados.calculo.proventos.decimoTerceiro > 0) {
      texto += `13º Salário${' '.repeat(61)}${this.formatarMoeda(dados.calculo.proventos.decimoTerceiro).padStart(15)}\n`;
    }

    texto += `${'─'.repeat(80)}\n`;
    texto += `TOTAL DE PROVENTOS${' '.repeat(55)}${this.formatarMoeda(dados.calculo.proventos.total).padStart(15)}\n`;
    texto += `${'─'.repeat(80)}\n\n`;

    texto += `${'─'.repeat(80)}\n`;
    texto += `DESCONTOS\n`;
    texto += `${'─'.repeat(80)}\n`;

    if (dados.calculo.descontos.inss > 0) {
      texto += `INSS${' '.repeat(68)}${this.formatarMoeda(dados.calculo.descontos.inss).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.irrf > 0) {
      texto += `IRRF${' '.repeat(68)}${this.formatarMoeda(dados.calculo.descontos.irrf).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.valeTransporte > 0) {
      texto += `Vale Transporte${' '.repeat(57)}${this.formatarMoeda(dados.calculo.descontos.valeTransporte).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.valeAlimentacao > 0) {
      texto += `Vale Alimentação${' '.repeat(56)}${this.formatarMoeda(dados.calculo.descontos.valeAlimentacao).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.contribuicaoSindical > 0) {
      texto += `Contribuição Sindical${' '.repeat(51)}${this.formatarMoeda(dados.calculo.descontos.contribuicaoSindical).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.pensaoAlimenticia > 0) {
      texto += `Pensão Alimentícia${' '.repeat(54)}${this.formatarMoeda(dados.calculo.descontos.pensaoAlimenticia).padStart(15)}\n`;
    }
    if (dados.calculo.descontos.adiantamento > 0) {
      texto += `Adiantamento${' '.repeat(60)}${this.formatarMoeda(dados.calculo.descontos.adiantamento).padStart(15)}\n`;
    }

    texto += `${'─'.repeat(80)}\n`;
    texto += `TOTAL DE DESCONTOS${' '.repeat(55)}${this.formatarMoeda(dados.calculo.descontos.total).padStart(15)}\n`;
    texto += `${'─'.repeat(80)}\n\n`;

    texto += `${'='.repeat(80)}\n`;
    texto += `LÍQUIDO A RECEBER${' '.repeat(56)}${this.formatarMoeda(dados.calculo.liquido).padStart(15)}\n`;
    texto += `${'='.repeat(80)}\n\n`;

    if (dados.observacoes) {
      texto += `OBSERVAÇÕES: ${dados.observacoes}\n\n`;
    }

    texto += `Emitido em: ${this.formatarData(new Date())}\n`;
    texto += `Este documento foi gerado automaticamente pelo sistema de folha de pagamento.\n`;

    return texto;
  }
}
