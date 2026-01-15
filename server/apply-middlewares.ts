/**
 * Script para Integrar Middlewares em Todos os Routers
 * Aplica validação automática, autenticação e logging
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

interface RouterProcedure {
  name: string;
  type: "query" | "mutation";
  isProtected: boolean;
  hasInput: boolean;
  inputType?: string;
}

interface RouterAnalysis {
  file: string;
  procedures: RouterProcedure[];
  hasValidationMiddleware: boolean;
  hasAuthMiddleware: boolean;
}

/**
 * Analisa um arquivo de router para identificar procedimentos
 */
async function analyzeRouter(filePath: string): Promise<RouterAnalysis> {
  const content = fs.readFileSync(filePath, "utf-8");

  const procedures: RouterProcedure[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar procedimentos
    const procMatch = line.match(/(\w+):\s*(protected|public)Procedure/);
    if (procMatch) {
      const name = procMatch[1];
      const isProtected = procMatch[2] === "protected";

      // Detectar tipo (query ou mutation)
      let type: "query" | "mutation" = "query";
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes(".mutation")) {
          type = "mutation";
          break;
        }
      }

      // Detectar se tem input
      let hasInput = false;
      let inputType = undefined;
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        if (lines[j].includes(".input(")) {
          hasInput = true;
          // Tentar extrair tipo de input
          const typeMatch = lines[j].match(/\.input\(\s*(\w+Schema|\w+Input)/);
          if (typeMatch) {
            inputType = typeMatch[1];
          }
          break;
        }
      }

      procedures.push({
        name,
        type,
        isProtected,
        hasInput,
        inputType,
      });
    }
  }

  const hasValidationMiddleware = content.includes("validateInput");
  const hasAuthMiddleware = content.includes("requireAuth");

  return {
    file: filePath,
    procedures,
    hasValidationMiddleware,
    hasAuthMiddleware,
  };
}

/**
 * Gera relatório de middlewares necessários
 */
async function generateMiddlewareReport(): Promise<void> {
  const serverDir = path.join(process.cwd(), "server");
  const routerFiles = await glob(`${serverDir}/**/*-routers.ts`, {
    ignore: `${serverDir}/**/*.test.ts`,
  });

  console.log(`\n📊 Análise de ${routerFiles.length} Routers\n`);
  console.log("=".repeat(80));

  const analyses: RouterAnalysis[] = [];
  let totalProcedures = 0;
  let proceduresNeedingValidation = 0;
  let proceduresNeedingAuth = 0;

  for (const file of routerFiles) {
    const analysis = await analyzeRouter(file);
    analyses.push(analysis);

    const relativePath = path.relative(serverDir, file);
    console.log(`\n📄 ${relativePath}`);
    console.log(`   Procedimentos: ${analysis.procedures.length}`);

    if (analysis.procedures.length > 0) {
      console.log("   ├─ Detalhes:");
      for (const proc of analysis.procedures) {
        const icon = proc.type === "mutation" ? "✏️" : "📖";
        const auth = proc.isProtected ? "🔒" : "🔓";
        const input = proc.hasInput ? `(${proc.inputType || "input"})` : "";
        console.log(`   │  ${icon} ${auth} ${proc.name}${input}`);
      }
    }

    totalProcedures += analysis.procedures.length;
    proceduresNeedingValidation += analysis.procedures.filter((p) => p.hasInput).length;
    proceduresNeedingAuth += analysis.procedures.filter((p) => p.isProtected).length;

    if (!analysis.hasValidationMiddleware && analysis.procedures.some((p) => p.hasInput)) {
      console.log("   ⚠️  Falta: validateInput middleware");
    }
    if (!analysis.hasAuthMiddleware && analysis.procedures.some((p) => p.isProtected)) {
      console.log("   ⚠️  Falta: requireAuth middleware");
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📈 Resumo Geral:");
  console.log(`   Total de Routers: ${routerFiles.length}`);
  console.log(`   Total de Procedimentos: ${totalProcedures}`);
  console.log(`   Procedimentos com Input: ${proceduresNeedingValidation}`);
  console.log(`   Procedimentos Protegidos: ${proceduresNeedingAuth}`);

  // Salvar relatório em JSON
  const reportPath = path.join(serverDir, "middleware-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalRouters: routerFiles.length,
        totalProcedures,
        proceduresNeedingValidation,
        proceduresNeedingAuth,
        routers: analyses.map((a) => ({
          file: path.relative(serverDir, a.file),
          procedures: a.procedures.length,
          needsValidation: a.procedures.some((p) => p.hasInput) && !a.hasValidationMiddleware,
          needsAuth: a.procedures.some((p) => p.isProtected) && !a.hasAuthMiddleware,
        })),
      },
      null,
      2
    )
  );

  console.log(`\n✅ Relatório salvo em: ${reportPath}\n`);
}

/**
 * Gera código de exemplo para aplicar middlewares
 */
function generateMiddlewareExample(): void {
  const example = `
// ============================================================================
// EXEMPLO: Como Aplicar Middlewares em um Router
// ============================================================================

import { validateInput, requireAuth, requireRole, logProcedure, compose } from "./validation-middleware";
import { MyInputSchema } from "./validation-schemas";

export const myRouter = router({
  // Exemplo 1: Procedimento com validação de input
  myMutation: protectedProcedure
    .use(validateInput(MyInputSchema))
    .use(logProcedure)
    .input(MyInputSchema)
    .mutation(async ({ input, ctx }) => {
      // input já foi validado automaticamente
      return { sucesso: true };
    }),

  // Exemplo 2: Procedimento com múltiplos middlewares
  adminOnly: protectedProcedure
    .use(requireRole("admin"))
    .use(logProcedure)
    .query(async ({ ctx }) => {
      // Apenas admins podem acessar
      return { data: "admin-only" };
    }),

  // Exemplo 3: Procedimento com composição de middlewares
  complexProcedure: protectedProcedure
    .use(compose([requireAuth, requireRole("admin"), logProcedure]))
    .input(MyInputSchema)
    .mutation(async ({ input, ctx }) => {
      return { sucesso: true };
    }),
});
`;

  console.log(example);
}

/**
 * Executa a análise
 */
async function main(): Promise<void> {
  try {
    await generateMiddlewareReport();
    generateMiddlewareExample();
  } catch (error) {
    console.error("Erro ao analisar routers:", error);
    process.exit(1);
  }
}

main();
