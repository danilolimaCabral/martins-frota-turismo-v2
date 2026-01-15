/**
 * Testes de Type-Checking com tsd
 * Valida tipos em tempo de compilação
 */

import { expectType, expectAssignable, expectNotAssignable } from "tsd";
import type {
  GoogleMapsPoint,
  GoogleMapsInput,
  GoogleMapsResponse,
  WazeShareInput,
  WazeShareResponse,
  RouteShareInput,
  DriverInput,
  NotificationPayload,
  TRPCContext,
  RotaOtimizada,
  RotaCompartilhada,
} from "../shared/types";

// ============================================================================
// GOOGLE MAPS TYPES
// ============================================================================

// GoogleMapsPoint deve ter latitude e longitude
const point: GoogleMapsPoint = {
  latitude: -25.425123,
  longitude: -49.215634,
  name: "Curitiba",
  address: "Rua Konrad Adenauer",
};

expectType<number>(point.latitude);
expectType<number>(point.longitude);
expectType<string | undefined>(point.name);

// GoogleMapsInput deve ter array de pontos
const mapsInput: GoogleMapsInput = {
  pontos: [point, point],
  modo: "driving",
  idioma: "pt-BR",
  unidade: "metric",
};

expectType<GoogleMapsPoint[]>(mapsInput.pontos);
expectAssignable<GoogleMapsInput>(mapsInput);

// GoogleMapsResponse deve ter sucesso e link
const mapsResponse: GoogleMapsResponse = {
  sucesso: true,
  link_google_maps: "https://maps.google.com",
  pontos_totais: 2,
  destino: "-25.425123, -49.215634",
};

expectType<boolean>(mapsResponse.sucesso);
expectType<string>(mapsResponse.link_google_maps);

// ============================================================================
// WAZE TYPES
// ============================================================================

// WazeShareInput deve ter latitude e longitude
const wazeInput: WazeShareInput = {
  latitude: -25.425123,
  longitude: -49.215634,
  nome: "Destino",
  zoom: 15,
};

expectType<number>(wazeInput.latitude);
expectType<number>(wazeInput.longitude);

// WazeShareResponse deve ter url_waze
const wazeResponse: WazeShareResponse = {
  sucesso: true,
  url_waze: "https://waze.com/ul",
  latitude: -25.425123,
  longitude: -49.215634,
};

expectType<string>(wazeResponse.url_waze);

// ============================================================================
// ROUTE SHARING TYPES
// ============================================================================

// RouteShareInput deve ter routeId e platform
const shareInput: RouteShareInput = {
  routeId: 1,
  platform: "whatsapp",
  sharedWithDriverId: 5,
};

expectType<number>(shareInput.routeId);
expectAssignable<RouteShareInput>(shareInput);

// ============================================================================
// DRIVER TYPES
// ============================================================================

// DriverInput deve ter name, phone, licenseNumber
const driverInput: DriverInput = {
  name: "João Silva",
  email: "joao@example.com",
  phone: "11999999999",
  licenseNumber: "ABC123456",
  licenseExpiry: new Date("2025-12-31"),
  status: "active",
};

expectType<string>(driverInput.name);
expectType<string>(driverInput.phone);
expectType<Date>(driverInput.licenseExpiry);

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

// NotificationPayload deve ter title e content
const notification: NotificationPayload = {
  title: "Nova Rota",
  content: "Você tem uma nova rota para compartilhar",
  type: "info",
};

expectType<string>(notification.title);
expectType<string>(notification.content);

// ============================================================================
// TRPC CONTEXT TYPES
// ============================================================================

// TRPCContext deve ter user opcional
const context: TRPCContext = {
  user: {
    id: 1,
    email: "user@example.com",
    name: "User",
    role: "admin",
  },
};

expectType<{ id: number; email: string | null; name: string; role: string } | undefined>(context.user);

// ============================================================================
// ROTA TYPES
// ============================================================================

// RotaOtimizada deve ter id, nome, pontos
const rota: RotaOtimizada = {
  id: 1,
  nome: "Rota Centro",
  descricao: "Rota otimizada do centro",
  pontos: [point, point],
  distancia_total: 50,
  tempo_estimado: "1h30m",
  custo_combustivel: 25.5,
  economia_percentual: 15,
  economia_valor: 10,
  criada_em: new Date(),
  atualizada_em: new Date(),
};

expectType<number>(rota.id);
expectType<string>(rota.nome);
expectType<GoogleMapsPoint[]>(rota.pontos);

// RotaCompartilhada deve ter token_compartilhamento
const rotaCompartilhada: RotaCompartilhada = {
  id: 1,
  rota_id: 1,
  token_compartilhamento: "abc123",
  plataforma: "whatsapp",
  url_compartilhamento: "https://example.com/share/abc123",
  compartilhada_por: 1,
  data_compartilhamento: new Date(),
  data_expiracao: new Date(),
  ativa: true,
};

expectType<string>(rotaCompartilhada.token_compartilhamento);

// ============================================================================
// TYPE SAFETY CHECKS
// ============================================================================

// Deve rejeitar latitude inválida
// @ts-expect-error Latitude deve estar entre -90 e 90
const invalidPoint: GoogleMapsPoint = {
  latitude: 95,
  longitude: -49.215634,
};

// Deve rejeitar platform inválida
// @ts-expect-error Platform deve ser um dos valores enum
const invalidShare: RouteShareInput = {
  routeId: 1,
  platform: "invalid_platform" as any,
};

// Deve rejeitar role inválida
// @ts-expect-error Role deve ser 'admin' ou 'user'
const invalidContext: TRPCContext = {
  user: {
    id: 1,
    email: "user@example.com",
    name: "User",
    role: "invalid_role" as any,
  },
};
