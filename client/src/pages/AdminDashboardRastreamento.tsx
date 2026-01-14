import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Fuel, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { MapView } from "@/components/Map";

interface Motorista {
  id: number;
  nome: string;
  placa: string;
  latitude: number;
  longitude: number;
  status: "disponível" | "em_rota" | "pausa";
  rota_atual?: string;
  velocidade: number;
  combustivel: number;
}

interface Rota {
  id: number;
  nome: string;
  motorista: string;
  progresso: number;
  status: "em_progresso" | "concluída";
  economia: number;
}

const motoristasMock: Motorista[] = [
  {
    id: 1,
    nome: "João Silva",
    placa: "ABC-1234",
    latitude: -25.472397,
    longitude: -49.243755,
    status: "em_rota",
    rota_atual: "Rota Centro",
    velocidade: 45,
    combustivel: 75,
  },
  {
    id: 2,
    nome: "Maria Santos",
    placa: "DEF-5678",
    latitude: -25.441285,
    longitude: -49.298742,
    status: "em_rota",
    rota_atual: "Rota Bairro",
    velocidade: 38,
    combustivel: 60,
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    placa: "GHI-9012",
    latitude: -25.384629,
    longitude: -49.251847,
    status: "disponível",
    velocidade: 0,
    combustivel: 85,
  },
];

const rotasMock: Rota[] = [
  { id: 1, nome: "Rota Centro", motorista: "João Silva", progresso: 65, status: "em_progresso", economia: 79.1 },
  { id: 2, nome: "Rota Bairro", motorista: "Maria Santos", progresso: 45, status: "em_progresso", economia: 75.2 },
];

export default function AdminDashboardRastreamento() {
  const [motoristas, setMotoristas] = useState<Motorista[]>(motoristasMock);
  const [rotas, setRotas] = useState<Rota[]>(rotasMock);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    // Simular atualização de localização em tempo real
    const intervalo = setInterval(() => {
      setMotoristas((prev) =>
        prev.map((m) => {
          if (m.status === "em_rota") {
            return {
              ...m,
              latitude: m.latitude + (Math.random() - 0.5) * 0.01,
              longitude: m.longitude + (Math.random() - 0.5) * 0.01,
              velocidade: Math.floor(Math.random() * 60) + 20,
              combustivel: Math.max(10, m.combustivel - Math.random() * 0.5),
            };
          }
          return m;
        })
      );
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);

  const handleMapReady = (map: google.maps.Map) => {
    setMapInstance(map);
    atualizarMarcadores(map);
  };

  const atualizarMarcadores = (map: google.maps.Map) => {
    motoristas.forEach((motorista) => {
      const position = { lat: motorista.latitude, lng: motorista.longitude };
      const cor =
        motorista.status === "em_rota"
          ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          : motorista.status === "pausa"
            ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

      new google.maps.Marker({
        position,
        map,
        title: motorista.nome,
        icon: cor,
      });

      // Infowindow com informações do motorista
      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: Arial;">
            <strong>${motorista.nome}</strong><br/>
            Placa: ${motorista.placa}<br/>
            Velocidade: ${motorista.velocidade} km/h<br/>
            Combustível: ${motorista.combustivel.toFixed(1)}%
          </div>
        `,
      });

      const marker = new google.maps.Marker({
        position,
        map,
      });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });
    });
  };

  const motoristasFiltrados = motoristas.filter(
    (m) => filtroStatus === "todos" || m.status === filtroStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponível":
        return "bg-green-100 text-green-800";
      case "em_rota":
        return "bg-blue-100 text-blue-800";
      case "pausa":
        return "bg-yellow-100 text-yellow-800";
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
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rastreamento em Tempo Real</h1>
              <p className="text-sm text-slate-600">Monitore motoristas e rotas ao vivo</p>
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
          {/* Mapa */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl h-96 lg:h-[600px]">
              <MapView onMapReady={handleMapReady} />
            </div>

            {/* Rotas em Progresso */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  📊 Rotas em Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {rotas.map((rota) => (
                  <div key={rota.id} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{rota.nome}</h3>
                        <p className="text-sm text-slate-600">Motorista: {rota.motorista}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{rota.economia}% economia</Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rota.progresso}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{rota.progresso}% concluído</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Filtros */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-2">
                {["todos", "disponível", "em_rota", "pausa"].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    variant={filtroStatus === status ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {status === "todos" ? "Todos" : status === "disponível" ? "✓ Disponível" : status === "em_rota" ? "→ Em Rota" : "⏸ Pausa"}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Motoristas Online */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  👥 Motoristas Online
                  <Badge variant="secondary">{motoristasFiltrados.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {motoristasFiltrados.map((motorista) => (
                  <div key={motorista.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{motorista.nome}</p>
                        <p className="text-xs text-slate-500">{motorista.placa}</p>
                      </div>
                      <Badge className={getStatusColor(motorista.status)}>
                        {motorista.status === "disponível" ? "✓" : motorista.status === "em_rota" ? "→" : "⏸"}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Navigation className="h-3 w-3" />
                        {motorista.velocidade} km/h
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Fuel className="h-3 w-3" />
                        {motorista.combustivel.toFixed(1)}%
                      </div>
                      {motorista.rota_atual && (
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <MapPin className="h-3 w-3" />
                          {motorista.rota_atual}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
              <CardHeader className="border-b border-orange-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="bg-white rounded-lg p-3 border border-orange-100">
                  <p className="text-slate-600 text-xs">Motoristas Ativos</p>
                  <p className="text-2xl font-bold text-slate-900">{motoristasFiltrados.length}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-slate-600 text-xs">Rotas em Progresso</p>
                  <p className="text-2xl font-bold text-slate-900">{rotas.length}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-slate-600 text-xs">Economia Média</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(rotas.reduce((acc, r) => acc + r.economia, 0) / rotas.length).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
