import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DraggableEnderecoList } from "@/components/DraggableEnderecoList";
import { CSVImporter } from "@/components/CSVImporter";
import {
  MapPin,
  Plus,
  Upload,
  Route,
  Play,
  Trash2,
  Eye,
  Users,
  Clock,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import { MapView } from "@/components/Map";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-gray-500",
  otimizada: "bg-blue-500",
  ativa: "bg-green-500",
  concluida: "bg-purple-500",
};

export default function AdminRoteirizacao() {
  const [, setLocation] = useLocation();
  const [modalNovaRota, setModalNovaRota] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState<any>(null);
  const [modalEnderecos, setModalEnderecosOpen] = useState(false);
  const [modalEnderecosManuais, setModalEnderecosManuais] = useState(false);
  const [enderecosTexto, setEnderecosTexto] = useState("");
  const [enderecosManual, setEnderecosManual] = useState<Array<{ nomeUsuario: string; endereco: string }>>([]);
  const [novoEndereco, setNovoEndereco] = useState({ nomeUsuario: "", endereco: "" });
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rotas, refetch } = trpc.roteirizacao.list.useQuery();
  const { data: rotaDetalhes, refetch: refetchDetalhes } = trpc.roteirizacao.getById.useQuery(
    { id: rotaSelecionada?.id },
    { enabled: !!rotaSelecionada?.id }
  );

  const initTablesMutation = trpc.roteirizacao.initTables.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    initTablesMutation.mutate();
  }, []);

  const createMutation = trpc.roteirizacao.create.useMutation({
    onSuccess: () => {
      refetch();
      setModalNovaRota(false);
      alert("Rota criada com sucesso!");
    },
  });

  const createComEnderecosMutation = trpc.roteirizacao.createComEnderecos.useMutation({
    onSuccess: (data) => {
      refetch();
      setModalEnderecosManuais(false);
      setEnderecosManual([]);
      alert(`Rota criada com ${data.enderecosAdicionados} endereços!`);
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const addEnderecosMutation = trpc.roteirizacao.addEnderecos.useMutation({
    onSuccess: (data) => {
      refetchDetalhes();
      setModalEnderecosOpen(false);
      setEnderecosTexto("");
      alert(`${data.count} endereços adicionados!`);
    },
  });

  const otimizarMutation = trpc.roteirizacao.otimizar.useMutation({
    onSuccess: (data) => {
      refetchDetalhes();
      alert(`Rota otimizada! ${data.totalPontos} pontos de embarque sugeridos.`);
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.roteirizacao.delete.useMutation({
    onSuccess: () => {
      refetch();
      setRotaSelecionada(null);
      alert("Rota excluída!");
    },
  });

  const handleNovaRota = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string,
      distanciaMaximaUsuario: parseFloat(formData.get("distanciaMaxima") as string) || 1.0,
      tempoMaximoRota: parseInt(formData.get("tempoMaximo") as string) || 120,
    });
  };

  const handleAdicionarEnderecoManual = () => {
    if (!novoEndereco.endereco.trim()) return;
    setEnderecosManual([...enderecosManual, { ...novoEndereco }]);
    setNovoEndereco({ nomeUsuario: "", endereco: "" });
  };

  const handleRemoverEnderecoManual = (idx: number) => {
    setEnderecosManual(enderecosManual.filter((_, i) => i !== idx));
  };

  const handleReordenarEnderecos = (enderecos: Array<{ nomeUsuario: string; endereco: string }>) => {
    setEnderecosManual(enderecos);
  };

  const handleImportarCSV = (enderecos: Array<{ nomeUsuario: string; endereco: string }>) => {
    setEnderecosManual([...enderecosManual, ...enderecos]);
  };

  const handleCriarRotaComEnderecos = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enderecosManual.length === 0) {
      alert("Adicione pelo menos um endereço!");
      return;
    }
    const formData = new FormData(e.currentTarget);
    createComEnderecosMutation.mutate({
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string,
      distanciaMaximaUsuario: parseFloat(formData.get("distanciaMaxima") as string) || 1.0,
      tempoMaximoRota: parseInt(formData.get("tempoMaximo") as string) || 120,
      enderecos: enderecosManual,
    });
  };

  const handleUploadPlanilha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setEnderecosTexto(text);
    };
    reader.readAsText(file);
  };

  const handleAdicionarEnderecos = () => {
    if (!rotaSelecionada || !enderecosTexto.trim()) return;

    const linhas = enderecosTexto.split("\n").filter(l => l.trim());
    const enderecos = linhas.map((linha, idx) => {
      const partes = linha.split(/[,;\t]/);
      return {
        nomeUsuario: partes[0]?.trim() || `Usuário ${idx + 1}`,
        endereco: partes[1]?.trim() || partes[0]?.trim() || "",
      };
    }).filter(e => e.endereco);

    addEnderecosMutation.mutate({
      rotaId: rotaSelecionada.id,
      enderecos,
    });
  };

  const handleMapReady = (map: google.maps.Map) => {
    setMapInstance(map);
    
    if (rotaDetalhes?.pontos_embarque) {
      try {
        const pontosEmbarque = typeof rotaDetalhes.pontos_embarque === 'string' 
          ? JSON.parse(rotaDetalhes.pontos_embarque)
          : rotaDetalhes.pontos_embarque;
        const geocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds();
        
        pontosEmbarque.forEach((ponto: any, idx: number) => {
          if (ponto.latitude && ponto.longitude) {
            const position = { lat: parseFloat(ponto.latitude), lng: parseFloat(ponto.longitude) };
            new google.maps.Marker({
              position,
              map,
              title: ponto.nome,
              label: String(idx + 1),
            });
            bounds.extend(position);
          } else if (ponto.endereco) {
            geocoder.geocode({ address: ponto.endereco }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                const position = results[0].geometry.location;
                new google.maps.Marker({
                  position,
                  map,
                  title: ponto.nome,
                  label: String(idx + 1),
                });
                bounds.extend(position);
                map.fitBounds(bounds);
              }
            });
          }
        });
        
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Erro ao processar pontos de embarque:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/admin")}
        className="mb-4"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </Button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Route className="h-8 w-8" />
            Roteirização Inteligente
          </h1>
          <p className="text-muted-foreground">Otimize rotas de fretamento com pontos de embarque</p>
        </div>
        <div className="flex gap-2">
          {/* Botão para criar rota com endereços manuais */}
          <Dialog open={modalEnderecosManuais} onOpenChange={setModalEnderecosManuais}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="outline">
                <MapPin className="h-4 w-4" />
                Criar Rota com Endereços
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Rota com Endereços Manuais</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCriarRotaComEnderecos} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome da Rota *</Label>
                    <Input id="nome" name="nome" placeholder="Ex: Rota Centro" required />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input id="descricao" name="descricao" placeholder="Descrição da rota" />
                  </div>
                  <div>
                    <Label htmlFor="distanciaMaxima">Distância Máxima (km)</Label>
                    <Input id="distanciaMaxima" name="distanciaMaxima" type="number" defaultValue="1.0" step="0.1" />
                  </div>
                  <div>
                    <Label htmlFor="tempoMaximo">Tempo Máximo (min)</Label>
                    <Input id="tempoMaximo" name="tempoMaximo" type="number" defaultValue="120" />
                  </div>
                </div>

                {/* Seção de Endereços */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Adicionar Endereços</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Nome do usuário (opcional)"
                      value={novoEndereco.nomeUsuario}
                      onChange={(e) => setNovoEndereco({ ...novoEndereco, nomeUsuario: e.target.value })}
                    />
                    <Input
                      placeholder="Endereço *"
                      value={novoEndereco.endereco}
                      onChange={(e) => setNovoEndereco({ ...novoEndereco, endereco: e.target.value })}
                      className="col-span-2"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAdicionarEnderecoManual}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Endereço
                  </Button>

                  {/* Importar via CSV */}
                  <CSVImporter onImport={handleImportarCSV} />

                  {/* Lista de Endereços com Drag-and-Drop */}
                  <DraggableEnderecoList
                    enderecos={enderecosManual}
                    onEnderecoRemove={handleRemoverEnderecoManual}
                    onEnderecoReorder={handleReordenarEnderecos}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setModalEnderecosManuais(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={enderecosManual.length === 0}>
                    Criar Rota
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={modalNovaRota} onOpenChange={setModalNovaRota}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Rota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Rota de Fretamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNovaRota} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Rota</Label>
                  <Input id="nome" name="nome" placeholder="Ex: Rota Centro" required />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" name="descricao" placeholder="Descrição da rota" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distanciaMaxima">Distância Máxima (km)</Label>
                    <Input id="distanciaMaxima" name="distanciaMaxima" type="number" defaultValue="1.0" step="0.1" />
                  </div>
                  <div>
                    <Label htmlFor="tempoMaximo">Tempo Máximo (min)</Label>
                    <Input id="tempoMaximo" name="tempoMaximo" type="number" defaultValue="120" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Criar Rota
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Rotas */}
      <Card>
        <CardHeader>
          <CardTitle>Rotas Cadastradas</CardTitle>
          <CardDescription>Total de {rotas?.length || 0} rotas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Endereços</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rotas?.map((rota: any) => (
                  <TableRow key={rota.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{rota.nome}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[rota.status] || "bg-gray-500"}>
                        {rota.status}
                      </Badge>
                    </TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRotaSelecionada(rota)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Rota Selecionada */}
      {rotaSelecionada && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{rotaSelecionada.nome}</CardTitle>
                <CardDescription>{rotaSelecionada.descricao}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRotaSelecionada(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Botões de Ação */}
            <div className="flex gap-2 flex-wrap">
              <Dialog open={modalEnderecos} onOpenChange={setModalEnderecosOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Adicionar Endereços
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Endereços</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="arquivo">Selecionar Arquivo</Label>
                      <Input
                        id="arquivo"
                        type="file"
                        accept=".txt,.csv"
                        ref={fileInputRef}
                        onChange={handleUploadPlanilha}
                      />
                    </div>
                    <Textarea
                      placeholder="Ou cole os endereços aqui (um por linha)"
                      value={enderecosTexto}
                      onChange={(e) => setEnderecosTexto(e.target.value)}
                      rows={8}
                    />
                    <Button onClick={handleAdicionarEnderecos} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => otimizarMutation.mutate({ rotaId: rotaSelecionada.id })}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Otimizar Rota
              </Button>

              <Button
                onClick={() => deleteMutation.mutate({ id: rotaSelecionada.id })}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>

            {/* Informações da Rota */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={STATUS_COLORS[rotaSelecionada.status] || "bg-gray-500"}>
                  {rotaSelecionada.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distância Máxima</p>
                <p className="font-medium">{rotaSelecionada.distancia_maxima_usuario} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Máximo</p>
                <p className="font-medium">{rotaSelecionada.tempo_maximo_rota} min</p>
              </div>
            </div>

            {/* Mapa */}
            {rotaSelecionada && (
              <div>
                <h4 className="font-medium mb-2">Visualização no Mapa</h4>
                <div className="h-96 rounded-lg overflow-hidden border">
                  <MapView onMapReady={handleMapReady} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
