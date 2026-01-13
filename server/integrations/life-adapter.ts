/**
 * Adaptador para Integração com API da Life Gestão de Frota
 * Sincroniza dados de frotas, rastreamento e alertas
 */

import axios, { AxiosInstance } from 'axios';

export interface LifeVehicle {
  id: string;
  placa: string;
  modelo: string;
  tipo: 'Van' | 'Micro-ônibus' | 'Ônibus';
  status: 'Em Rota' | 'Parado' | 'Manutenção' | 'Offline';
  latitude: number;
  longitude: number;
  velocidade: number;
  combustivel: number;
  temperatura: number;
  ultimaAtualizacao: Date;
  motorista?: string;
  destino?: string;
}

export interface LifeAlert {
  id: string;
  vehicleId: string;
  tipo: 'velocidade' | 'combustivel' | 'temperatura' | 'manutencao' | 'seguranca';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  timestamp: Date;
  reconhecido: boolean;
}

export interface LifeRoute {
  id: string;
  vehicleId: string;
  dataInicio: Date;
  dataFim?: Date;
  origem: string;
  destino: string;
  distancia: number;
  duracao: number;
  combustivelGasto: number;
  velocidadeMedia: number;
  eventos: LifeRouteEvent[];
}

export interface LifeRouteEvent {
  timestamp: Date;
  tipo: string;
  descricao: string;
  latitude: number;
  longitude: number;
}

export interface LifeConfig {
  apiUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  syncInterval?: number; // em segundos
}

/**
 * Classe para integração com API da Life
 */
