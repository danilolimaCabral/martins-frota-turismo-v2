import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não encontrada");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🔧 Inicializando usuário admin padrão...");

try {
  // Verificar se já existe admin
  const [existingAdmin] = await connection.execute(
    "SELECT * FROM local_users WHERE username = 'admin' LIMIT 1"
  );

  if (existingAdmin.length > 0) {
    console.log("✅ Usuário admin já existe!");
    process.exit(0);
  }

  // Criar admin padrão
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await connection.execute(
    `INSERT INTO local_users (username, password, email, name, role, permissions, active, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      "admin",
      hashedPassword,
      "admin@martinsturismo.com.br",
      "Administrador",
      "admin",
      JSON.stringify({
        rh: true,
        financeiro: true,
        frota: true,
        agenda: true,
        roteirizacao: true,
        relatorios: true
      }),
      1
    ]
  );

  console.log("✅ Usuário admin criado com sucesso!");
  console.log("📧 Username: admin");
  console.log("🔑 Password: admin123");
  console.log("⚠️  Altere a senha após o primeiro login!");

} catch (error) {
  console.error("❌ Erro ao criar admin:", error);
  process.exit(1);
} finally {
  await connection.end();
}
