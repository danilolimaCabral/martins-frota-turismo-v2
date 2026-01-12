import { db } from "../db";
import { auditLogs, type InsertAuditLog } from "../../drizzle/schema";

/**
 * Helper para registrar logs de auditoria
 * 
 * Uso:
 * ```ts
 * await logAudit({
 *   userId: ctx.user.id,
 *   username: ctx.user.username,
 *   action: "create",
 *   module: "rh",
 *   entity: "funcionarios",
 *   entityId: newEmployee.id,
 *   description: `Criou funcionário: ${newEmployee.nome}`,
 *   newValues: JSON.stringify(newEmployee),
 *   ipAddress: ctx.req?.ip,
 *   userAgent: ctx.req?.headers["user-agent"],
 * });
 * ```
 */

export interface AuditLogParams {
  userId?: number;
  username: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "approve" | "reject";
  module: string; // rh, financeiro, frota, agenda, roteirizacao, relatorios
  entity: string; // funcionarios, veiculos, despesas, etc.
  entityId?: number;
  description: string;
  oldValues?: string | object; // JSON string ou objeto
  newValues?: string | object; // JSON string ou objeto
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const logData: InsertAuditLog = {
      userId: params.userId,
      username: params.username,
      action: params.action,
      module: params.module,
      entity: params.entity,
      entityId: params.entityId,
      description: params.description,
      oldValues: typeof params.oldValues === "object" 
        ? JSON.stringify(params.oldValues) 
        : params.oldValues,
      newValues: typeof params.newValues === "object" 
        ? JSON.stringify(params.newValues) 
        : params.newValues,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    await db.insert(auditLogs).values(logData);
  } catch (error) {
    // Log error mas não falha a operação principal
    console.error("Erro ao registrar log de auditoria:", error);
  }
}

/**
 * Middleware helper para extrair IP e User-Agent do request
 */
export function getRequestInfo(req: any): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress,
    userAgent: req?.headers?.["user-agent"],
  };
}

/**
 * Helper para comparar objetos e gerar diff
 */
export function generateDiff(oldObj: any, newObj: any): { changed: string[]; oldValues: any; newValues: any } {
  const changed: string[] = [];
  const oldValues: any = {};
  const newValues: any = {};

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  allKeys.forEach(key => {
    if (JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj?.[key])) {
      changed.push(key);
      oldValues[key] = oldObj?.[key];
      newValues[key] = newObj?.[key];
    }
  });

  return { changed, oldValues, newValues };
}
