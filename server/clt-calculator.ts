/**
 * Calculadora de Impostos e Direitos CLT 2026
 * Parametrizada e flexível para cálculos de folha de pagamento
 */

export interface ParametrosINSS {
  aliquota1: number; // Até R$ 1.412,00
  aliquota2: number; // R$ 1.412,01 a R$ 2.666,68
  aliquota3: number; // R$ 2.666,69 a R$ 4.000,03
  aliquota4: number; // R$ 4.000,04 a R$ 7.786,02
  aliquotaMaxima: number; // Acima de R$ 7.786,02
  faixas: Array<{ limite: number; aliquota: number }>;
}

export interface ParametrosIRRF {
  faixas: Array<{
    limite: number;
    aliquota: number;
    deducao: number;
  }>;
  deducaoSimplificada: number;
}

export interface ParametrosCLT {
  inss: ParametrosINSS;
  irrf: ParametrosIRRF;
  fgts: number; // 8%
  valeTransporte: number; // Até 6%
  valeAlimentacao: number; // Variável
  contribuicaoSindical: number; // Março
  aliquotaPatronal: number; // 20%
  sat: number; // 1-3%
}

export interface DadosFuncionario {
  nome: string;
  cpf: string;
  salarioBase: number;
  horasExtras50?: number;
  horasExtras100?: number;
  adicionalNoturno?: number;
  adicionalPericulosidade?: number;
  adicionalInsalubridade?: number;
  comissoes?: number;
  bonus?: number;
  valeTransporte?: number;
  valeAlimentacao?: number;
  descontoValeTransporte?: boolean;
  descontoValeAlimentacao?: boolean;
  contribuicaoSindical?: boolean;
  pensaoAlimenticia?: number;
  adiantamento?: number;
  mesReferencia: number; // 1-12
  anoReferencia: number;
  diasTrabalhados: number; // Para cálculo proporcional
  emFerias?: boolean;
  diasFerias?: number;
  recebeDecimo?: boolean;
}

export interface ResultadoCalculoFolha {
  funcionario: {
    nome: string;
    cpf: string;
  };
  proventos: {
    salarioBase: number;
    horasExtras50: number;
    horasExtras100: number;
    adicionais: number;
    comissoes: number;
    bonus: number;
    ferias: number;
    decimoTerceiro: number;
    total: number;
  };
  descontos: {
    inss: number;
    irrf: number;
    valeTransporte: number;
    valeAlimentacao: number;
    contribuicaoSindical: number;
    pensaoAlimenticia: number;
    adiantamento: number;
    total: number;
  };
  obrigacoesEmpresa: {
    fgts: number;
    contribuicaoPatronal: number;
    sat: number;
    total: number;
  };
  liquido: number;
  baseINSS: number;
  baseIRRF: number;
}

export class CLTCalculator {
  private parametros: ParametrosCLT;

  constructor(parametros?: Partial<ParametrosCLT>) {
    // Valores padrão 2026
    this.parametros = {
      inss: {
        aliquota1: 0.075,
        aliquota2: 0.09,
        aliquota3: 0.12,
        aliquota4: 0.14,
        aliquotaMaxima: 0.14,
        faixas: [
          { limite: 1412.00, aliquota: 0.075 },
          { limite: 2666.68, aliquota: 0.09 },
          { limite: 4000.03, aliquota: 0.12 },
          { limite: 7786.02, aliquota: 0.14 },
          { limite: Infinity, aliquota: 0.14 },
        ],
      },
      irrf: {
        faixas: [
          { limite: 2428.80, aliquota: 0, deducao: 0 },
          { limite: 3751.48, aliquota: 0.075, deducao: 182.16 },
          { limite: 4664.68, aliquota: 0.15, deducao: 468.84 },
          { limite: 5597.48, aliquota: 0.225, deducao: 817.17 },
          { limite: Infinity, aliquota: 0.275, deducao: 1206.80 },
        ],
        deducaoSimplificada: 607.20,
      },
      fgts: 0.08,
      valeTransporte: 0.06,
      valeAlimentacao: 0.2, // 20% de desconto
      contribuicaoSindical: 1, // 1 dia de salário
      aliquotaPatronal: 0.2,
      sat: 0.02, // 2% médio
      ...parametros,
    };
  }

