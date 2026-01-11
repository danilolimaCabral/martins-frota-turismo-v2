import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, text, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import bcrypt from "bcryptjs";

// Definir schema inline
const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "funcionario", "motorista"]).default("funcionario").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

const db = drizzle(process.env.DATABASE_URL);

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await db.insert(users).values({
      username: "admin",
      password: passwordHash,
      name: "Administrador",
      email: "admin@martins.com.br",
      role: "admin",
      active: true,
      createdAt: new Date(),
    });
    
    console.log("✅ Usuário admin criado com sucesso!");
    console.log("Username: admin");
    console.log("Senha: admin123");
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error.message);
  }
  process.exit(0);
}

createAdmin();
