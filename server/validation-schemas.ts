/**
 * Schemas Zod para Validação de Entrada
 * Garante type safety em runtime
 */

import { z } from "zod";

// ============================================================================
// GOOGLE MAPS E ROTAS
// ============================================================================

export const GoogleMapsPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().optional(),
  address: z.string().optional(),
});

export const GoogleMapsInputSchema = z.object({
  pontos: z.array(GoogleMapsPointSchema).min(2, "Mínimo 2 pontos necessários"),
  modo: z.enum(["driving", "walking", "bicycling", "transit"]).optional().default("driving"),
  idioma: z.string().optional().default("pt-BR"),
  unidade: z.enum(["metric", "imperial"]).optional().default("metric"),
});

export const WazeShareInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  nome: z.string().optional(),
  zoom: z.number().min(1).max(21).optional().default(15),
});

// ============================================================================
// COMPARTILHAMENTO DE ROTAS
// ============================================================================

export const RouteShareInputSchema = z.object({
  routeId: z.number().int().positive(),
  platform: z.enum(["whatsapp", "sms", "email", "qrcode", "direct_link"]),
  sharedWithDriverId: z.number().int().positive().optional(),
  sharedWithEmail: z.string().email().optional(),
  sharedWithPhone: z.string().min(10, "Telefone inválido").optional(),
});

// ============================================================================
// MOTORISTAS
// ============================================================================

export const DriverInputSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email().optional(),
  phone: z.string().min(10, "Telefone inválido"),
  licenseNumber: z.string().min(5, "Número de licença inválido"),
  licenseExpiry: z.date(),
  status: z.enum(["active", "inactive", "suspended"]).optional().default("active"),
});

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================

export const NotificationPayloadSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  type: z.enum(["info", "success", "warning", "error"]).optional().default("info"),
});

export const WebSocketMessageSchema = z.object({
  type: z.enum(["registrar", "notificacao", "aceitar", "rejeitar", "atualizar"]),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.date().optional().default(() => new Date()),
});

// ============================================================================
// PAGINAÇÃO
// ============================================================================

export const PaginationInputSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ============================================================================
// FILTROS
// ============================================================================

export const DateRangeFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const StatusFilterSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  includeArchived: z.boolean().optional().default(false),
});

// ============================================================================
// TIPOS DERIVADOS (TypeScript Inference)
// ============================================================================

export type GoogleMapsPoint = z.infer<typeof GoogleMapsPointSchema>;
export type GoogleMapsInput = z.infer<typeof GoogleMapsInputSchema>;
export type WazeShareInput = z.infer<typeof WazeShareInputSchema>;
export type RouteShareInput = z.infer<typeof RouteShareInputSchema>;
export type DriverInput = z.infer<typeof DriverInputSchema>;
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
export type PaginationInput = z.infer<typeof PaginationInputSchema>;
export type DateRangeFilter = z.infer<typeof DateRangeFilterSchema>;
export type StatusFilter = z.infer<typeof StatusFilterSchema>;
