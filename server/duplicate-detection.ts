import { z } from "zod";
import { db } from "./db";
import { Levenshtein } from "js-levenshtein";

/**
 * Módulo de Detecção e Merge Automático de Duplicatas
 * Detecta endereços similares durante importação de viagens
 */

// Tipos
export interface DuplicateMatch {
  original: string;
  duplicate: string;
  similarity: number; // 0-1
  confidence: "high" | "medium" | "low";
}

export interface MergeAction {
  originalId: number;
  duplicateIds: number[];
  action: "merge" | "keep_separate";
  reason: string;
}

/**
 * Calcula similaridade entre duas strings usando Levenshtein
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1;

  const distance = Levenshtein(s1, s2);
  return 1 - distance / maxLength;
}

/**
 * Normaliza endereço para comparação
 */
export function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "") // Remove pontuação
    .replace(/\b(rua|av|avenida|praca|pça|travessa|trav|alameda|estrada|estr|rodovia|rod|via|vl)\b/g, "")
    .trim();
}

/**
 * Detecta duplicatas em uma lista de endereços
 */
export function detectDuplicates(addresses: string[], threshold = 0.85): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];
  const normalized = addresses.map((addr) => normalizeAddress(addr));

  for (let i = 0; i < addresses.length; i++) {
    for (let j = i + 1; j < addresses.length; j++) {
      const similarity = calculateSimilarity(normalized[i], normalized[j]);

      if (similarity >= threshold) {
        const confidence = similarity >= 0.95 ? "high" : similarity >= 0.9 ? "medium" : "low";

        duplicates.push({
          original: addresses[i],
          duplicate: addresses[j],
          similarity,
          confidence,
        });
      }
    }
  }

  return duplicates;
}

/**
 * Detecta duplicatas em banco de dados
 */
export async function detectDuplicatesInDatabase(
  newAddresses: string[],
  tableName: string = "viagens"
): Promise<DuplicateMatch[]> {
  try {
    // Buscar endereços existentes do banco
    const query = `SELECT DISTINCT endereco FROM ${tableName} WHERE endereco IS NOT NULL`;
    const [existingRows] = await db.execute(query);
    const existingAddresses = (existingRows as any[]).map((row) => row.endereco);

    const duplicates: DuplicateMatch[] = [];

    // Comparar novos endereços com existentes
    for (const newAddr of newAddresses) {
      for (const existingAddr of existingAddresses) {
        const similarity = calculateSimilarity(newAddr, existingAddr);

        if (similarity >= 0.85) {
          const confidence = similarity >= 0.95 ? "high" : similarity >= 0.9 ? "medium" : "low";

          duplicates.push({
            original: existingAddr,
            duplicate: newAddr,
            similarity,
            confidence,
          });
        }
      }
    }

    return duplicates;
  } catch (error) {
    console.error("❌ Erro ao detectar duplicatas no banco:", error);
    return [];
  }
}

/**
 * Sugere ações de merge baseado em confiança
 */
export function suggestMergeActions(duplicates: DuplicateMatch[]): MergeAction[] {
  const actions: MergeAction[] = [];
  const processed = new Set<string>();

  for (const dup of duplicates) {
    const key = [dup.original, dup.duplicate].sort().join("|");

    if (processed.has(key)) continue;
    processed.add(key);

    if (dup.confidence === "high") {
      actions.push({
        originalId: 0, // Será preenchido pelo chamador
        duplicateIds: [],
        action: "merge",
        reason: `Alta confiança de duplicata (${(dup.similarity * 100).toFixed(1)}%)`,
      });
    } else if (dup.confidence === "medium") {
      actions.push({
        originalId: 0,
        duplicateIds: [],
        action: "keep_separate",
        reason: `Confiança média (${(dup.similarity * 100).toFixed(1)}%) - requer revisão manual`,
      });
    }
  }

  return actions;
}

/**
 * Realiza merge de endereços duplicados
 */
export async function mergeDuplicateAddresses(
  primaryAddress: string,
  duplicateAddresses: string[],
  tableName: string = "viagens"
): Promise<{ success: boolean; mergedCount: number; error?: string }> {
  try {
    let mergedCount = 0;

    for (const dupAddr of duplicateAddresses) {
      const query = `UPDATE ${tableName} SET endereco = ? WHERE endereco = ?`;
      const [result] = await db.execute(query, [primaryAddress, dupAddr]);
      mergedCount += (result as any).affectedRows || 0;
    }

    return { success: true, mergedCount };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, mergedCount: 0, error: errorMsg };
  }
}

/**
 * Gera relatório de duplicatas
 */
export function generateDuplicateReport(duplicates: DuplicateMatch[]): {
  total: number;
  high: number;
  medium: number;
  low: number;
  summary: string;
} {
  const high = duplicates.filter((d) => d.confidence === "high").length;
  const medium = duplicates.filter((d) => d.confidence === "medium").length;
  const low = duplicates.filter((d) => d.confidence === "low").length;

  return {
    total: duplicates.length,
    high,
    medium,
    low,
    summary: `Total: ${duplicates.length} | Alta: ${high} | Média: ${medium} | Baixa: ${low}`,
  };
}

// Exemplo de uso
export async function exampleUsage() {
  const addresses = [
    "Rua das Flores, 123, Curitiba",
    "Rua das Flores 123 Curitiba",
    "Avenida Paulista, 1000, São Paulo",
    "Av. Paulista 1000 São Paulo",
    "Rua Independência, 456, Belo Horizonte",
  ];

  console.log("🔍 Detectando duplicatas...\n");

  const duplicates = detectDuplicates(addresses, 0.85);
  const report = generateDuplicateReport(duplicates);

  console.log(report.summary);
  console.log("\nDuplicatas encontradas:");

  for (const dup of duplicates) {
    console.log(
      `  • "${dup.original}" ↔ "${dup.duplicate}" (${(dup.similarity * 100).toFixed(1)}% - ${dup.confidence})`
    );
  }

  const actions = suggestMergeActions(duplicates);
  console.log("\nAções sugeridas:");

  for (const action of actions) {
    console.log(`  • ${action.action}: ${action.reason}`);
  }
}
