import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, User, Phone, Truck, Send, ArrowLeft, Copy, QrCode, Share2 } from "lucide-react";

interface Motorista {
  id: number;
  nome: string;
  telefone: string;
  placa: string;
  status: "disponível" | "em_rota" | "pausa";
  rotas_ativas: number;
}

interface Rota {
  id: number;
  nome: string;
  distancia: number;
  tempo: number;
  economia: number;
  motorista_id?: number;
  status: "pendente" | "atribuída" | "em_progresso" | "concluída";
}

const motoristas: Motorista[] = [
  { id: 1, nome: "João Silva", telefone: "(41) 98765-4321", placa: "ABC-1234", status: "disponível", rotas_ativas: 0 },
  { id: 2, nome: "Maria Santos", telefone: "(41) 99876-5432", placa: "DEF-5678", status: "em_rota", rotas_ativas: 1 },
  { id: 3, nome: "Pedro Oliveira", telefone: "(41) 97654-3210", placa: "GHI-9012", status: "disponível", rotas_ativas: 0 },
  { id: 4, nome: "Ana Costa", telefone: "(41) 96543-2109", placa: "JKL-3456", status: "pausa", rotas_ativas: 0 },
  { id: 5, nome: "Carlos Mendes", telefone: "(41) 95432-1098", placa: "MNO-7890", status: "disponível", rotas_ativas: 0 },
];

const rotas: Rota[] = [
  { id: 1, nome: "Rota Centro", distancia: 5.09, tempo: 45, economia: 79.1, status: "pendente" },
  { id: 2, nome: "Rota Bairro", distancia: 3.5, tempo: 30, economia: 75.2, motorista_id: 2, status: "em_progresso" },
  { id: 3, nome: "Rota Periferia", distancia: 8.2, tempo: 60, economia: 82.5, status: "pendente" },
  { id: 4, nome: "Rota Industrial", distancia: 6.7, tempo: 50, economia: 78.3, motorista_id: 1, status: "atribuída" },
];

export default function AdminAtribuicaoRotas() {
  const [rotasSelecionadas, setRotasSelecionadas] = useState<number[]>([]);
  const [motoristaAtribuicao, setMotoristaAtribuicao] = useState<string>("");
  const [rotasAtribuidas, setRotasAtribuidas] = useState<{ [key: number]: number }>({});

  const atribuirRota = (rotaId: number, motoristaId: number) => {
    setRotasAtribuidas({ ...rotasAtribuidas, [rotaId]: motoristaId });
    alert(`✅ Rota atribuída ao motorista ${motoristas.find(m => m.id === motoristaId)?.nome}`);
  };

  const transferirRota = (rotaId: number, novoMotoristaId: number) => {
    setRotasAtribuidas({ ...rotasAtribuidas, [rotaId]: novoMotoristaId });
    alert(`✅ Rota transferida com sucesso!`);
  };

  const compartilharRota = (rotaId: number) => {
    const url = `${window.location.origin}/motorista/rota/${rotaId}`;
    navigator.clipboard.writeText(url);
    alert("✅ Link da rota copiado!");
  };

  const getMotoristaInfo = (motoristaId: number) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponível":
        return "bg-green-100 text-green-800";
      case "em_rota":
        return "bg-blue-100 text-blue-800";
      case "pausa":
        return "bg-yellow-100 text-yellow-800";
      case "pendente":
        return "bg-gray-100 text-gray-800";
      case "atribuída":
        return "bg-blue-100 text-blue-800";
      case "em_progresso":
        return "bg-purple-100 text-purple-800";
      case "concluída":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Atribuição de Rotas</h1>
              <p className="text-sm text-slate-600">Gerencie motoristas e rotas em tempo real</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de Motoristas */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  👥 Motoristas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {motoristas.map((motorista) => (
                  <div key={motorista.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{motorista.nome}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Truck className="h-3 w-3" />
                          {motorista.placa}
                        </p>
                      </div>
                      <Badge className={getStatusColor(motorista.status)}>
                        {motorista.status === "disponível" ? "✓" : motorista.status === "em_rota" ? "→" : "⏸"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {motorista.telefone}
                    </p>
                    <p className="text-xs text-orange-600 font-medium mt-2">
                      {motorista.rotas_ativas} rota(s) ativa(s)
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Painel de Rotas */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    🗺️ Rotas Disponíveis
                  </CardTitle>
                  <Badge variant="secondary">{rotas.filter(r => r.status === "pendente").length} Pendentes</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {rotas.map((rota) => {
                  const motorista = rota.motorista_id ? getMotoristaInfo(rota.motorista_id) : null;
                  return (
                    <div key={rota.id} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-orange-300 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{rota.nome}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            📍 {rota.distancia} km • ⏱️ {rota.tempo} min • 💰 {rota.economia}% economia
                          </p>
                        </div>
                        <Badge className={getStatusColor(rota.status)}>
                          {rota.status === "pendente" ? "Pendente" : 
                           rota.status === "atribuída" ? "Atribuída" :
                           rota.status === "em_progresso" ? "Em Progresso" : "Concluída"}
                        </Badge>
                      </div>

                      {motorista && (
                        <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                          <p className="text-sm font-medium text-slate-900">
                            👤 {motorista.nome} ({motorista.placa})
                          </p>
                          <p className="text-xs text-slate-600 mt-1">{motorista.telefone}</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {!motorista ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 flex-1">
                                <Send className="h-4 w-4" />
                                Atribuir Motorista
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atribuir Motorista - {rota.nome}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um motorista" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {motoristas
                                      .filter(m => m.status === "disponível")
                                      .map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                          {m.nome} ({m.placa})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <Button 
                                  onClick={() => {
                                    const motoristaId = parseInt(motoristaAtribuicao);
                                    if (motoristaId) {
                                      atribuirRota(rota.id, motoristaId);
                                    }
                                  }}
                                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                >
                                  ✅ Confirmar Atribuição
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2 flex-1">
                                  <Send className="h-4 w-4" />
                                  Transferir
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Transferir Rota - {rota.nome}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione novo motorista" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {motoristas
                                        .filter(m => m.id !== motorista.id && m.status === "disponível")
                                        .map(m => (
                                          <SelectItem key={m.id} value={String(m.id)}>
                                            {m.nome} ({m.placa})
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    onClick={() => {
                                      const novoMotoristaId = parseInt(motoristaAtribuicao);
                                      if (novoMotoristaId) {
                                        transferirRota(rota.id, novoMotoristaId);
                                      }
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                  >
                                    ✅ Confirmar Transferência
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button 
                              onClick={() => compartilharRota(rota.id)}
                              variant="outline"
                              className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                            >
                              <Share2 className="h-4 w-4" />
                              Compartilhar
                            </Button>

                            <Button 
                              variant="outline"
                              className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                            >
                              <QrCode className="h-4 w-4" />
                              QR Code
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
