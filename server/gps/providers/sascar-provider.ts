/**
 * Adaptador para Sascar
 * API: https://www.sascar.com.br/
 */

import { BaseGPSProvider } from '../base-provider';
import {
  GPSProviderConfig,
  VehicleLocation,
  GPSAlert,
  RouteHistory,
  GPSProviderType,
} from '../types';

interface SascarVehicle {
  id: string;
  placa: string;
  latitude: number;
  longitude: number;
  velocidade: number;
  direcao: number;
  dataHora: string;
  combustivel?: number;
  temperatura?: number;
  odometro?: number;
  status?: string;
}

interface SascarEvent {
  id: string;
  idVeiculo: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  severidade: string;
}

export class SascarProvider extends BaseGPSProvider {
  private sessionToken?: string;

  constructor(config: GPSProviderConfig) {
    super(config);
    if (config.type !== GPSProviderType.SASCAR) {
      throw new Error('Invalid provider type for SascarProvider');
    }
  }

  /**
   * Autenticar com Sascar
   * Documentação: https://api.sascar.com.br/docs
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid configuration');
      }

      // Sascar usa login com usuário e senha
      const credentials = this.config.credentials || {};
      const username = credentials.username || this.config.apiKey;
      const password = credentials.password || '';

      const response = await this.makeRequest<{ sessionToken: string }>(
        `${this.config.apiUrl}/login`,
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }
      );

      this.sessionToken = response.sessionToken;
      return true;
    } catch (error) {
      console.error('Sascar authentication failed:', error);
      return false;
    }
  }

  /**
   * Obter localização de todos os veículos
   */
  async getVehicles(): Promise<VehicleLocation[]> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{ veiculos: SascarVehicle[] }>(
        `${this.config.apiUrl}/veiculos/posicoes`,
        {
          method: 'GET',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
        }
      );

      return response.veiculos.map((vehicle) => ({
        vehicleId: vehicle.id,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        speed: vehicle.velocidade,
        heading: vehicle.direcao,
        timestamp: new Date(vehicle.dataHora),
        provider: GPSProviderType.SASCAR,
        providerVehicleId: vehicle.id,
        fuelLevel: vehicle.combustivel,
        temperature: vehicle.temperatura,
        odometer: vehicle.odometro,
        status: (vehicle.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
      }));
    } catch (error) {
      console.error('Failed to get vehicles from Sascar:', error);
      return [];
    }
  }

  /**
   * Obter localização de um veículo específico
   */
  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<SascarVehicle>(
        `${this.config.apiUrl}/veiculos/${vehicleId}/posicao`,
        {
          method: 'GET',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
        }
      );

      return {
        vehicleId: response.id,
        latitude: response.latitude,
        longitude: response.longitude,
        speed: response.velocidade,
        heading: response.direcao,
        timestamp: new Date(response.dataHora),
        provider: GPSProviderType.SASCAR,
        providerVehicleId: response.id,
        fuelLevel: response.combustivel,
        temperature: response.temperatura,
        odometer: response.odometro,
        status: (response.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
      };
    } catch (error) {
      console.error(`Failed to get vehicle location for ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Obter alertas/eventos
   */
  async getAlerts(): Promise<GPSAlert[]> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{ eventos: SascarEvent[] }>(
        `${this.config.apiUrl}/eventos/ativos`,
        {
          method: 'GET',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
        }
      );

      return response.eventos.map((event) => ({
        id: event.id,
        vehicleId: event.idVeiculo,
        type: this.mapEventType(event.tipo),
        severity: (event.severidade as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        message: event.descricao,
        timestamp: new Date(event.dataHora),
        acknowledged: false,
      }));
    } catch (error) {
      console.error('Failed to get alerts from Sascar:', error);
      return [];
    }
  }

  /**
   * Obter histórico de rota
   */
  async getRouteHistory(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RouteHistory | null> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{
        rota: {
          dataInicio: string;
          dataFim: string;
          localizacaoInicio: { latitude: number; longitude: number };
          localizacaoFim: { latitude: number; longitude: number };
          distancia: number;
          duracao: number;
          velocidadeMedia: number;
          velocidadeMaxima: number;
          combustivelConsumido?: number;
          pontos: SascarVehicle[];
        };
      }>(
        `${this.config.apiUrl}/veiculos/${vehicleId}/rotas?dataInicio=${startDate.toISOString()}&dataFim=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
        }
      );

      const rota = response.rota;

      return {
        vehicleId,
        startTime: new Date(rota.dataInicio),
        endTime: new Date(rota.dataFim),
        startLocation: rota.localizacaoInicio,
        endLocation: rota.localizacaoFim,
        distance: rota.distancia,
        duration: rota.duracao,
        averageSpeed: rota.velocidadeMedia,
        maxSpeed: rota.velocidadeMaxima,
        fuelConsumed: rota.combustivelConsumido,
        points: rota.pontos.map((point) => ({
          vehicleId,
          latitude: point.latitude,
          longitude: point.longitude,
          speed: point.velocidade,
          heading: point.direcao,
          timestamp: new Date(point.dataHora),
          provider: GPSProviderType.SASCAR,
          status: (point.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
        })),
        provider: GPSProviderType.SASCAR,
      };
    } catch (error) {
      console.error(`Failed to get route history for ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Reconhecer evento
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      await this.makeRequest<{ sucesso: boolean }>(
        `${this.config.apiUrl}/eventos/${alertId}/reconhecer`,
        {
          method: 'POST',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
          body: JSON.stringify({ idUsuario: userId }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to acknowledge alert ${alertId}:`, error);
      return false;
    }
  }

  /**
   * Definir geofence
   */
  async setGeofence(
    vehicleId: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<boolean> {
    try {
      if (!this.sessionToken) {
        await this.authenticate();
      }

      await this.makeRequest<{ sucesso: boolean }>(
        `${this.config.apiUrl}/veiculos/${vehicleId}/geocercas`,
        {
          method: 'POST',
          headers: {
            'X-Session-Token': this.sessionToken!,
          },
          body: JSON.stringify({ latitude, longitude, raio: radius }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to set geofence for ${vehicleId}:`, error);
      return false;
    }
  }

  /**
   * Mapear tipos de evento do Sascar para tipos padrão
   */
  private mapEventType(
    sascarType: string
  ): 'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'low_fuel' | 'engine_fault' | 'geofence_violation' | 'offline' | 'custom' {
    const mapping: Record<
      string,
      'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'low_fuel' | 'engine_fault' | 'geofence_violation' | 'offline' | 'custom'
    > = {
      EXCESSO_VELOCIDADE: 'speeding',
      FREAGEM_BRUSCA: 'harsh_braking',
      ACELERACAO_BRUSCA: 'harsh_acceleration',
      COMBUSTIVEL_BAIXO: 'low_fuel',
      FALHA_MOTOR: 'engine_fault',
      SAIDA_GEOCERCA: 'geofence_violation',
      VEICULO_OFFLINE: 'offline',
    };

    return mapping[sascarType] || 'custom';
  }
}
