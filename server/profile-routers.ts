import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { localUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const profileRouter = router({
  // Obter perfil do usuário logado
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, ctx.user.id))
      .limit(1);
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    // Retornar sem a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }),

  // Atualizar dados pessoais
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        updatedAt: new Date(),
      };
      if (input.name) updateData.nome = input.name;
      if (input.email) updateData.email = input.email;

      await db
        .update(localUsers)
        .set(updateData)
        .where(eq(localUsers.id, ctx.user.id));

      return { success: true };
    }),

  // Alterar senha
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Buscar usuário com senha
      const [user] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, ctx.user.id))
        .limit(1);

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Verificar senha atual
      const isValid = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new Error("Senha atual incorreta");
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Atualizar senha
      await db
        .update(localUsers)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(localUsers.id, ctx.user.id));

      return { success: true };
    }),
});
