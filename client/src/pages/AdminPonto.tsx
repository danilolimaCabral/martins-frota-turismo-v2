import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Play, Square, Calendar, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminPonto() {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>("");
  const [modalRegistro, setModalRegistro] = useState(false);

  const { data: funcionarios } = trpc.funcionario.list.useQuery({});
  const dataInicio = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-01`;
  const dataFim = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-31`;
  
  const { data: registros, refetch } = trpc.ponto.list.useQuery({
    funcionarioId: funcionarioSelecionado ? parseInt(funcionarioSelecionado) : undefined,
    dataInicio,
    dataFim,
  });
  const { data: resumo } = trpc.ponto.getResumoMensal.useQuery({
    funcionarioId: funcionarioSelecionado ? parseInt(funcionarioSelecionado) : 0,
    mes: mesSelecionado,
    ano: anoSelecionado,
  }, { enabled: !!funcionarioSelecionado });

  const registrarMutation = trpc.ponto.registrar.useMutation({
    onSuccess: () => {
      refetch();
      setModalRegistro(false);
      alert("Ponto registrado com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleRegistrarPonto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dataHora = formData.get("dataHora") as string;
    const tipo = formData.get("tipo") as string;
    const data = dataHora.split('T')[0];
    const hora = dataHora.split('T')[1];
    
    registrarMutation.mutate({
      funcionarioId: parseInt(formData.get("funcionarioId") as string),
      data,
      entradaManha: tipo === "entrada" ? hora : undefined,
      saidaTarde: tipo === "saida" ? hora : undefined,
      observacoes: formData.get("observacoes") as string,
    });
  };

  const formatarHora = (data: string | Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatarData = (data: string | Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const calcularHorasTrabalhadas = (entrada: string | Date, saida: string | Date | null) => {
    if (!saida) return "-";
    const diff = new Date(saida).getTime() - new Date(entrada).getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Controle de Ponto
          </h1>
          <p className="text-muted-foreground">Registre e gerencie a jornada dos funcionários</p>
        </div>
        <Dialog open={modalRegistro} onOpenChange={setModalRegistro}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Registrar Ponto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Ponto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegistrarPonto} className="space-y-4">
              <div>
                <Label>Funcionário *</Label>
                <Select name="funcionarioId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios?.map((f: any) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select name="tipo" required defaultValue="entrada">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data/Hora *</Label>
                <Input 
                  name="dataHora" 
                  type="datetime-local" 
                  required 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label>Observações</Label>
                <Input name="observacoes" placeholder="Observações opcionais" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalRegistro(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={registrarMutation.isPending}>
                  {registrarMutation.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Funcionário</Label>
              <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {funcionarios?.map((f: any) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mês</Label>
              <Select value={mesSelecionado.toString()} onValueChange={(v) => setMesSelecionado(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2024, m-1).toLocaleDateString("pt-BR", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ano</Label>
              <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(a => (
                    <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Funcionário */}
      {funcionarioSelecionado && resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{resumo.totalRegistros || 0}</div>
              <p className="text-xs text-muted-foreground">Total Registros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{resumo.totalHorasTrabalhadas || "0h"}</div>
              <p className="text-xs text-muted-foreground">Horas Trabalhadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{resumo.totalHorasExtras50 || "0h"}</div>
              <p className="text-xs text-muted-foreground">Horas Extras 50%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{resumo.totalAtrasos || 0}</div>
              <p className="text-xs text-muted-foreground">Atrasos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registros de Ponto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!registros || registros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado para o período selecionado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro: any) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium">{registro.funcionarioNome || "-"}</TableCell>
                    <TableCell>{formatarData(registro.dataHora)}</TableCell>
                    <TableCell>
                      {registro.tipo === "entrada" ? (
                        <Badge variant="outline" className="gap-1">
                          <Play className="h-3 w-3" />
                          {formatarHora(registro.dataHora)}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {registro.tipo === "saida" ? (
                        <Badge variant="outline" className="gap-1">
                          <Square className="h-3 w-3" />
                          {formatarHora(registro.dataHora)}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{registro.horasTrabalhadas || "-"}</TableCell>
                    <TableCell>
                      {registro.atraso ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Atraso
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle className="h-3 w-3" />
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
