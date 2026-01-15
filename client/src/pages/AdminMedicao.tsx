import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Plus,
  Settings,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
} from "lucide-react";
import { trpc as trpcClient } from "@/lib/trpc";

function useAuth() {
  const { data: user } = trpcClient.localAuth.me.useQuery();
  return { user };
}

const TURNOS = [
  { value: "1turno", label: "1º Turno" },
  { value: "2turno", label: "2º Turno" },
  { value: "3turno", label: "3º Turno" },
  { value: "adm", label: "ADM" },
];

const TIPOS_VIAGEM = [
  { value: "entrada", label: "Entrada" },
  { value: "saida", label: "Saída" },
];

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function AdminMedicao() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Estado do período selecionado
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<any>(null);

  // Modais
  const [modalNovoPeriodo, setModalNovoPeriodo] = useState(false);
  const [modalConfigValores, setModalConfigValores] = useState(false);
  const [modalMarcarViagem, setModalMarcarViagem] = useState(false);

  // Dados do formulário de novo período
  const [novoPeriodoData, setNovoPeriodoData] = useState({
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
  });

  // Dados do formulário de marcação de viagem
  const [marcacaoData, setMarcacaoData] = useState<any>({
    data: "",
    diaSemana: "",
    turno: "1turno",
    vehicleTypeId: "",
    cityId: "",
    tipoViagem: "entrada",
    quantidade: 1,
    observacoes: "",
  });

  // Dados do formulário de configuração de valores
  const [configValorData, setConfigValorData] = useState({
    vehicleTypeId: "",
    cityId: "",
    turno: "1turno",
    valorViagem: 0,
    observacoes: "",
  });

  // Queries
  const { data: periodos, refetch: refetchPeriodos } = trpc.medicao.listPeriodos.useQuery();
  const { data: vehicleTypes } = trpc.medicao.listVehicleTypes.useQuery();
  const { data: cities } = trpc.medicao.listCities.useQuery();
  const { data: configuracoes, refetch: refetchConfiguracoes } = trpc.medicao.listConfiguracaoValores.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: viagens, refetch: refetchViagens } = trpc.medicao.listViagensPorPeriodo.useQuery(
    { periodoId: periodoSelecionado?.id },
    { enabled: !!periodoSelecionado }
  );

  // Mutations
  const createPeriodoMutation = trpc.medicao.createPeriodo.useMutation({
    onSuccess: () => {
      refetchPeriodos();
      setModalNovoPeriodo(false);
      alert("Período criado com sucesso!");
    },
  });

  const saveConfigValorMutation = trpc.medicao.saveConfiguracaoValor.useMutation({
    onSuccess: () => {
      refetchConfiguracoes();
      setModalConfigValores(false);
      alert("Configuração salva com sucesso!");
    },
  });

  const marcarViagemMutation = trpc.medicao.marcarViagem.useMutation({
    onSuccess: () => {
      refetchViagens();
      setModalMarcarViagem(false);
      alert("Viagem marcada com sucesso!");
    },
  });

  // Efeito para selecionar período automaticamente
  useEffect(() => {
    if (periodos && periodos.length > 0 && !periodoSelecionado) {
      const periodoAtual = periodos.find((p) => p.ano === anoAtual && p.mes === mesAtual);
      if (periodoAtual) {
        setPeriodoSelecionado(periodoAtual);
      } else {
        setPeriodoSelecionado(periodos[0]);
      }
    }
  }, [periodos, anoAtual, mesAtual, periodoSelecionado]);

  // Função para criar novo período
  const handleCriarPeriodo = () => {
    const dataInicio = new Date(novoPeriodoData.ano, novoPeriodoData.mes - 1, 1);
    const dataFim = new Date(novoPeriodoData.ano, novoPeriodoData.mes, 0);

    createPeriodoMutation.mutate({
      ano: novoPeriodoData.ano,
      mes: novoPeriodoData.mes,
      dataInicio: dataInicio.toISOString().split("T")[0],
      dataFim: dataFim.toISOString().split("T")[0],
    });
  };

  // Função para salvar configuração de valor
  const handleSalvarConfigValor = () => {
    if (!configValorData.vehicleTypeId || !configValorData.cityId) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    saveConfigValorMutation.mutate({
      vehicleTypeId: Number(configValorData.vehicleTypeId),
      cityId: Number(configValorData.cityId),
      turno: configValorData.turno,
      valorViagem: configValorData.valorViagem,
      observacoes: configValorData.observacoes,
    });
  };

  // Função para marcar viagem
  const handleMarcarViagem = () => {
    if (!marcacaoData.data || !marcacaoData.vehicleTypeId || !marcacaoData.cityId) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    marcarViagemMutation.mutate({
      periodoId: periodoSelecionado.id,
      data: marcacaoData.data,
      diaSemana: marcacaoData.diaSemana,
      turno: marcacaoData.turno,
      vehicleTypeId: Number(marcacaoData.vehicleTypeId),
      cityId: Number(marcacaoData.cityId),
      tipoViagem: marcacaoData.tipoViagem,
      quantidade: marcacaoData.quantidade,
      observacoes: marcacaoData.observacoes,
    });
  };

  // Função para abrir modal de marcação com data pré-selecionada
  const handleClickDia = (data: string) => {
    const date = new Date(data + "T12:00:00");
    const diaSemana = DIAS_SEMANA[date.getDay()];

    setMarcacaoData({
      ...marcacaoData,
      data,
      diaSemana,
    });
    setModalMarcarViagem(true);
  };

  // Gerar calendário do mês
  const gerarCalendario = () => {
    if (!periodoSelecionado) return [];

    const dataInicio = new Date(periodoSelecionado.dataInicio);
    const dataFim = new Date(periodoSelecionado.dataFim);
    const dias: any[] = [];

    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split("T")[0];
      const viagensDia = viagens?.filter((v) => v.data === dataStr) || [];

      dias.push({
        data: dataStr,
        diaSemana: DIAS_SEMANA[d.getDay()],
        viagens: viagensDia,
      });
    }

    return dias;
  };

  const calendario = gerarCalendario();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Botão Voltar */}
      <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")} className="mb-4">
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </Button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Medição de Viagens Extras
          </h1>
          <p className="text-muted-foreground">Controle de viagens extras por turno e período</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Dialog open={modalConfigValores} onOpenChange={setModalConfigValores}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configurar Valores
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configuração de Valores</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Veículo</Label>
                        <Select
                          value={configValorData.vehicleTypeId}
                          onValueChange={(value) => setConfigValorData({ ...configValorData, vehicleTypeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes?.map((vt) => (
                              <SelectItem key={vt.id} value={String(vt.id)}>
                                {vt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cidade</Label>
                        <Select
                          value={configValorData.cityId}
                          onValueChange={(value) => setConfigValorData({ ...configValorData, cityId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities?.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Turno</Label>
                        <Select
                          value={configValorData.turno}
                          onValueChange={(value) => setConfigValorData({ ...configValorData, turno: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TURNOS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor por Viagem (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={configValorData.valorViagem}
                          onChange={(e) => setConfigValorData({ ...configValorData, valorViagem: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={configValorData.observacoes}
                        onChange={(e) => setConfigValorData({ ...configValorData, observacoes: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSalvarConfigValor} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configuração
                    </Button>

                    {/* Lista de configurações existentes */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Configurações Ativas</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Veículo</TableHead>
                            <TableHead>Cidade</TableHead>
                            <TableHead>Turno</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {configuracoes?.map((config) => (
                            <TableRow key={config.id}>
                              <TableCell>{config.vehicleTypeName}</TableCell>
                              <TableCell>{config.cityName}</TableCell>
                              <TableCell>{TURNOS.find((t) => t.value === config.turno)?.label}</TableCell>
                              <TableCell>R$ {Number(config.valorViagem).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={modalNovoPeriodo} onOpenChange={setModalNovoPeriodo}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Período
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Período</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ano</Label>
                        <Input
                          type="number"
                          value={novoPeriodoData.ano}
                          onChange={(e) => setNovoPeriodoData({ ...novoPeriodoData, ano: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Mês</Label>
                        <Select
                          value={String(novoPeriodoData.mes)}
                          onValueChange={(value) => setNovoPeriodoData({ ...novoPeriodoData, mes: Number(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                              <SelectItem key={mes} value={String(mes)}>
                                {new Date(2000, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleCriarPeriodo} className="w-full">
                      Criar Período
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Seletor de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Período Selecionado</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const periodoIndex = periodos?.findIndex((p) => p.id === periodoSelecionado?.id) || 0;
                  if (periodoIndex > 0 && periodos) {
                    setPeriodoSelecionado(periodos[periodoIndex - 1]);
                  }
                }}
                disabled={!periodos || periodos.findIndex((p) => p.id === periodoSelecionado?.id) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold">
                {periodoSelecionado
                  ? `${new Date(2000, periodoSelecionado.mes - 1, 1).toLocaleDateString("pt-BR", {
                      month: "long",
                    })} ${periodoSelecionado.ano}`
                  : "Nenhum período selecionado"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const periodoIndex = periodos?.findIndex((p) => p.id === periodoSelecionado?.id) || 0;
                  if (periodos && periodoIndex < periodos.length - 1) {
                    setPeriodoSelecionado(periodos[periodoIndex + 1]);
                  }
                }}
                disabled={
                  !periodos ||
                  periodos.findIndex((p) => p.id === periodoSelecionado?.id) === periodos.length - 1
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Calendário de Marcações */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Viagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Cabeçalho dos dias da semana */}
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="text-center font-semibold p-2 bg-muted rounded">
                {dia}
              </div>
            ))}

            {/* Dias do mês */}
            {calendario.map((dia) => (
              <div
                key={dia.data}
                className="border rounded p-2 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleClickDia(dia.data)}
              >
                <div className="text-sm font-semibold mb-1">
                  {new Date(dia.data + "T12:00:00").getDate()}
                </div>
                <div className="space-y-1">
                  {dia.viagens.slice(0, 3).map((viagem: any, idx: number) => (
                    <div key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 p-1 rounded">
                      {viagem.quantidade}x {viagem.vehicleTypeName?.substring(0, 10)}
                    </div>
                  ))}
                  {dia.viagens.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dia.viagens.length - 3} mais</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Marcação de Viagem */}
      <Dialog open={modalMarcarViagem} onOpenChange={setModalMarcarViagem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Viagem - {marcacaoData.data}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Turno</Label>
                <Select value={marcacaoData.turno} onValueChange={(value) => setMarcacaoData({ ...marcacaoData, turno: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TURNOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Viagem</Label>
                <Select
                  value={marcacaoData.tipoViagem}
                  onValueChange={(value) => setMarcacaoData({ ...marcacaoData, tipoViagem: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VIAGEM.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Veículo</Label>
                <Select
                  value={marcacaoData.vehicleTypeId}
                  onValueChange={(value) => setMarcacaoData({ ...marcacaoData, vehicleTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes?.map((vt) => (
                      <SelectItem key={vt.id} value={String(vt.id)}>
                        {vt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Select
                  value={marcacaoData.cityId}
                  onValueChange={(value) => setMarcacaoData({ ...marcacaoData, cityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Quantidade de Veículos</Label>
              <Input
                type="number"
                min="0"
                value={marcacaoData.quantidade}
                onChange={(e) => setMarcacaoData({ ...marcacaoData, quantidade: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={marcacaoData.observacoes}
                onChange={(e) => setMarcacaoData({ ...marcacaoData, observacoes: e.target.value })}
              />
            </div>
            <Button onClick={handleMarcarViagem} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Marcação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
