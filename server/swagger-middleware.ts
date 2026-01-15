/**
 * Middleware Express para Servir Swagger UI
 * Expõe documentação interativa dos endpoints tRPC
 */

import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

/**
 * Configura Swagger UI no Express
 */
export function setupSwaggerUI(app: Express): void {
  // Gerar documento OpenAPI
  const openApiDoc = generateOpenApiDocument();

  // Servir Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDoc, {
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true,
        filter: true,
        showExtensions: true,
        deepLinking: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        presets: [
          swaggerUi.presets.apis,
          swaggerUi.SwaggerUIBundle.presets.SwaggerUIStandalonePreset,
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { font-size: 2em; }
        .swagger-ui .info .description { font-size: 1.1em; }
        .swagger-ui .scheme-container { background: #fafafa; }
        .swagger-ui .btn { border-radius: 4px; }
        .swagger-ui .model-box { background: #f5f5f5; }
      `,
      customSiteTitle: "Martins Frota Turismo - API Documentation",
      customfavIcon:
        "https://martinsfrota.com/favicon.ico",
    })
  );

  // Servir documento JSON
  app.get("/api/openapi.json", (req: Request, res: Response) => {
    res.json(openApiDoc);
  });

  // Servir documento YAML
  app.get("/api/openapi.yaml", (req: Request, res: Response) => {
    res.type("application/yaml");
    res.send(convertJsonToYaml(openApiDoc));
  });

  // Endpoint para listar todos os procedimentos
  app.get("/api/procedures", (req: Request, res: Response) => {
    const procedures = extractProcedures(openApiDoc);
    res.json({
      total: procedures.length,
      procedures,
    });
  });

  // Endpoint para buscar procedimento específico
  app.get("/api/procedures/:id", (req: Request, res: Response) => {
    const procedures = extractProcedures(openApiDoc);
    const procedure = procedures.find((p) => p.id === req.params.id);

    if (!procedure) {
      return res.status(404).json({ error: "Procedimento não encontrado" });
    }

    res.json(procedure);
  });

  console.log("✅ Swagger UI configurado em /api-docs");
}

/**
 * Gera documento OpenAPI completo
 */
function generateOpenApiDocument(): any {
  return {
    openapi: "3.0.0",
    info: {
      title: "Martins Frota Turismo - API",
      description: "API de Gestão de Transporte e Turismo com tRPC",
      version: "1.0.0",
      contact: {
        name: "Martins Frota Turismo",
        email: "api@martinsfrota.com",
        url: "https://martinsfrota.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Servidor de Produção",
      },
      {
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
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
    paths: {
      "/api/trpc/auth.me": {
        get: {
          tags: ["Autenticação"],
          summary: "Obter usuário autenticado",
          description: "Retorna informações do usuário atualmente autenticado",
          operationId: "getMe",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Usuário obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
            "401": {
              description: "Não autenticado",
            },
          },
        },
      },
      "/api/trpc/routes.list": {
        get: {
          tags: ["Rotas"],
          summary: "Listar rotas",
          description: "Retorna lista de todas as rotas otimizadas",
          operationId: "listRoutes",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            "200": {
              description: "Rotas obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      routes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Route" },
                      },
                      total: { type: "number" },
                      page: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
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
      },
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
            status: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
            },
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
            fuelType: {
              type: "string",
              enum: ["gasoline", "diesel", "ethanol", "electric"],
            },
            status: {
              type: "string",
              enum: ["active", "maintenance", "inactive"],
            },
          },
          required: ["id", "plate", "model", "year", "capacity"],
        },
      },
    },
  };
}

/**
 * Extrai lista de procedimentos do documento OpenAPI
 */
function extractProcedures(openApiDoc: any): any[] {
  const procedures: any[] = [];

  for (const [path, methods] of Object.entries(openApiDoc.paths || {})) {
    for (const [method, details] of Object.entries(methods || {})) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        procedures.push({
          id: `${method.toUpperCase()} ${path}`,
          path,
          method: method.toUpperCase(),
          summary: (details as any).summary,
          description: (details as any).description,
          tags: (details as any).tags,
          operationId: (details as any).operationId,
          security: (details as any).security,
        });
      }
    }
  }

  return procedures;
}

/**
 * Converte JSON para YAML (simples)
 */
function convertJsonToYaml(obj: any, indent = 0): string {
  let yaml = "";
  const spaces = " ".repeat(indent);

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      yaml += `${spaces}- ${convertJsonToYaml(item, indent + 2)}\n`;
    });
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        yaml += `${spaces}${key}:\n${convertJsonToYaml(value, indent + 2)}`;
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    }
  } else {
    yaml = `${spaces}${JSON.stringify(obj)}\n`;
  }

  return yaml;
}

/**
 * Exemplo de como usar o middleware
 */
export const swaggerMiddlewareExample = `
// ============================================================================
// EXEMPLO: Como Usar o Middleware Swagger
// ============================================================================

import express from "express";
import { setupSwaggerUI } from "./swagger-middleware";

const app = express();

// Configurar Swagger UI
setupSwaggerUI(app);

// Agora acesse:
// - http://localhost:3000/api-docs (Swagger UI interativo)
// - http://localhost:3000/api/openapi.json (Documento JSON)
// - http://localhost:3000/api/openapi.yaml (Documento YAML)
// - http://localhost:3000/api/procedures (Lista de procedimentos)
// - http://localhost:3000/api/procedures/:id (Detalhes de procedimento)
`;
