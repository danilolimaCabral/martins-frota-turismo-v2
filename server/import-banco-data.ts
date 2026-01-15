import { db } from "./db";
import { financialTransactions, financialAccounts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface BancoData {
  conta: string;
  saldoInicial: number;
  despesas: number;
  pagamentos: number;
  cobranca: number;
  depositos: number;
  recebimentoCartao: number;
  saldoFinal: number;
}

export async function importBancoData(data: BancoData[]) {
  try {
    console.log("🔄 Iniciando importação de dados de Banco...");

    for (const item of data) {
      // Verificar se conta já existe
      const existingAccount = await db
        .select()
        .from(financialAccounts)
        .where(eq(financialAccounts.accountName, item.conta))
        .limit(1);

      let accountId: number;

      if (existingAccount.length > 0) {
        accountId = existingAccount[0].id;
        console.log(`✅ Conta ${item.conta} já existe (ID: ${accountId})`);
      } else {
        // Criar nova conta
        const newAccount = await db
          .insert(financialAccounts)
          .values({
            accountName: item.conta,
            accountType: "bank",
            balance: item.saldoInicial,
            currency: "BRL",
            createdAt: new Date(),
          })
          .returning();

        accountId = newAccount[0].id;
        console.log(`✅ Conta ${item.conta} criada (ID: ${accountId})`);
      }

      // Registrar transações
      const transactions = [
        {
          description: "Saldo Inicial",
          amount: item.saldoInicial,
          type: "opening_balance" as const,
        },
        {
          description: "Despesas Bancárias",
          amount: -item.despesas,
          type: "expense" as const,
        },
        {
          description: "Pagamentos",
          amount: -item.pagamentos,
          type: "expense" as const,
        },
        {
          description: "Cobrança",
          amount: item.cobranca,
          type: "income" as const,
        },
        {
          description: "Depósitos",
          amount: item.depositos,
          type: "income" as const,
        },
        {
          description: "Recebimento Cartão",
          amount: item.recebimentoCartao,
          type: "income" as const,
        },
      ];

      for (const transaction of transactions) {
        if (transaction.amount !== 0) {
          await db.insert(financialTransactions).values({
            accountId,
            description: transaction.description,
            amount: transaction.amount,
            transactionType: transaction.type,
            transactionDate: new Date(),
            createdAt: new Date(),
          });
        }
      }
    }

    console.log("✅ Importação de dados de Banco concluída!");
    return { success: true, message: "Dados importados com sucesso" };
  } catch (error) {
    console.error("❌ Erro ao importar dados de Banco:", error);
    throw error;
  }
}
