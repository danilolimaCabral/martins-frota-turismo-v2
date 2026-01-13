/**
 * Dashboard em Tempo Real
 * Exibe dados de GPS, frotas e alertas com atualização automática via WebSocket
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  Fuel,
  Gauge,
  MapPin,
  Radio,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RealtimeVehicle {
  id: string;
  placa: string;
  modelo: string;
  status: 'Em Rota' | 'Parado' | 'Manutenção' | 'Offline';
  latitude: number;
  longitude: number;
  velocidade: number;
  combustivel: number;
  temperatura: number;
  motorista?: string;
  destino?: string;
  ultimaAtualizacao: Date;
}

interface RealtimeAlert {
  id: string;
  vehicleId: string;
  tipo: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  timestamp: Date;
}

export function AdminDashboardRealtime() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<RealtimeVehicle[]>([]);
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 segundos
  const wsRef = useRef<WebSocket | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('martins_user_data');
    if (!userData) {
      setLocation('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [setLocation]);

  // Conectar WebSocket
  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/realtime`;
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket conectado');
          setIsConnected(true);
          toast.success('Conectado ao sistema em tempo real');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'vehicle_update') {
              setVehicles((prev) => {
                const index = prev.findIndex((v) => v.id === data.vehicle.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = data.vehicle;
                  return updated;
                }
                return [...prev, data.vehicle];
              });
            } else if (data.type === 'alert') {
              setAlerts((prev) => [data.alert, ...prev.slice(0, 49)]);
              toast.error(`Alerta: ${data.alert.mensagem}`);
            } else if (data.type === 'vehicles_batch') {
              setVehicles(data.vehicles);
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('Erro WebSocket:', error);
          setIsConnected(false);
          toast.error('Erro na conexão em tempo real');
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket desconectado');
          setIsConnected(false);
          // Reconectar após 3 segundos
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Auto-refresh com intervalo configurável
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'request_update' }));
      }
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  if (!user) {
    return null;
  }

  // Calcular estatísticas
  const vehiclesAtivos = vehicles.filter((v) => v.status === 'Em Rota').length;
  const vehiclesParados = vehicles.filter((v) => v.status === 'Parado').length;
  const alertasCriticos = alerts.filter((a) => a.severidade === 'critica').length;
  const alertasAltos = alerts.filter((a) => a.severidade === 'alta').length;
  const velocidadeMedia =
    vehicles.length > 0
      ? Math.round(vehicles.reduce((sum, v) => sum + v.velocidade, 0) / vehicles.length)
      : 0;
  const combustivelMedio =
    vehicles.length > 0
      ? Math.round(vehicles.reduce((sum, v) => sum + v.combustivel, 0) / vehicles.length)
      : 0;

  // Dados para gráficos
  const chartVehicleStatus = {
    labels: ['Em Rota', 'Parado', 'Manutenção', 'Offline'],
    datasets: [
      {
        label: 'Veículos',
        data: [
          vehiclesAtivos,
          vehiclesParados,
          vehicles.filter((v) => v.status === 'Manutenção').length,
          vehicles.filter((v) => v.status === 'Offline').length,
        ],
        backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
        borderColor: ['#1e40af', '#d97706', '#dc2626', '#374151'],
        borderWidth: 2,
      },
    ],
  };

  const chartVelocidades = {
    labels: vehicles.slice(0, 10).map((v) => v.placa),
    datasets: [
      {
        label: 'Velocidade (km/h)',
        data: vehicles.slice(0, 10).map((v) => v.velocidade),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartCombustivel = {
    labels: vehicles.slice(0, 10).map((v) => v.placa),
    datasets: [
      {
        label: 'Combustível (%)',
        data: vehicles.slice(0, 10).map((v) => v.combustivel),
        backgroundColor: vehicles.slice(0, 10).map((v) =>
          v.combustivel < 20 ? '#ef4444' : v.combustivel < 50 ? '#f59e0b' : '#10b981'
        ),
        borderColor: '#1f2937',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              Dashboard em Tempo Real
            </h1>
            <p className="text-slate-600 mt-1">
              Monitoramento de frotas, GPS e alertas em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="gap-2"
            >
              <Radio className="w-3 h-3" />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'request_update' }));
                }
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Veículos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{vehiclesAtivos}</div>
              <p className="text-xs text-slate-500 mt-1">
                de {vehicles.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {alertasCriticos}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {alertasAltos} altos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Velocidade Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{velocidadeMedia}</div>
              <p className="text-xs text-slate-500 mt-1">km/h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Combustível Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${combustivelMedio < 20 ? 'text-red-600' : combustivelMedio < 50 ? 'text-orange-600' : 'text-green-600'}`}>
                {combustivelMedio}%
              </div>
              <p className="text-xs text-slate-500 mt-1">da frota</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="veiculos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="veiculos">Veículos</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>

          {/* Tab: Veículos */}
          <TabsContent value="veiculos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Veículos em Tempo Real</CardTitle>
                <CardDescription>
                  {vehicles.length} veículos monitorados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {vehicles.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      Nenhum veículo conectado
                    </p>
                  ) : (
                    vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{vehicle.placa}</p>
                            <p className="text-xs text-slate-500">{vehicle.modelo}</p>
                          </div>
                          <Badge
                            variant={
                              vehicle.status === 'Em Rota'
                                ? 'default'
                                : vehicle.status === 'Parado'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {vehicle.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-blue-600" />
                            <span>{vehicle.velocidade} km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-orange-600" />
                            <span>{vehicle.combustivel}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-600" />
                            <span>{vehicle.temperatura}°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>
                              {new Date(vehicle.ultimaAtualizacao).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {vehicle.motorista && (
                          <p className="text-xs text-slate-600 mt-2">
                            Motorista: {vehicle.motorista}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="graficos" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status da Frota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={chartVehicleStatus} options={{ maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Velocidades (Top 10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <Line data={chartVelocidades} options={{ maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Níveis de Combustível (Top 10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <Bar data={chartCombustivel} options={{ maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Alertas */}
          <TabsContent value="alertas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas em Tempo Real</CardTitle>
                <CardDescription>
                  {alerts.length} alertas recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      Nenhum alerta no momento
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border-l-4 rounded-lg ${
                          alert.severidade === 'critica'
                            ? 'border-red-500 bg-red-50'
                            : alert.severidade === 'alta'
                            ? 'border-orange-500 bg-orange-50'
                            : alert.severidade === 'media'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{alert.mensagem}</p>
                            <p className="text-xs text-slate-600 mt-1">
                              Veículo: {alert.vehicleId}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações de Atualização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto-refresh</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5"
              />
            </div>
            {autoRefresh && (
              <div>
                <label className="text-sm font-medium">Intervalo (ms)</label>
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min={1000}
                  max={60000}
                  step={1000}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
