import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { funcionarios, folhasPagamento } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { CLTCalculator } from "./clt-calculator";
import { HoleriteGenerator } from "./holerite-generator";
import { gerarCNABDeFolha } from "./cnab-generator-simple";
import nodemailer from "nodemailer";

// Configurar transporte de email (usando variáveis de ambiente)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export const folhaPagamentoRouter = router({
  // Gerar holerite com cálculos CLT
  gerarHolerite: protectedProcedure
    .input(
      z.object({
        employeeId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number().min(2020),
        salarioBase: z.number().positive(),
        horasExtras: z.number().default(0),
        adicionais: z.number().default(0),
        descontos: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Buscar dados do funcionário
        const employee = await db
          .select()
          .from(funcionarios)
          .where(eq(funcionarios.id, input.employeeId))
          .limit(1);

        if (!employee || employee.length === 0) {
          throw new Error("Funcionário não encontrado");
        }

        const emp = employee[0];

        // Calcular impostos CLT
        const calculator = new CLTCalculator();
        const calculos = calculator.calcularFolha({
          salarioBase: input.salarioBase,
          horasExtras: input.horasExtras,
          adicionais: input.adicionais,
          descontos: input.descontos,
          mes: input.month,
          ano: input.year,
        });

        // Gerar holerite em HTML
        const generator = new HoleriteGenerator();
        const holeriteHTML = generator.gerarHTML({
          empresa: {
            nome: "Martins Viagens e Turismo",
            cnpj: "12.345.678/0001-90",
            endereco: "Rua das Viagens, 123",
            cidade: "Curitiba",
            estado: "PR",
          },
          funcionario: {
            nome: emp.name || "Sem nome",
            cpf: emp.cpf || "000.000.000-00",
            matricula: emp.id.toString(),
            cargo: emp.cargo || "Não informado",
            departamento: emp.departamento || "Não informado",
          },
          periodo: {
            mes: input.month,
            ano: input.year,
          },
          calculos,
        });

        return {
          success: true,
          holeriteHTML,
          calculos,
          employeeEmail: emp.email || "",
        };
      } catch (error) {
        console.error("Erro ao gerar holerite:", error);
        throw new Error(
          `Erro ao gerar holerite: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),

  // Enviar holerite por email
  enviarHoleritePorEmail: protectedProcedure
    .input(
      z.object({
        employeeId: z.number(),
        email: z.string().email(),
        holeriteHTML: z.string(),
        month: z.number(),
        year: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validar configuração SMTP
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
          throw new Error(
            "Configuração SMTP não definida. Verifique variáveis de ambiente."
          );
        }

        const mailOptions = {
          from: process.env.SMTP_USER,
          to: input.email,
          subject: `Holerite - ${input.month}/${input.year}`,
          html: input.holeriteHTML,
        };

        await transporter.sendMail(mailOptions);

        return {
          success: true,
          message: `Holerite enviado para ${input.email}`,
        };
      } catch (error) {
        console.error("Erro ao enviar email:", error);
        throw new Error(
          `Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),

  // Gerar CNAB 240 para folha
  gerarCNAB240: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020),
        funcionarios: z.array(
          z.object({
            employeeId: z.number(),
            salarioBase: z.number().positive(),
            horasExtras: z.number().default(0),
            adicionais: z.number().default(0),
            descontos: z.number().default(0),
          })
        ),
        empresa: z.object({
          cnpj: z.string(),
          nome: z.string(),
          banco: z.string().default("001"), // Banco do Brasil
          agencia: z.string(),
          conta: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Buscar dados de todos os funcionários
        const employees_data = await db
          .select()
          .from(funcionarios)
          .where(
            eq(funcionarios.status, "ativo")
          );

        // Calcular folha para cada funcionário
        const calculator = new CLTCalculator();
        const registros = input.funcionarios.map((func) => {
          const emp = employees_data.find((e) => e.id === func.employeeId);
          if (!emp) throw new Error(`Funcionário ${func.employeeId} não encontrado`);

          const calculos = calculator.calcularFolha({
            salarioBase: func.salarioBase,
            horasExtras: func.horasExtras,
            adicionais: func.adicionais,
            descontos: func.descontos,
            mes: input.month,
            ano: input.year,
          });

          return {
            cpf: emp.cpf || "00000000000",
            banco: input.empresa.banco,
            agencia: input.empresa.agencia,
            conta: input.empresa.conta,
            valor: calculos.liquidoReceber,
            nome: emp.name || "Sem nome",
          };
        });

        // Gerar arquivo CNAB 240
        const cnabContent = gerarCNABDeFolha({
          empresa: {
            cnpj: input.empresa.cnpj.replace(/[^0-9]/g, ''),
            razaoSocial: input.empresa.nome,
          },
          banco: {
            codigo: input.empresa.banco,
            agencia: input.empresa.agencia,
            conta: input.empresa.conta,
            digito: '0',
          },
          lote: {
            numero: 1,
            dataGeracao: new Date(),
          },
          funcionarios: registros.map(r => ({
            nome: r.nome,
            cpf: r.cpf.replace(/[^0-9]/g, ''),
            banco: {
              codigo: r.banco,
              agencia: r.agencia,
              conta: r.conta,
              digito: '0',
            },
            valor: r.valor,
          })),
        });

        return {
          success: true,
          cnabContent,
          filename: `CNAB240_FOLHA_${input.month}_${input.year}.txt`,
          totalRegistros: registros.length,
          totalValor: registros.reduce((sum, r) => sum + r.valor, 0),
        };
      } catch (error) {
        console.error("Erro ao gerar CNAB 240:", error);
        throw new Error(
          `Erro ao gerar CNAB 240: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),

  // Enviar holerites em lote por email
  enviarHoleritesEmLote: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020),
        funcionarios: z.array(
          z.object({
            employeeId: z.number(),
            salarioBase: z.number().positive(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const generator = new HoleriteGenerator();
        const calculator = new CLTCalculator();
        let enviados = 0;
        let erros = 0;

        for (const func of input.funcionarios) {
          try {
            // Buscar dados do funcionário
            const employee = await db
              .select()
              .from(funcionarios)
              .where(eq(funcionarios.id, func.employeeId))
              .limit(1);

            if (!employee || employee.length === 0) {
              erros++;
              continue;
            }

            const emp = employee[0];

            // Calcular folha
            const calculos = calculator.calcularFolha({
              salarioBase: func.salarioBase,
              horasExtras: 0,
              adicionais: 0,
              descontos: 0,
              mes: input.month,
              ano: input.year,
            });

            // Gerar holerite
            const holeriteHTML = generator.gerarHTML({
              empresa: {
                nome: "Martins Viagens e Turismo",
                cnpj: "12.345.678/0001-90",
                endereco: "Rua das Viagens, 123",
                cidade: "Curitiba",
                estado: "PR",
              },
              funcionario: {
                nome: emp.name || "Sem nome",
                cpf: emp.cpf || "000.000.000-00",
                matricula: emp.id.toString(),
                cargo: emp.cargo || "Não informado",
                departamento: emp.departamento || "Não informado",
              },
              periodo: {
                mes: input.month,
                ano: input.year,
              },
              calculos,
            });

            // Enviar email
            if (emp.email) {
              const mailOptions = {
                from: process.env.SMTP_USER,
                to: emp.email,
                subject: `Holerite - ${input.month}/${input.year}`,
                html: holeriteHTML,
              };

              await transporter.sendMail(mailOptions);
              enviados++;
            } else {
              erros++;
            }
          } catch (error) {
            console.error(`Erro ao processar funcionário ${func.employeeId}:`, error);
            erros++;
          }
        }

        return {
          success: true,
          enviados,
          erros,
          total: input.funcionarios.length,
          message: `${enviados} holerites enviados, ${erros} erros`,
        };
      } catch (error) {
        console.error("Erro ao enviar holerites em lote:", error);
        throw new Error(
          `Erro ao enviar holerites: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),
});
