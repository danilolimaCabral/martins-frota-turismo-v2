import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, ChevronLeft, ChevronRight, DollarSign, Bus, User, MapPin, Clock , ArrowLeft } from "lucide-react";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-yellow-500",
  confirmado: "bg-blue-500",
  em_andamento: "bg-green-500",
  concluido: "bg-gray-500",
  cancelado: "bg-red-500",
};

const TIPO_SERVICO_LABELS: Record<string, string> = {
  viagem: "Viagem",
  especial: "Especial",
  fretamento: "Fretamento",
  transfer: "Transfer",
  excursao: "Excursão",
};

export default function AdminAgenda() {
  const [, setLocation] = useLocation();
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalNovoEvento, setModalNovoEvento] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  const { data: eventos, refetch } = trpc.agenda.list.useQuery({ mes: mesAtual, ano: anoAtual });
  const { data: stats } = trpc.agenda.getStats.useQuery({ mes: mesAtual, ano: anoAtual });
  const { data: veiculos } = trpc.agenda.getVeiculosDisponiveis.useQuery();
  const { data: motoristas } = trpc.agenda.getMotoristasDisponiveis.useQuery();

  const createMutation = trpc.agenda.create.useMutation({
    onSuccess: () => {
      refetch();
      setModalNovoEvento(false);
      alert("Evento criado com sucesso!");
    },
  });

  const updateMutation = trpc.agenda.update.useMutation({
    onSuccess: () => {
      refetch();
      setModalAberto(false);
      alert("Evento atualizado!");
    },
  });

  // Gerar dias do calendário
  const diasDoMes = useMemo(() => {
    const primeiroDia = new Date(anoAtual, mesAtual - 1, 1);
    const ultimoDia = new Date(anoAtual, mesAtual, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const dias: { dia: number | null; eventos: any[] }[] = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push({ dia: null, eventos: [] });
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const eventosNoDia = eventos?.filter(e => {
        const dataEvento = new Date(e.dataInicio);
        return dataEvento.getDate() === dia;
      }) || [];
      dias.push({ dia, eventos: eventosNoDia });
    }
    
    return dias;
  }, [mesAtual, anoAtual, eventos]);

  const navegarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    let novoAno = anoAtual;
    
    if (novoMes > 12) {
      novoMes = 1;
      novoAno++;
    } else if (novoMes < 1) {
      novoMes = 12;
      novoAno--;
    }
    
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const handleNovoEvento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      titulo: formData.get("titulo") as string,
      descricao: formData.get("descricao") as string,
      tipoServico: formData.get("tipoServico") as any,
      dataInicio: formData.get("dataInicio") as string,
      dataFim: formData.get("dataFim") as string,
      clienteNome: formData.get("clienteNome") as string,
      clienteTelefone: formData.get("clienteTelefone") as string,
      clienteEmail: formData.get("clienteEmail") as string,
      veiculoId: formData.get("veiculoId") ? parseInt(formData.get("veiculoId") as string) : undefined,
      motoristaId: formData.get("motoristaId") ? parseInt(formData.get("motoristaId") as string) : undefined,
      valorTotal: formData.get("valorTotal") ? parseFloat(formData.get("valorTotal") as string) : undefined,
      enderecoOrigem: formData.get("enderecoOrigem") as string,
      enderecoDestino: formData.get("enderecoDestino") as string,
      observacoes: formData.get("observacoes") as string,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Agenda de Compromissos
          </h1>
          <p className="text-muted-foreground">Gerencie viagens, eventos e compromissos</p>
        </div>
        <Dialog open={modalNovoEvento} onOpenChange={setModalNovoEvento}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNovoEvento} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Título *</Label>
                  <Input name="titulo" required placeholder="Ex: Viagem São Paulo - Rio" />
                </div>
                <div>
                  <Label>Tipo de Serviço</Label>
                  <Select name="tipoServico" defaultValue="viagem">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viagem">Viagem</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                      <SelectItem value="fretamento">Fretamento</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="excursao">Excursão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input name="valorTotal" type="number" step="0.01" placeholder="0,00" />
                </div>
                <div>
                  <Label>Data/Hora Início *</Label>
                  <Input name="dataInicio" type="datetime-local" required 
                    defaultValue={diaSelecionado ? `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}T08:00` : undefined}
                  />
                </div>
                <div>
                  <Label>Data/Hora Fim *</Label>
                  <Input name="dataFim" type="datetime-local" required 
                    defaultValue={diaSelecionado ? `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}T18:00` : undefined}
                  />
                </div>
                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-semibold mb-2">Dados do Cliente</h4>
                </div>
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input name="clienteNome" placeholder="Nome completo" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input name="clienteTelefone" placeholder="(00) 00000-0000" />
                </div>
                <div className="col-span-2">
                  <Label>E-mail</Label>
                  <Input name="clienteEmail" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-semibold mb-2">Localização</h4>
                </div>
                <div>
                  <Label>Endereço de Origem</Label>
                  <Input name="enderecoOrigem" placeholder="Endereço de partida" />
                </div>
                <div>
                  <Label>Endereço de Destino</Label>
                  <Input name="enderecoDestino" placeholder="Endereço de chegada" />
                </div>
                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-semibold mb-2">Recursos</h4>
                </div>
                <div>
                  <Label>Veículo</Label>
                  <Select name="veiculoId">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculos?.map(v => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.model} - {v.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Motorista</Label>
                  <Select name="motoristaId">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas?.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Descrição / Observações</Label>
                  <Textarea name="descricao" placeholder="Detalhes adicionais sobre o evento..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalNovoEvento(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Criar Evento"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.totalEventos || 0}</div>
            <p className="text-xs text-muted-foreground">Total de Eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.eventosConfirmados || 0}</div>
            <p className="text-xs text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              R$ {(stats?.valorRecebido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor Recebido</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              R$ {(stats?.valorPendente || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor Pendente</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendário */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navegarMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">
              {MESES[mesAtual - 1]} {anoAtual}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => navegarMes(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => {
            setMesAtual(new Date().getMonth() + 1);
            setAnoAtual(new Date().getFullYear());
          }}>
            Hoje
          </Button>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="text-center font-semibold text-sm py-2 text-muted-foreground">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {diasDoMes.map((item, index) => (
              <div
                key={index}
                className={`min-h-24 border rounded-lg p-1 ${
                  item.dia ? "bg-card hover:bg-accent/50 cursor-pointer" : "bg-muted/30"
                } ${item.dia === new Date().getDate() && mesAtual === new Date().getMonth() + 1 && anoAtual === new Date().getFullYear() ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  if (item.dia) {
                    setDiaSelecionado(item.dia);
                    if (item.eventos.length === 0) {
                      setModalNovoEvento(true);
                    }
                  }
                }}
              >
                {item.dia && (
                  <>
                    <div className="text-sm font-medium mb-1">{item.dia}</div>
                    <div className="space-y-1">
                      {item.eventos.slice(0, 3).map(evento => (
                        <div
                          key={evento.id}
                          className={`text-xs p-1 rounded truncate text-white ${STATUS_COLORS[evento.status]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEventoSelecionado(evento);
                            setModalAberto(true);
                          }}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      {item.eventos.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{item.eventos.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Evento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{eventoSelecionado?.titulo}</DialogTitle>
          </DialogHeader>
          {eventoSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[eventoSelecionado.status]}>
                  {eventoSelecionado.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {TIPO_SERVICO_LABELS[eventoSelecionado.tipoServico]}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Início</p>
                    <p>{new Date(eventoSelecionado.dataInicio).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fim</p>
                    <p>{new Date(eventoSelecionado.dataFim).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
              
              {eventoSelecionado.clienteNome && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cliente</p>
                    <p>{eventoSelecionado.clienteNome}</p>
                    {eventoSelecionado.clienteTelefone && <p className="text-muted-foreground">{eventoSelecionado.clienteTelefone}</p>}
                  </div>
                </div>
              )}
              
              {(eventoSelecionado.enderecoOrigem || eventoSelecionado.enderecoDestino) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Trajeto</p>
                    <p>{eventoSelecionado.enderecoOrigem} → {eventoSelecionado.enderecoDestino}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Valores</p>
                  <p>Total: R$ {parseFloat(eventoSelecionado.valorTotal || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-green-600">Pago: R$ {parseFloat(eventoSelecionado.valorPago || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              {eventoSelecionado.descricao && (
                <div>
                  <p className="font-medium">Observações</p>
                  <p className="text-muted-foreground">{eventoSelecionado.descricao}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Select
                  value={eventoSelecionado.status}
                  onValueChange={(value) => {
                    updateMutation.mutate({ id: eventoSelecionado.id, status: value as any });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setModalAberto(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
