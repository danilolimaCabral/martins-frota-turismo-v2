import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { localUsers } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Deletar usuário teste se existir
await db.delete(localUsers).where(eq(localUsers.username, "teste"));

// Hash da senha
const hashedPassword = await bcrypt.hash("teste123", 10);

// Criar usuário teste com permissões apenas para Frota
await db.insert(localUsers).values({
  username: "teste",
  password: hashedPassword,
  nome: "Usuário Teste",
  email: "teste@martinsturismo.com.br",
  role: "user",
  ativo: true,
  permissions: JSON.stringify({
    frota: true,
    rh: false,
    financeiro: false
  })
});

console.log("✅ Usuário teste criado com sucesso!");
console.log("Usuário: teste");
console.log("Senha: teste123");
console.log("Permissões: Apenas Frota");

await connection.end();
