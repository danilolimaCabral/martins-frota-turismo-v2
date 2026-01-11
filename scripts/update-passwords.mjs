import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("🔐 Atualizando senhas para hash bcrypt...\n");

// Hash da senha "123456"
const hashedPassword = await bcrypt.hash("123456", 10);

// Atualiza todos os usuários
const allUsers = await db.select().from(users);

for (const user of allUsers) {
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id));
  
  console.log(`✅ Senha atualizada para usuário: ${user.username}`);
}

console.log("\n✅ Todas as senhas foram atualizadas com sucesso!");
console.log("Senha padrão: 123456");

await connection.end();
