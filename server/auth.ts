import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "martins-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token válido por 7 dias

export interface JWTPayload {
  userId: number;
  email: string | null;
  role: "admin" | "funcionario" | "motorista";
}

/**
 * Gera hash da senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara senha com hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Autentica usuário com username e senha
 */
export async function authenticateUserByUsername(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    // Busca usuário pelo username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verifica senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Senha incorreta" };
    }

    // Gera token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove hash da senha antes de retornar e garante que active existe
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        active: userWithoutPassword.active ?? true, // Garante que active sempre existe
      },
    };
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return { success: false, error: "Erro ao autenticar usuário" };
  }
}

/**
 * Gera JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Autentica usuário com email e senha
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    // Busca usuário pelo email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verifica senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Senha incorreta" };
    }

    // Gera token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove hash da senha antes de retornar e garante que active existe
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        active: userWithoutPassword.active ?? true, // Garante que active sempre existe
      },
    };
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return { success: false, error: "Erro ao autenticar usuário" };
  }
}

/**
 * Cria novo usuário
 */
export async function createUser(data: {
  username: string;
  name: string;
  email?: string;
  password: string;
  role: "admin" | "funcionario" | "motorista";
  phone?: string;
}) {
  try {
    // Verifica se username já existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existingUser) {
      return { success: false, error: "Username já cadastrado" };
    }

    // Gera hash da senha
    const passwordHash = await hashPassword(data.password);

    // Insere usuário no banco
    await db.insert(users).values({
      username: data.username,
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      phone: data.phone,
      createdAt: new Date(),
    });

    // Busca o usuário criado
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (!newUser) {
      return { success: false, error: "Erro ao criar usuário" };
    }

    // Remove hash da senha antes de retornar
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: "Erro ao criar usuário" };
  }
}

/**
 * Busca usuário por ID
 */
export async function getUserById(userId: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    // Remove hash da senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}
