/**
 * Factory para instanciar provedores de GPS
 * Gerencia criação e cache de instâncias de provedores
 */

import { GPSProviderConfig, GPSProviderType, GPSProviderInterface } from './types';
import { OnixsatProvider } from './providers/onixsat-provider';
import { SascarProvider } from './providers/sascar-provider';
import { GenericRestProvider } from './providers/generic-rest-provider';

export class GPSProviderFactory {
  private static providers: Map<string, GPSProviderInterface> = new Map();

  /**
   * Criar ou obter instância de um provedor
   */
  static createProvider(config: GPSProviderConfig): GPSProviderInterface {
    // Retornar provedor em cache se existir
    if (this.providers.has(config.id)) {
      return this.providers.get(config.id)!;
    }

    let provider: GPSProviderInterface;

    switch (config.type) {
      case GPSProviderType.ONIXSAT:
        provider = new OnixsatProvider(config);
        break;

      case GPSProviderType.SASCAR:
        provider = new SascarProvider(config);
        break;

      case GPSProviderType.GENERIC_REST:
        provider = new GenericRestProvider(config as any);
        break;

      default:
        throw new Error(`Unsupported GPS provider type: ${config.type}`);
    }

    // Armazenar em cache
    this.providers.set(config.id, provider);

    return provider;
  }

  /**
   * Obter provedor em cache
   */
  static getProvider(providerId: string): GPSProviderInterface | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Remover provedor do cache
   */
  static removeProvider(providerId: string): boolean {
    return this.providers.delete(providerId);
  }

  /**
   * Listar todos os provedores em cache
   */
  static getAllProviders(): GPSProviderInterface[] {
    return Array.from(this.providers.values());
  }

  /**
   * Limpar cache de provedores
   */
  static clearCache(): void {
    this.providers.clear();
  }

  /**
   * Validar configuração de provedor
   */
  static validateConfig(config: GPSProviderConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) errors.push('Provider ID is required');
    if (!config.name) errors.push('Provider name is required');
    if (!config.apiUrl) errors.push('API URL is required');
    if (!config.apiKey) errors.push('API Key is required');
    if (config.syncInterval < 5) errors.push('Sync interval must be at least 5 seconds');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obter tipos de provedores suportados
   */
  static getSupportedProviders(): Array<{
    type: GPSProviderType;
    name: string;
    description: string;
  }> {
    return [
      {
        type: GPSProviderType.ONIXSAT,
        name: 'Onixsat',
        description: 'Rastreador GPS especializado em frotas',
      },
      {
        type: GPSProviderType.SASCAR,
        name: 'Sascar',
        description: 'Solução completa com telemetria e combustível',
      },
      {
        type: GPSProviderType.GENERIC_REST,
        name: 'REST Genérico',
        description: 'API REST customizável para qualquer provedor',
      },
      {
        type: GPSProviderType.TRACCAR,
        name: 'Traccar',
        description: 'Plataforma open-source de rastreamento',
      },
    ];
  }
}
