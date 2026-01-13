# Guia de Integração com Sistemas de Rastreamento GPS

## 📋 Visão Geral

O sistema Martins Turismo possui uma **API genérica e flexível** para integração com qualquer sistema de rastreamento GPS. A arquitetura foi projetada para suportar múltiplos provedores simultaneamente, permitindo failover automático e sincronização de dados em tempo real.

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                    Aplicação React                      │
│              (Dashboard de Monitoramento)               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   tRPC Routers                          │
│              (gps-routers.ts)                           │
│  - getSupportedProviders()                              │
│  - listProviders()                                      │
│  - createProvider()                                     │
│  - syncNow()                                            │
│  - getLastLocation()                                    │
│  - getLocationHistory()                                 │
│  - getUnacknowledgedAlerts()                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            GPS Sync Service                             │
│         (server/gps/sync-service.ts)                    │
│  - Sincronização periódica                              │
│  - Gerenciamento de conexões                            │
│  - Persistência de dados                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         GPS Provider Factory                            │
│      (server/gps/provider-factory.ts)                   │
│  - Instanciação de provedores                           │
│  - Cache de conexões                                    │
│  - Validação de configurações                           │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌──────────┐
    │Onixsat │    │ Sascar │    │ Generic  │
    │Provider│    │Provider│    │REST      │
    └────────┘    └────────┘    └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    ┌─────────┐              ┌──────────────┐
    │Onixsat  │              │ Sascar API   │
    │API      │              │ ou Outro     │
    │         │              │ Provedor     │
    └─────────┘              └──────────────┘
```

## 🔌 Provedores Suportados

### 1. **Onixsat**
- **Tipo**: `onixsat`
- **URL Base**: `https://api.onixsat.com.br`
- **Autenticação**: API Key no header `X-API-Key`
- **Recursos**:
  - Rastreamento em tempo real
  - Alertas de velocidade
  - Histórico de rotas
  - Geofences
  - Telemetria (combustível, temperatura)

### 2. **Sascar**
- **Tipo**: `sascar`
- **URL Base**: `https://api.sascar.com.br`
- **Autenticação**: Username/Password ou Session Token
- **Recursos**:
  - Rastreamento de frotas
  - Eventos e alertas
  - Consumo de combustível
  - Relatórios de rotas

### 3. **Genérico REST**
- **Tipo**: `generic_rest`
- **Flexível**: Funciona com qualquer API REST
- **Autenticação**: API Key, Bearer Token ou Custom Headers
- **Configurável**: Endpoints e field mapping customizáveis

### 4. **Traccar** (Preparado para integração)
- **Tipo**: `traccar`
- **URL Base**: `https://demo.traccar.org`
- **Autenticação**: Username/Password
- **Recursos**: Open-source, auto-hospedável

## 🚀 Como Integrar um Novo Provedor

### Passo 1: Criar Adaptador

Crie um novo arquivo em `server/gps/providers/seu-provedor-provider.ts`:

```typescript
import { BaseGPSProvider } from '../base-provider';
import { GPSProviderConfig, VehicleLocation, GPSAlert } from '../types';

export class SeuProveedorProvider extends BaseGPSProvider {
  async authenticate(): Promise<boolean> {
    // Implementar autenticação
  }

  async getVehicles(): Promise<VehicleLocation[]> {
    // Implementar busca de veículos
  }

  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
    // Implementar busca de localização
  }

  async getAlerts(): Promise<GPSAlert[]> {
    // Implementar busca de alertas
  }

  async getRouteHistory(vehicleId: string, startDate: Date, endDate: Date) {
    // Implementar busca de histórico
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    // Implementar reconhecimento de alerta
  }

  async setGeofence(vehicleId: string, latitude: number, longitude: number, radius: number): Promise<boolean> {
    // Implementar geofence
  }
}
```

### Passo 2: Registrar no Factory

Edite `server/gps/provider-factory.ts`:

```typescript
import { SeuProveedorProvider } from './providers/seu-provedor-provider';

export class GPSProviderFactory {
  static createProvider(config: GPSProviderConfig): GPSProviderInterface {
    switch (config.type) {
      case GPSProviderType.SEU_PROVEDOR:
        return new SeuProveedorProvider(config);
      // ... outros casos
    }
  }
}
```

### Passo 3: Adicionar Tipo

Edite `server/gps/types.ts`:

```typescript
export enum GPSProviderType {
  SEU_PROVEDOR = 'seu_provedor',
  // ... outros tipos
}
```

## 📡 API tRPC - Endpoints Disponíveis

### Listar Provedores Suportados
```typescript
trpc.gps.getSupportedProviders.query()
```

### Criar Novo Provedor
```typescript
trpc.gps.createProvider.mutate({
  id: 'onixsat-1',
  type: 'onixsat',
  name: 'Onixsat - Frota Principal',
  apiKey: 'sua-api-key',
  apiUrl: 'https://api.onixsat.com.br',
  syncInterval: 30, // segundos
  credentials: {
    // Credenciais adicionais se necessário
  }
})
```

### Sincronizar Dados Manualmente
```typescript
trpc.gps.syncNow.mutate({
  providerId: 'onixsat-1'
})
```

### Obter Última Localização
```typescript
trpc.gps.getLastLocation.query({
  vehicleId: '1'
})
```

