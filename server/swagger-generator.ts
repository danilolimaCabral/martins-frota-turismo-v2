/**
 * Gerador de Documentação Swagger/OpenAPI para tRPC
 * Gera documentação interativa dos endpoints
 */

import { generateOpenApiDocument } from "trpc-openapi";
import type { AppRouter } from "./routers";

/**
 * Gera documento OpenAPI 3.0.0 para a API tRPC
 */
export function generateSwaggerDoc(router: AppRouter) {
  return generateOpenApiDocument(router, {
    title: "Martins Frota Turismo - API",
    description: "API de Gestão de Transporte e Turismo",
    version: "1.0.0",
    baseUrl: process.env.API_URL || "http://localhost:3000",
    docsUrl: "https://swagger.io",
    tags: [
      {
        name: "Autenticação",
        description: "Endpoints de autenticação e autorização",
      },
      {
        name: "Rotas",
        description: "Endpoints para gerenciamento de rotas otimizadas",
      },
      {
        name: "Motoristas",
        description: "Endpoints para gerenciamento de motoristas",
      },
      {
        name: "Veículos",
        description: "Endpoints para gerenciamento de veículos",
      },
      {
        name: "Financeiro",
        description: "Endpoints para gerenciamento financeiro",
      },
      {
        name: "Relatórios",
        description: "Endpoints para geração de relatórios",
      },
      {
        name: "Integrações",
        description: "Endpoints para integrações externas (CTA Smart, etc)",
      },
      {
        name: "Dashboard",
        description: "Endpoints para dashboards e analytics",
      },
    ],
  });
}

/**
 * Configuração de segurança OpenAPI
 */
export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT Bearer token",
  },
  apiKey: {
    type: "apiKey",
    in: "header",
    name: "X-API-Key",
    description: "API Key para acesso",
  },
};

/**
 * Componentes reutilizáveis do OpenAPI
 */
export const components = {
  schemas: {
    Error: {
      type: "object",
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        cause: { type: "object" },
      },
      required: ["code", "message"],
    },
    User: {
      type: "object",
      properties: {
        id: { type: "number" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
        role: { type: "string", enum: ["admin", "user"] },
        createdAt: { type: "string", format: "date-time" },
      },
      required: ["id", "email", "name", "role"],
    },
    Route: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        distance: { type: "number" },
        estimatedTime: { type: "string" },
        fuelCost: { type: "number" },
        savingsPercentage: { type: "number" },
        createdAt: { type: "string", format: "date-time" },
      },
      required: ["id", "name", "distance", "estimatedTime"],
    },
    Driver: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        licenseNumber: { type: "string" },
        licenseExpiry: { type: "string", format: "date" },
        status: { type: "string", enum: ["active", "inactive", "suspended"] },
      },
      required: ["id", "name", "email", "phone", "licenseNumber"],
    },
    Vehicle: {
      type: "object",
      properties: {
        id: { type: "number" },
        plate: { type: "string" },
        model: { type: "string" },
        year: { type: "number" },
        capacity: { type: "number" },
        fuelType: { type: "string", enum: ["gasoline", "diesel", "ethanol", "electric"] },
        status: { type: "string", enum: ["active", "maintenance", "inactive"] },
      },
      required: ["id", "plate", "model", "year", "capacity"],
    },
    Pagination: {
      type: "object",
      properties: {
        page: { type: "number", minimum: 1 },
        limit: { type: "number", minimum: 1, maximum: 100 },
        total: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  },
};

/**
 * Exemplo de resposta de erro
 */
export const errorResponses = {
  400: {
    description: "Requisição inválida",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  401: {
    description: "Não autenticado",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  403: {
    description: "Acesso proibido",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  404: {
    description: "Recurso não encontrado",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  500: {
    description: "Erro interno do servidor",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};

/**
 * Configuração de exemplo para Swagger UI
 */
export const swaggerUIConfig = {
  url: "/api/openapi.json",
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    deepLinking: true,
    presets: [
      "swaggerUIBundle.presets.apis",
      "swaggerUIBundle.SwaggerUIStandalonePreset",
    ],
    layout: "StandaloneLayout",
  },
};

/**
 * Gera tags para procedimentos baseado no nome do router
 */
export function getTagForRouter(routerName: string): string {
  const tagMap: Record<string, string> = {
    auth: "Autenticação",
    rota: "Rotas",
    motorista: "Motoristas",
    driver: "Motoristas",
    vehicle: "Veículos",
    financeiro: "Financeiro",
    relatorio: "Relatórios",
    report: "Relatórios",
    cta: "Integrações",
    dashboard: "Dashboard",
    agenda: "Agenda",
    alertas: "Alertas",
    checklist: "Checklist",
    blog: "Blog",
    contato: "Contato",
  };

  for (const [key, tag] of Object.entries(tagMap)) {
    if (routerName.toLowerCase().includes(key)) {
      return tag;
    }
  }

  return "Geral";
}

/**
 * Exemplo de como usar o gerador
 */
export const swaggerExample = `
// ============================================================================
// EXEMPLO: Como Usar o Gerador de Swagger
// ============================================================================

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerDoc, swaggerUIConfig } from "./swagger-generator";
import { appRouter } from "./routers";

// Gerar documento OpenAPI
const openApiDocument = generateSwaggerDoc(appRouter);

// Servir documentação Swagger
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(openApiDocument, swaggerUIConfig));

// Servir documento JSON
app.get("/api/openapi.json", (req, res) => {
  res.json(openApiDocument);
});

// Servir tRPC com OpenAPI
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
`;
