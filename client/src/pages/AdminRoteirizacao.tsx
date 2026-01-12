import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Plus, Upload, Route, Play, Trash2, Eye, Users, Clock, Navigation } from "lucide-react";
import { MapView } from "@/components/Map";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-gray-500",
  otimizada: "bg-blue-500",
  ativa: "bg-green-500",
  concluida: "bg-purple-500",
};

export default function AdminRoteirizacao() {
  const [modalNovaRota, setModalNovaRota] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState<any>(null);
  const [modalEnderecos, setModalEnderecosOpen] = useState(false);
  const [enderecosTexto, setEnderecosTexto] = useState("");
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

  // Inicializar tabelas automaticamente ao carregar a página
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
    
    // Se tiver pontos de embarque, mostrar no mapa
    if (rotaDetalhes?.pontos_embarque) {
      const pontosEmbarque = JSON.parse(rotaDetalhes.pontos_embarque);
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
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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
          {/* Botão removido - tabelas inicializadas automaticamente */}
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
                  <Label>Nome da Rota *</Label>
                  <Input name="nome" required placeholder="Ex: Fretamento Empresa XYZ" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea name="descricao" placeholder="Detalhes sobre a rota..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Distância Máxima do Usuário (km)</Label>
                    <Input name="distanciaMaxima" type="number" step="0.1" defaultValue="1.0" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Distância máxima que o usuário pode percorrer até o ponto de embarque
                    </p>
                  </div>
                  <div>
                    <Label>Tempo Máximo de Rota (min)</Label>
                    <Input name="tempoMaximo" type="number" defaultValue="120" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo máximo total da rota em minutos
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalNovaRota(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Rota"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Rotas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Rotas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rotas?.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma rota cadastrada. Clique em "Nova Rota" para começar.
              </p>
            )}
            {rotas?.map((rota: any) => (
              <div
                key={rota.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                  rotaSelecionada?.id === rota.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setRotaSelecionada(rota)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{rota.nome}</h4>
                    <p className="text-sm text-muted-foreground">{rota.descricao}</p>
                  </div>
                  <Badge className={STATUS_COLORS[rota.status]}>
                    {rota.status}
                  </Badge>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {rota.distancia_maxima_usuario} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rota.tempo_maximo_rota} min
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detalhes da Rota */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {rotaSelecionada ? rotaSelecionada.nome : "Selecione uma Rota"}
            </CardTitle>
            {rotaSelecionada && (
              <CardDescription>
                Configure endereços e otimize a rota
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!rotaSelecionada ? (
              <div className="text-center py-12 text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma rota na lista ao lado para ver os detalhes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ações */}
                <div className="flex gap-2 flex-wrap">
                  <Dialog open={modalEnderecos} onOpenChange={setModalEnderecosOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Adicionar Endereços
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Adicionar Endereços</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Upload de Planilha (CSV/TXT)</Label>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt,.xlsx"
                            onChange={handleUploadPlanilha}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Formato: Nome, Endereço (um por linha)
                          </p>
                        </div>
                        <div>
                          <Label>Ou cole os endereços abaixo</Label>
                          <Textarea
                            value={enderecosTexto}
                            onChange={(e) => setEnderecosTexto(e.target.value)}
                            placeholder="João Silva, Rua das Flores 123, Curitiba&#10;Maria Santos, Av. Brasil 456, Curitiba&#10;..."
                            rows={10}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setModalEnderecosOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAdicionarEnderecos} disabled={addEnderecosMutation.isPending}>
                            {addEnderecosMutation.isPending ? "Salvando..." : "Adicionar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => otimizarMutation.mutate({ rotaId: rotaSelecionada.id })}
                    disabled={otimizarMutation.isPending || !rotaDetalhes?.enderecos?.length}
                  >
                    <Play className="h-4 w-4" />
                    {otimizarMutation.isPending ? "Otimizando..." : "Otimizar Rota"}
                  </Button>

                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      if (confirm("Excluir esta rota?")) {
                        deleteMutation.mutate({ id: rotaSelecionada.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>

                {/* Endereços */}
                {rotaDetalhes?.enderecos?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Endereços ({rotaDetalhes.enderecos.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Endereço</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rotaDetalhes.enderecos.map((end: any, idx: number) => (
                            <TableRow key={end.id}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>{end.nome_usuario || "-"}</TableCell>
                              <TableCell className="text-sm">{end.endereco}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Pontos de Embarque */}
                {rotaDetalhes?.pontos_embarque && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Pontos de Embarque Sugeridos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {JSON.parse(rotaDetalhes.pontos_embarque).map((ponto: any) => (
                        <div key={ponto.id} className="p-3 border rounded-lg bg-accent/30">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {ponto.id}
                            </div>
                            <div>
                              <p className="font-medium">{ponto.nome}</p>
                              <p className="text-xs text-muted-foreground">{ponto.endereco}</p>
                              <p className="text-xs text-blue-600">{ponto.usuarios?.length || 0} usuários</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mapa */}
                {rotaDetalhes?.pontos_embarque && (
                  <div>
                    <h4 className="font-medium mb-2">Visualização no Mapa</h4>
                    <div className="h-64 rounded-lg overflow-hidden border">
                      <MapView onMapReady={handleMapReady} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
