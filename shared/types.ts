/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============================================================================
// ROTAS E COMPARTILHAMENTO
// ============================================================================

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface OptimizedRoute {
  id: number;
  name: string;
  description?: string;
  points: RoutePoint[];
  totalDistance: number;
  estimatedTime: number;
  fuelConsumption: number;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteShareInput {
  routeId: number;
  platform: "whatsapp" | "sms" | "email" | "qrcode" | "direct_link";
  sharedWithDriverId?: number;
  sharedWithEmail?: string;
  sharedWithPhone?: string;
}

export interface RouteShare {
  id: number;
  routeId: number;
  shareToken: string;
  platform: string;
  qrCodeUrl: string;
  qrCodeData: string;
  sharedWithDriverId?: number | null;
  sharedWithEmail?: string | null;
  sharedWithPhone?: string | null;
  sharedBy: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  resendAttempts?: number | null;
  lastResendAt?: Date | null;
  maxResendAttempts?: number;
}

export interface RouteShareEvent {
  id: number;
  shareId: number;
  eventType: "shared" | "viewed" | "clicked" | "accepted" | "rejected";
  userAgent?: string;
  ipAddress?: string;
  respondedAt?: Date;
  createdAt: Date;
}

export interface ShareStatistics {
  totalShares: number;
  totalViews: number;
  totalClicks: number;
  totalAccepted: number;
  totalRejected: number;
  acceptanceRate: number;
  averageResponseTime: number;
  byPlatform: Record<string, PlatformStats>;
}

export interface PlatformStats {
  platform: string;
  shares: number;
  views: number;
  clicks: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  averageResponseTime: number;
}

// ============================================================================
// MOTORISTAS
// ============================================================================

export interface Driver {
  id: number;
  name: string;
  email?: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: "active" | "inactive" | "suspended";
  acceptanceRate?: number;
  averageResponseTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverPerformance {
  driverId: number;
  driverName: string;
  totalShares: number;
  totalAccepted: number;
  totalRejected: number;
  acceptanceRate: number;
  averageResponseTime: number;
  lastResponseAt?: Date;
}

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================

export interface NotificationPayload {
  title: string;
  content: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
}

export interface WebSocketMessage {
  type: "registrar" | "notificacao" | "aceitar" | "rejeitar" | "atualizar";
  data: Record<string, any>;
  timestamp: Date;
}

export interface NotificacaoCliente {
  motoristaId: number;
  ws: any; // WebSocket type
}

// ============================================================================
// RESPOSTAS DE API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// CONTEXTO TRPC
// ============================================================================

export interface TRPCContext {
  user?: {
    id: number;
    email: string | null;
    name: string;
    role: "admin" | "user" | "funcionario" | "motorista";
  };
  req?: any;
  res?: any;
}

// ============================================================================
// VALIDAÇÕES
// ============================================================================

export type Platform = "whatsapp" | "sms" | "email" | "qrcode" | "direct_link";
export type EventType = "shared" | "viewed" | "clicked" | "accepted" | "rejected";
export type DriverStatus = "active" | "inactive" | "suspended";
export type NotificationType = "info" | "success" | "warning" | "error";