  /**
   * Calcula INSS progressivo
   */
  calcularINSS(salarioBruto: number): number {
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

  /**
   * Calcula IRRF sobre base (salário bruto - INSS)
   */
  calcularIRRF(base: number, usarDeducaoSimplificada = false): number {
    if (usarDeducaoSimplificada) {
      const irrf = base * 0.15 - this.parametros.irrf.deducaoSimplificada;
      return Math.max(0, Math.round(irrf * 100) / 100);
    }

    for (const faixa of this.parametros.irrf.faixas) {
      if (base <= faixa.limite) {
        const irrf = base * faixa.aliquota - faixa.deducao;
        return Math.max(0, Math.round(irrf * 100) / 100);
      }
    }

    return 0;
  }

  /**
   * Calcula férias (salário + 1/3)
   */
  calcularFerias(salarioBase: number, diasFerias = 30): number {
    const valorDia = salarioBase / 30;
    return Math.round((valorDia * diasFerias + (valorDia * diasFerias) / 3) * 100) / 100;
  }

  /**
   * Calcula 13º salário proporcional
   */
  calcularDecimo(salarioBase: number, mesesTrabalhados: number): number {
    return Math.round((salarioBase / 12) * mesesTrabalhados * 100) / 100;
  }

  /**
   * Calcula valor de hora extra
   */
  calcularHoraExtra(salarioBase: number, horas: number, percentual = 0.5): number {
    const valorHora = salarioBase / 220; // 220 horas/mês
    return Math.round(valorHora * horas * (1 + percentual) * 100) / 100;
  }

  /**
   * Calcula adicional noturno
   */
  calcularAdicionalNoturno(salarioBase: number, horasNoturnas: number): number {
    const valorHora = salarioBase / 220;
    return Math.round(valorHora * horasNoturnas * 0.2 * 100) / 100;
  }

  /**
   * Calcula adicional de periculosidade (30%)
   */
  calcularPericulosidade(salarioBase: number): number {
    return Math.round(salarioBase * 0.3 * 100) / 100;
  }

  /**
   * Calcula adicional de insalubridade
   */
  calcularInsalubridade(salarioBase: number, grau: 'minimo' | 'medio' | 'maximo' = 'minimo'): number {
    const aliquotas = {
      minimo: 0.1,
      medio: 0.2,
      maximo: 0.4,
    };
    return Math.round(salarioBase * aliquotas[grau] * 100) / 100;
  }

  /**
   * Calcula desconto de vale transporte (até 6%)
   */
  calcularDescontoValeTransporte(salarioBase: number): number {
    return Math.round(salarioBase * this.parametros.valeTransporte * 100) / 100;
  }

  /**
   * Calcula desconto de vale alimentação
   */
  calcularDescontoValeAlimentacao(valorVale: number): number {
    return Math.round(valorVale * this.parametros.valeAlimentacao * 100) / 100;
  }

  /**
   * Calcula FGTS (8% - depósito da empresa)
   */
  calcularFGTS(salarioBase: number): number {
    return Math.round(salarioBase * this.parametros.fgts * 100) / 100;
  }

  /**
   * Calcula contribuição patronal ao INSS (20%)
   */
  calcularContribuicaoPatronal(salarioBase: number): number {
    return Math.round(salarioBase * this.parametros.aliquotaPatronal * 100) / 100;
  }

  /**
   * Calcula SAT (Seguro de Acidentes do Trabalho)
   */
  calcularSAT(salarioBase: number): number {
    return Math.round(salarioBase * this.parametros.sat * 100) / 100;
  }

  /**
   * Calcula folha de pagamento completa
   */
  calcularFolha(dados: DadosFuncionario): ResultadoCalculoFolha {
    // PROVENTOS
    const salarioBase = dados.salarioBase;
    const horasExtras50 = dados.horasExtras50
      ? this.calcularHoraExtra(salarioBase, dados.horasExtras50, 0.5)
      : 0;
    const horasExtras100 = dados.horasExtras100
      ? this.calcularHoraExtra(salarioBase, dados.horasExtras100, 1.0)
      : 0;

    let adicionais = 0;
    if (dados.adicionalNoturno) {
      adicionais += this.calcularAdicionalNoturno(salarioBase, dados.adicionalNoturno);
    }
    if (dados.adicionalPericulosidade) {
      adicionais += this.calcularPericulosidade(salarioBase);
    }
    if (dados.adicionalInsalubridade) {
      adicionais += this.calcularInsalubridade(salarioBase, 'minimo');
    }

    const comissoes = dados.comissoes || 0;
    const bonus = dados.bonus || 0;

    // Férias e 13º
    const ferias = dados.emFerias ? this.calcularFerias(salarioBase, dados.diasFerias || 30) : 0;
    const decimoTerceiro = dados.recebeDecimo
      ? this.calcularDecimo(salarioBase, dados.mesReferencia)
      : 0;

    const totalProventos = salarioBase + horasExtras50 + horasExtras100 + adicionais + comissoes + bonus + ferias + decimoTerceiro;

    // DESCONTOS
    const baseINSS = totalProventos;
    const inss = this.calcularINSS(baseINSS);
    const baseIRRF = baseINSS - inss;
    const irrf = this.calcularIRRF(baseIRRF);

    let descontoValeTransporte = 0;
    if (dados.descontoValeTransporte && dados.valeTransporte) {
      descontoValeTransporte = Math.min(
        this.calcularDescontoValeTransporte(salarioBase),
        dados.valeTransporte
      );
    }

    let descontoValeAlimentacao = 0;
    if (dados.descontoValeAlimentacao && dados.valeAlimentacao) {
      descontoValeAlimentacao = Math.min(
        this.calcularDescontoValeAlimentacao(dados.valeAlimentacao),
        dados.valeAlimentacao
      );
    }

    const contribuicaoSindical = dados.contribuicaoSindical ? salarioBase : 0;
    const pensaoAlimenticia = dados.pensaoAlimenticia || 0;
    const adiantamento = dados.adiantamento || 0;

    const totalDescontos =
      inss +
      irrf +
      descontoValeTransporte +
      descontoValeAlimentacao +
      contribuicaoSindical +
      pensaoAlimenticia +
      adiantamento;

    // OBRIGAÇÕES DA EMPRESA
    const fgts = this.calcularFGTS(salarioBase);
    const contribuicaoPatronal = this.calcularContribuicaoPatronal(salarioBase);
    const sat = this.calcularSAT(salarioBase);

    const totalObrigacoes = fgts + contribuicaoPatronal + sat;

    // LÍQUIDO
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
        adicionais,
        comissoes,
        bonus,
        ferias,
        decimoTerceiro,
        total: totalProventos,
      },
      descontos: {
        inss,
        irrf,
        valeTransporte: descontoValeTransporte,
        valeAlimentacao: descontoValeAlimentacao,
        contribuicaoSindical,
        pensaoAlimenticia,
        adiantamento,
        total: totalDescontos,
      },
      obrigacoesEmpresa: {
        fgts,
        contribuicaoPatronal,
        sat,
        total: totalObrigacoes,
      },
      liquido,
      baseINSS,
      baseIRRF,
    };
  }

  /**
   * Atualiza parâmetros
   */
  atualizarParametros(novoParametros: Partial<ParametrosCLT>) {
    this.parametros = {
      ...this.parametros,
      ...novoParametros,
    };
  }

  /**
   * Retorna parâmetros atuais
   */
  obterParametros(): ParametrosCLT {
    return this.parametros;
  }
}