### Obter Histórico de Localizações
```typescript
trpc.gps.getLocationHistory.query({
  vehicleId: '1',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-12'),
  limit: 1000
})
```

### Obter Alertas Não Reconhecidos
```typescript
trpc.gps.getUnacknowledgedAlerts.query({
  vehicleId: '1' // opcional
})
```

### Reconhecer Alerta
```typescript
trpc.gps.acknowledgeAlert.mutate({
  alertId: 'alert-123',
  userId: '1'
})
```

## 🗄️ Banco de Dados

### Tabelas Criadas

#### `gps_locations`
Armazena histórico de localizações dos veículos.

```sql
CREATE TABLE gps_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(5, 2),
  heading INT,
  altitude DECIMAL(8, 2),
  accuracy DECIMAL(8, 2),
  timestamp TIMESTAMP,
  provider VARCHAR(50),
  provider_vehicle_id VARCHAR(100),
  fuel_level INT,
  temperature DECIMAL(5, 2),
  odometer DECIMAL(10, 2),
  status ENUM('moving', 'stopped', 'idle', 'offline'),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `gps_alerts`
Armazena alertas gerados pelos provedores.

```sql
CREATE TABLE gps_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  type VARCHAR(50),
  severity ENUM('low', 'medium', 'high', 'critical'),
  message TEXT,
  timestamp TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INT,
  acknowledged_at TIMESTAMP,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `gps_providers`
Configurações dos provedores de GPS.

```sql
CREATE TABLE gps_providers (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50),
  name VARCHAR(100),
  api_key TEXT,
  api_url TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  sync_interval INT DEFAULT 30,
  credentials TEXT,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `gps_geofences`
Define áreas de interesse para alertas.

```sql
CREATE TABLE gps_geofences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  name VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius DECIMAL(8, 2),
  type ENUM('entry', 'exit', 'both'),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `gps_route_history`
Histórico de rotas completas.

```sql
CREATE TABLE gps_route_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  start_latitude DECIMAL(10, 8),
  start_longitude DECIMAL(11, 8),
  end_latitude DECIMAL(10, 8),
  end_longitude DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  duration INT,
  average_speed DECIMAL(5, 2),
  max_speed DECIMAL(5, 2),
  fuel_consumed DECIMAL(8, 2),
  provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Sincronização em Tempo Real

### WebSocket Integration

O sistema usa **Socket.io** para atualizar posições em tempo real sem recarregar a página:

```typescript
// No frontend
import { useWebSocketTracking } from '@/hooks/useWebSocketTracking';

function MonitoringPage() {
  const { locations, alerts, isConnected } = useWebSocketTracking();

  return (
    <div>
      {isConnected ? 'Conectado' : 'Desconectado'}
      {locations.map(location => (
        <VehicleMarker key={location.vehicleId} location={location} />
      ))}
    </div>
  );
}
```

### Sincronização Automática

O serviço sincroniza dados automaticamente em intervalos configuráveis:

```typescript
// Iniciar sincronização
await gpsSyncService.startSync('onixsat-1', 30); // A cada 30 segundos

// Parar sincronização
gpsSyncService.stopSync('onixsat-1');

// Obter status
const status = gpsSyncService.getSyncStatus();
```

## 🔐 Segurança

### Boas Práticas

1. **Armazenar Credenciais com Segurança**
   - Use variáveis de ambiente para API keys
   - Criptografe credenciais no banco de dados
   - Implemente rotação de tokens

2. **Validação de Dados**
   - Valide todas as respostas da API
   - Implemente tratamento de erros robusto
   - Registre tentativas de acesso não autorizado

3. **Rate Limiting**
   - Implemente rate limiting para sincronizações
   - Respeite limites de API dos provedores
   - Implemente backoff exponencial para retries

## 📊 Monitoramento

### Métricas Importantes

```typescript
const stats = await trpc.gps.getStats.query();
// {
//   syncStatus: [
//     { providerId: 'onixsat-1', isRunning: true, isSyncing: false },
//     { providerId: 'sascar-1', isRunning: true, isSyncing: false }
//   ],
//   message: 'GPS integration ready'
// }
```

### Logs

Todos os eventos de GPS são registrados:
- Autenticação com provedores
- Sincronizações bem-sucedidas/falhadas
- Alertas gerados
- Erros de conexão

## 🧪 Testes

### Teste de Conexão

```typescript
// Criar provedor
const provider = GPSProviderFactory.createProvider({
  id: 'test-1',
  type: GPSProviderType.ONIXSAT,
  name: 'Test Provider',
  apiKey: 'test-key',
  apiUrl: 'https://api.onixsat.com.br',
  enabled: true,
  syncInterval: 30
});

// Testar autenticação
const isAuth = await provider.authenticate();
console.log('Autenticado:', isAuth);

// Testar sincronização
const result = await provider.sync();
console.log('Veículos sincronizados:', result.vehicles.length);
console.log('Alertas gerados:', result.alerts.length);
```

## 📞 Suporte

Para integrar um novo provedor ou reportar problemas:

1. Consulte a documentação da API do provedor
2. Implemente o adaptador seguindo o padrão
3. Teste com dados reais
4. Registre logs detalhados para debugging

## 🎯 Próximos Passos

1. ✅ Implementar adaptador para seu provedor
2. ✅ Testar sincronização
3. ✅ Configurar alertas
4. ✅ Integrar com dashboard
5. ✅ Implementar notificações em tempo real