export class LifeAdapter {
  private client: AxiosInstance;
  private config: LifeConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: LifeConfig) {
    this.config = {
      syncInterval: 30,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 10000,
    });
  }

  /**
   * Autenticar com API da Life
   */
  async authenticate(): Promise<string | undefined> {
    try {
      const response = await this.client.post('/auth/token', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
      });

      this.accessToken = response.data.access_token || '';
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      // Adicionar token aos headers
      if (this.accessToken) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      }

      console.log('[Life] Autenticação bem-sucedida');
      return this.accessToken;
    } catch (error) {
      console.error('[Life] Erro de autenticação:', error);
      throw new Error('Falha ao autenticar com API da Life');
    }
  }

  /**
   * Verificar e renovar token se necessário
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Obter lista de veículos
   */
  async getVehicles(): Promise<LifeVehicle[]> {
    try {
      await this.ensureValidToken();

      const response = await this.client.get('/vehicles', {
        params: {
          limit: 1000,
          offset: 0,
        },
      });

      return response.data.data.map((v: any) => ({
        id: v.id || '',
        placa: v.licensePlate || '',
        modelo: v.model || '',
        tipo: this.mapVehicleType(v.type || 'van'),
        status: this.mapVehicleStatus(v.status || 'offline'),
        latitude: v.location?.latitude || 0,
        longitude: v.location?.longitude || 0,
        velocidade: v.speed || 0,
        combustivel: v.fuelLevel || 0,
        temperatura: v.engineTemperature || 0,
        ultimaAtualizacao: new Date(v.lastUpdate || Date.now()),
        motorista: v.driver?.name || undefined,
        destino: v.route?.destination || undefined,
      }));
    } catch (error) {
      console.error('[Life] Erro ao obter veículos:', error);
      throw error;
    }
  }

  /**
   * Obter localização em tempo real de um veículo
   */
  async getVehicleLocation(vehicleId: string): Promise<{
    latitude: number;
    longitude: number;
    velocidade: number;
    heading: number;
    timestamp: Date;
  }> {
    try {
      await this.ensureValidToken();

      const response = await this.client.get(`/vehicles/${vehicleId}/location`);

      return {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        velocidade: response.data.speed,
        heading: response.data.heading,
        timestamp: new Date(response.data.timestamp),
      };
    } catch (error) {
      console.error(`[Life] Erro ao obter localização do veículo ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Obter alertas ativos
   */
  async getAlerts(vehicleId?: string): Promise<LifeAlert[]> {
    try {
      await this.ensureValidToken();

      const params: any = {
        status: 'active',
        limit: 1000,
      };

      if (vehicleId) {
        params.vehicleId = vehicleId;
      }

      const response = await this.client.get('/alerts', { params });

      return response.data.data.map((a: any) => ({
        id: a.id,
        vehicleId: a.vehicleId,
        tipo: this.mapAlertType(a.type),
        severidade: this.mapAlertSeverity(a.severity),
        mensagem: a.message,
        timestamp: new Date(a.timestamp),
        reconhecido: a.acknowledged,
      }));
    } catch (error) {
      console.error('[Life] Erro ao obter alertas:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de rotas
   */
  async getRouteHistory(vehicleId: string, startDate: Date, endDate: Date): Promise<LifeRoute[]> {
    try {
      await this.ensureValidToken();

      const response = await this.client.get(`/vehicles/${vehicleId}/routes`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1000,
        },
      });

      return response.data.data.map((r: any) => ({
        id: r.id,
        vehicleId: r.vehicleId,
        dataInicio: new Date(r.startTime),
        dataFim: r.endTime ? new Date(r.endTime) : undefined,
        origem: r.origin,
        destino: r.destination,
        distancia: r.distance,
        duracao: r.duration,
        combustivelGasto: r.fuelUsed,
        velocidadeMedia: r.averageSpeed,
        eventos: r.events?.map((e: any) => ({
          timestamp: new Date(e.timestamp),
          tipo: e.type,
          descricao: e.description,
          latitude: e.latitude,
          longitude: e.longitude,
        })) || [],
      }));
    } catch (error) {
      console.error(`[Life] Erro ao obter histórico de rotas do veículo ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de frota
   */
  async getFleetStatistics(startDate: Date, endDate: Date): Promise<{
    totalVehicles: number;
    vehiclesActive: number;
    totalDistance: number;
    totalFuelUsed: number;
    averageSpeed: number;
    totalAlerts: number;
    criticalAlerts: number;
  }> {
    try {
      await this.ensureValidToken();

      const response = await this.client.get('/fleet/statistics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      return {
        totalVehicles: response.data.totalVehicles,
        vehiclesActive: response.data.activeVehicles,
        totalDistance: response.data.totalDistance,
        totalFuelUsed: response.data.totalFuelUsed,
        averageSpeed: response.data.averageSpeed,
        totalAlerts: response.data.totalAlerts,
        criticalAlerts: response.data.criticalAlerts,
      };
    } catch (error) {
      console.error('[Life] Erro ao obter estatísticas de frota:', error);
      throw error;
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await this.ensureValidToken();

      await this.client.patch(`/alerts/${alertId}`, {
        acknowledged: true,
      });

      console.log(`[Life] Alerta ${alertId} reconhecido`);
    } catch (error) {
      console.error(`[Life] Erro ao reconhecer alerta ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Mapear tipo de veículo da Life para Martins
   */
  private mapVehicleType(
    lifeType: string
  ): 'Van' | 'Micro-ônibus' | 'Ônibus' {
    const typeMap: Record<string, 'Van' | 'Micro-ônibus' | 'Ônibus'> = {
      van: 'Van',
      microbus: 'Micro-ônibus',
      bus: 'Ônibus',
      'micro-onibus': 'Micro-ônibus',
    };
    return typeMap[lifeType.toLowerCase()] || 'Van';
  }

  /**
   * Mapear status de veículo
   */
  private mapVehicleStatus(
    lifeStatus: string
  ): 'Em Rota' | 'Parado' | 'Manutenção' | 'Offline' {
    const statusMap: Record<string, 'Em Rota' | 'Parado' | 'Manutenção' | 'Offline'> = {
      active: 'Em Rota',
      idle: 'Parado',
      maintenance: 'Manutenção',
      offline: 'Offline',
      moving: 'Em Rota',
      stopped: 'Parado',
    };
    return statusMap[lifeStatus.toLowerCase()] || 'Offline';
  }

  /**
   * Mapear tipo de alerta
   */
  private mapAlertType(
    lifeType: string
  ): 'velocidade' | 'combustivel' | 'temperatura' | 'manutencao' | 'seguranca' {
    const typeMap: Record<string, 'velocidade' | 'combustivel' | 'temperatura' | 'manutencao' | 'seguranca'> = {
      speeding: 'velocidade',
      'low_fuel': 'combustivel',
      'high_temperature': 'temperatura',
      maintenance: 'manutencao',
      accident: 'seguranca',
      harsh_braking: 'seguranca',
      harsh_acceleration: 'seguranca',
    };
    return typeMap[lifeType.toLowerCase()] || 'seguranca';
  }

  /**
   * Mapear severidade de alerta
   */
  private mapAlertSeverity(
    lifeSeverity: string
  ): 'baixa' | 'media' | 'alta' | 'critica' {
    const severityMap: Record<string, 'baixa' | 'media' | 'alta' | 'critica'> = {
      low: 'baixa',
      medium: 'media',
      high: 'alta',
      critical: 'critica',
      info: 'baixa',
      warning: 'media',
      error: 'alta',
      fatal: 'critica',
    };
    return severityMap[lifeSeverity.toLowerCase()] || 'media';
  }

  /**
   * Testar conexão com API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      const vehicles = await this.getVehicles();
      console.log(`[Life] Conexão bem-sucedida. ${vehicles.length} veículos encontrados.`);
      return true;
    } catch (error) {
      console.error('[Life] Erro na conexão:', error);
      return false;
    }
  }
}

// Exportar instância singleton
export const createLifeAdapter = (config: LifeConfig): LifeAdapter => {
  return new LifeAdapter(config);
};
