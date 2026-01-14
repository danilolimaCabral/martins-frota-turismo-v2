import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Plus, Upload, Route, Play, Trash2, Eye, Users, Clock, Navigation, Map, Zap, TrendingUp , ArrowLeft } from "lucide-react";
import { MapView } from "@/components/Map";
import { toast } from "sonner";

interface Rota {
  id: number;
  nome: string;
  descricao: string;
  status: "rascunho" | "otimizada" | "ativa" | "concluida";
  distancia_maxima_usuario: number;
  tempo_maximo_rota: number;
  distancia_total: number;
  pontos_embarque: string;
  motorista?: string;
  veiculo?: string;
  data_saida?: string;
  data_chegada?: string;
}

interface PontoEmbarque {
  id: number;
  nome: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  ordem: number;
  distancia_anterior?: number;
  tempo_anterior?: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  rascunho: { bg: "bg-gray-100", text: "text-gray-800" },
  otimizada: { bg: "bg-blue-100", text: "text-blue-800" },
  ativa: { bg: "bg-green-100", text: "text-green-800" },
  concluida: { bg: "bg-purple-100", text: "text-purple-800" },
};

export default function AdminRoteirizacaoMelhorado() {
  const [, setLocation] = useLocation();
  const [rotas, setRotas] = useState<Rota[]>([
    {
      id: 1,
      nome: "Fretamento Empresa XYZ",
      descricao: "Rota para empresa de tecnologia",
      status: "ativa",
      distancia_maxima_usuario: 1.5,
      tempo_maximo_rota: 120,
      distancia_total: 45.8,
      pontos_embarque: JSON.stringify([
        { id: 1, nome: "Ponto A", endereco: "Av. Paulista, 1000", ordem: 1 },
        { id: 2, nome: "Ponto B", endereco: "Rua Augusta, 2000", ordem: 2 },
        { id: 3, nome: "Ponto C", endereco: "Av. Brasil, 3000", ordem: 3 },
      ]),
      motorista: "João Silva",
      veiculo: "Van Executiva 01",
      data_saida: "2024-01-14 08:00",
      data_chegada: "2024-01-14 10:30",
    },
    {
      id: 2,
      nome: "Fretamento Empresa ABC",
      descricao: "Rota para empresa financeira",
      status: "otimizada",
      distancia_maxima_usuario: 2.0,
      tempo_maximo_rota: 150,
      distancia_total: 52.3,
      pontos_embarque: JSON.stringify([
        { id: 1, nome: "Ponto D", endereco: "Av. Faria Lima, 500", ordem: 1 },
        { id: 2, nome: "Ponto E", endereco: "Rua Bandeira, 1500", ordem: 2 },
      ]),
      motorista: "Maria Santos",
      veiculo: "Ônibus Turismo 02",
    },
  ]);

  const [rotaSelecionada, setRotaSelecionada] = useState<Rota | null>(rotas[0]);
  const [modalNovaRota, setModalNovaRota] = useState(false);
  const [modalEnderecos, setModalEnderecos] = useState(false);
  const [enderecosTexto, setEnderecosTexto] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    distanciaMaxima: "1.5",
    tempoMaximo: "120",
  });

  const handleNovaRota = (e: React.FormEvent) => {
    e.preventDefault();
    const novaRota: Rota = {
      id: Math.max(...rotas.map(r => r.id), 0) + 1,
      nome: formData.nome,
      descricao: formData.descricao,
      status: "rascunho",
      distancia_maxima_usuario: parseFloat(formData.distanciaMaxima),
      tempo_maximo_rota: parseInt(formData.tempoMaximo),
      distancia_total: 0,
      pontos_embarque: JSON.stringify([]),
    };
    setRotas([...rotas, novaRota]);
    setRotaSelecionada(novaRota);
    setFormData({ nome: "", descricao: "", distanciaMaxima: "1.5", tempoMaximo: "120" });
    setModalNovaRota(false);
    toast.success("Rota criada com sucesso!");
  };

  const handleAdicionarEnderecos = () => {
    if (!rotaSelecionada || !enderecosTexto.trim()) {
      toast.error("Preencha os endereços");
      return;
    }

    const linhas = enderecosTexto.split("\n").filter(l => l.trim());
    const novosEnderecos = linhas.map((linha, idx) => {
      const partes = linha.split(/[,;\t]/);
      return {
        id: idx + 1,
        nome: partes[0]?.trim() || `Ponto ${idx + 1}`,
        endereco: partes[1]?.trim() || "",
        ordem: idx + 1,
      };
    }).filter(e => e.endereco);

    const rotaAtualizada = {
      ...rotaSelecionada,
      pontos_embarque: JSON.stringify(novosEnderecos),
    };

    setRotas(rotas.map(r => r.id === rotaSelecionada.id ? rotaAtualizada : r));
    setRotaSelecionada(rotaAtualizada);
    setEnderecosTexto("");
    setModalEnderecos(false);
    toast.success(`${novosEnderecos.length} endereços adicionados!`);
  };

  const handleOtimizar = () => {
    if (!rotaSelecionada) return;

    const rotaAtualizada = {
      ...rotaSelecionada,
      status: "otimizada" as const,
      distancia_total: Math.random() * 50 + 30,
    };

    setRotas(rotas.map(r => r.id === rotaSelecionada.id ? rotaAtualizada : r));
    setRotaSelecionada(rotaAtualizada);
    toast.success("Rota otimizada com sucesso!");
  };

  const handleIniciar = () => {
    if (!rotaSelecionada) return;

    const rotaAtualizada = {
      ...rotaSelecionada,
      status: "ativa" as const,
      data_saida: new Date().toLocaleString("pt-BR"),
    };

    setRotas(rotas.map(r => r.id === rotaSelecionada.id ? rotaAtualizada : r));
    setRotaSelecionada(rotaAtualizada);
    toast.success("Rota iniciada!");
  };

  const handleConcluir = () => {
    if (!rotaSelecionada) return;

    const rotaAtualizada = {
      ...rotaSelecionada,
      status: "concluida" as const,
      data_chegada: new Date().toLocaleString("pt-BR"),
    };

    setRotas(rotas.map(r => r.id === rotaSelecionada.id ? rotaAtualizada : r));
    setRotaSelecionada(rotaAtualizada);
    toast.success("Rota concluída!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta rota?")) {
      const novasRotas = rotas.filter(r => r.id !== id);
      setRotas(novasRotas);
      setRotaSelecionada(novasRotas[0] || null);
      toast.success("Rota deletada!");
    }
  };

  const pontosEmbarque: PontoEmbarque[] = rotaSelecionada
    ? JSON.parse(rotaSelecionada.pontos_embarque || "[]")
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
            <Route className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Roteirização Inteligente</h1>
        </div>
        <p className="text-slate-600">Otimize rotas de fretamento com pontos de embarque inteligentes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Rotas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{rotas.length}</div>
            <p className="text-xs text-slate-500 mt-1">Rotas cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ativas Agora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{rotas.filter(r => r.status === "ativa").length}</div>
            <p className="text-xs text-slate-500 mt-1">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Distância Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {rotas.reduce((acc, r) => acc + (r.distancia_total || 0), 0).toFixed(1)} km
            </div>
            <p className="text-xs text-slate-500 mt-1">Todas as rotas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{rotas.filter(r => r.status === "concluida").length}</div>
            <p className="text-xs text-slate-500 mt-1">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Rotas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Rotas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {rotas.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma rota cadastrada</p>
            ) : (
              rotas.map((rota) => (
                <div
                  key={rota.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    rotaSelecionada?.id === rota.id
                      ? "ring-2 ring-indigo-500 bg-indigo-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setRotaSelecionada(rota)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{rota.nome}</h4>
                      <p className="text-xs text-slate-600 truncate">{rota.descricao}</p>
                    </div>
                    <Badge className={`${STATUS_COLORS[rota.status].bg} ${STATUS_COLORS[rota.status].text} flex-shrink-0`}>
                      {rota.status}
                    </Badge>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {pontosEmbarque.length} pontos
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {rota.distancia_total?.toFixed(1) || "0"} km
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Detalhes da Rota */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {rotaSelecionada ? rotaSelecionada.nome : "Selecione uma Rota"}
                </CardTitle>
                {rotaSelecionada && (
                  <CardDescription className="mt-1">
                    {rotaSelecionada.descricao}
                  </CardDescription>
                )}
              </div>
              <Dialog open={modalNovaRota} onOpenChange={setModalNovaRota}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Rota
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Rota de Fretamento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNovaRota} className="space-y-4">
                    <div>
                      <Label>Nome da Rota *</Label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Fretamento Empresa XYZ"
                        required
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Detalhes sobre a rota..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Distância Máxima (km)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.distanciaMaxima}
                          onChange={(e) => setFormData({ ...formData, distanciaMaxima: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Tempo Máximo (min)</Label>
                        <Input
                          type="number"
                          value={formData.tempoMaximo}
                          onChange={(e) => setFormData({ ...formData, tempoMaximo: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Criar Rota
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setModalNovaRota(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {!rotaSelecionada ? (
              <div className="text-center py-12 text-slate-500">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma rota para ver os detalhes</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  <Dialog open={modalEnderecos} onOpenChange={setModalEnderecos}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Adicionar Endereços
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Adicionar Endereços à Rota</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Cole os endereços (um por linha)</Label>
                          <Textarea
                            value={enderecosTexto}
                            onChange={(e) => setEnderecosTexto(e.target.value)}
                            placeholder="Nome, Endereço&#10;Ponto A, Av. Paulista, 1000&#10;Ponto B, Rua Augusta, 2000"
                            className="min-h-32"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAdicionarEnderecos} className="flex-1">
                            Adicionar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setModalEnderecos(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleOtimizar}
                    disabled={rotaSelecionada.status === "ativa" || rotaSelecionada.status === "concluida"}
                  >
                    <Zap className="h-4 w-4" />
                    Otimizar
                  </Button>

                  {rotaSelecionada.status === "rascunho" || rotaSelecionada.status === "otimizada" ? (
                    <Button
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleIniciar}
                    >
                      <Play className="h-4 w-4" />
                      Iniciar
                    </Button>
                  ) : rotaSelecionada.status === "ativa" ? (
                    <Button
                      size="sm"
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                      onClick={handleConcluir}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Concluir
                    </Button>
                  ) : null}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(rotaSelecionada.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Informações da Rota */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Distância Máxima do Usuário</p>
                    <p className="text-lg font-semibold text-slate-900">{rotaSelecionada.distancia_maxima_usuario} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Tempo Máximo</p>
                    <p className="text-lg font-semibold text-slate-900">{rotaSelecionada.tempo_maximo_rota} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Distância Total</p>
                    <p className="text-lg font-semibold text-slate-900">{rotaSelecionada.distancia_total?.toFixed(1) || "0"} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Pontos de Embarque</p>
                    <p className="text-lg font-semibold text-slate-900">{pontosEmbarque.length}</p>
                  </div>
                </div>

                {/* Tabela de Pontos */}
                {pontosEmbarque.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Pontos de Embarque</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Ordem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Distância</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pontosEmbarque.map((ponto) => (
                            <TableRow key={ponto.id}>
                              <TableCell className="font-medium">{ponto.ordem}</TableCell>
                              <TableCell>{ponto.nome}</TableCell>
                              <TableCell className="text-sm text-slate-600">{ponto.endereco}</TableCell>
                              <TableCell>{ponto.distancia_anterior?.toFixed(1) || "-"} km</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Cotação */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cotação Gigante
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-blue-800">
                    <p className="text-sm mb-2">
                      <strong>Prazo de Entrega:</strong> Até sexta-feira
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Valor Estimado:</strong> R$ {(Math.random() * 5000 + 1000).toFixed(2)}
                    </p>
                    <p className="text-xs">
                      Cotação válida por 7 dias. Sujeita a alterações conforme mudanças na rota.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Importar CheckCircle que estava faltando
import { CheckCircle } from "lucide-react";
