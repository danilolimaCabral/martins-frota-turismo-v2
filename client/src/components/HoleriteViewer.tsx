import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Printer, Mail, X } from 'lucide-react';

interface HoleriteData {
  funcionario: {
    nome: string;
    cpf: string;
    matricula: string;
    cargo: string;
    departamento: string;
    dataAdmissao: string;
    salarioBase: number;
  };
  empresa: {
    cnpj: string;
    razaoSocial: string;
    endereco: string;
    cidade: string;
    uf: string;
  };
  periodo: {
    mes: number;
    ano: number;
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

interface HoleriteViewerProps {
  data: HoleriteData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

const formatarData = (data: string | Date): string => {
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

const obterNomeMes = (mes: number): string => {
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
};

export const HoleriteViewer: React.FC<HoleriteViewerProps> = ({ data, open, onOpenChange }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const mesNome = obterNomeMes(data.periodo.mes);
  const periodoReferencia = `${mesNome}/${data.periodo.ano}`;

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownloadPDF = () => {
    // Implementar download em PDF
    alert('Funcionalidade de download em PDF será implementada');
  };

  const handleSendEmail = () => {
    // Implementar envio por email
    alert('Funcionalidade de envio por email será implementada');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Holerite - {periodoReferencia}</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* HEADER */}
          <div className="border-b-2 border-gray-800 pb-4 text-center">
            <h1 className="text-2xl font-bold">{data.empresa.razaoSocial}</h1>
            <p className="text-sm text-gray-600">CNPJ: {data.empresa.cnpj}</p>
            <p className="text-sm text-gray-600">
              {data.empresa.endereco}, {data.empresa.cidade} - {data.empresa.uf}
            </p>
          </div>

          {/* PERÍODO */}
          <div className="text-center">
            <p className="text-lg font-bold">HOLERITE - PERÍODO: {periodoReferencia}</p>
            <p className="text-sm text-gray-600">Emitido em: {formatarData(new Date())}</p>
          </div>

          {/* INFORMAÇÕES */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">DADOS DO FUNCIONÁRIO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Nome:</span>
                  <span>{data.funcionario.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">CPF:</span>
                  <span>{data.funcionario.cpf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Matrícula:</span>
                  <span>{data.funcionario.matricula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Cargo:</span>
                  <span>{data.funcionario.cargo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Departamento:</span>
                  <span>{data.funcionario.departamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Admissão:</span>
                  <span>{formatarData(data.funcionario.dataAdmissao)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">INFORMAÇÕES DO HOLERITE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Período:</span>
                  <span>{periodoReferencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Base INSS:</span>
                  <span>{formatarMoeda(data.baseINSS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Base IRRF:</span>
                  <span>{formatarMoeda(data.baseIRRF)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Proventos:</span>
                  <span className="font-bold text-green-600">{formatarMoeda(data.proventos.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Descontos:</span>
                  <span className="font-bold text-red-600">{formatarMoeda(data.descontos.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PROVENTOS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">PROVENTOS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {data.proventos.salarioBase > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Salário Base</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.salarioBase)}</span>
                  </div>
                )}
                {data.proventos.horasExtras50 > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Horas Extras 50%</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.horasExtras50)}</span>
                  </div>
                )}
                {data.proventos.horasExtras100 > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Horas Extras 100%</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.horasExtras100)}</span>
                  </div>
                )}
                {data.proventos.adicionais > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Adicionais</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.adicionais)}</span>
                  </div>
                )}
                {data.proventos.comissoes > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Comissões</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.comissoes)}</span>
                  </div>
                )}
                {data.proventos.bonus > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Bônus</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.bonus)}</span>
                  </div>
                )}
                {data.proventos.ferias > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Férias (1/3 adicional)</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.ferias)}</span>
                  </div>
                )}
                {data.proventos.decimoTerceiro > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>13º Salário</span>
                    <span className="font-mono">{formatarMoeda(data.proventos.decimoTerceiro)}</span>
                  </div>
                )}
                <div className="flex justify-between bg-gray-100 p-2 font-bold">
                  <span>TOTAL DE PROVENTOS</span>
                  <span className="font-mono text-green-600">{formatarMoeda(data.proventos.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DESCONTOS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">DESCONTOS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {data.descontos.inss > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>INSS</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.inss)}</span>
                  </div>
                )}
                {data.descontos.irrf > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>IRRF</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.irrf)}</span>
                  </div>
                )}
                {data.descontos.valeTransporte > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Vale Transporte</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.valeTransporte)}</span>
                  </div>
                )}
                {data.descontos.valeAlimentacao > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Vale Alimentação</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.valeAlimentacao)}</span>
                  </div>
                )}
                {data.descontos.contribuicaoSindical > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Contribuição Sindical</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.contribuicaoSindical)}</span>
                  </div>
                )}
                {data.descontos.pensaoAlimenticia > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Pensão Alimentícia</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.pensaoAlimenticia)}</span>
                  </div>
                )}
                {data.descontos.adiantamento > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span>Adiantamento</span>
                    <span className="font-mono">{formatarMoeda(data.descontos.adiantamento)}</span>
                  </div>
                )}
                <div className="flex justify-between bg-gray-100 p-2 font-bold">
                  <span>TOTAL DE DESCONTOS</span>
                  <span className="font-mono text-red-600">{formatarMoeda(data.descontos.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RESUMO */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 border-green-500 bg-green-50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-bold mb-2">TOTAL DE PROVENTOS</p>
                <p className="text-2xl font-bold text-green-600">{formatarMoeda(data.proventos.total)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-500 bg-red-50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-bold mb-2">TOTAL DE DESCONTOS</p>
                <p className="text-2xl font-bold text-red-600">{formatarMoeda(data.descontos.total)}</p>
              </CardContent>
            </Card>
          </div>

          {/* LÍQUIDO */}
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <p className="text-sm font-bold mb-2">LÍQUIDO A RECEBER</p>
              <p className="text-3xl font-bold text-blue-600">{formatarMoeda(data.liquido)}</p>
            </CardContent>
          </Card>

          {/* OBRIGAÇÕES DA EMPRESA */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">OBRIGAÇÕES DA EMPRESA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span>FGTS (8%)</span>
                  <span className="font-mono">{formatarMoeda(data.obrigacoesEmpresa.fgts)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Contribuição Patronal INSS (20%)</span>
                  <span className="font-mono">{formatarMoeda(data.obrigacoesEmpresa.contribuicaoPatronal)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>SAT - Seguro Acidentes (2%)</span>
                  <span className="font-mono">{formatarMoeda(data.obrigacoesEmpresa.sat)}</span>
                </div>
                <div className="flex justify-between bg-gray-200 p-2 font-bold">
                  <span>TOTAL DE OBRIGAÇÕES</span>
                  <span className="font-mono">{formatarMoeda(data.obrigacoesEmpresa.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AÇÕES */}
          <div className="flex gap-2 justify-end print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
