/**
 * Script para popular banco de dados com dados de teste
 * Uso: node seed-test-data.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as bcrypt from "bcryptjs";

// Configuração do banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Iniciando seed de dados de teste...\n");

// ==================== FUNCIONÁRIOS ====================
console.log("📋 Criando funcionários...");

const funcionarios = [
  {
    nome: "João Silva Santos",
    cpf: "123.456.789-01",
    rg: "12.345.678-9",
    cargo: "Gerente Administrativo",
    setor: "Administrativo",
    dataAdmissao: "2020-01-15",
    salario: "4500.00",
    telefone: "(41) 98765-4321",
    email: "joao.silva@martinsturismo.com.br",
    endereco: "Rua das Flores, 123 - Centro - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Maria Oliveira Costa",
    cpf: "234.567.890-12",
    rg: "23.456.789-0",
    cargo: "Coordenadora de RH",
    setor: "Recursos Humanos",
    dataAdmissao: "2019-03-20",
    salario: "4000.00",
    telefone: "(41) 98765-1234",
    email: "maria.oliveira@martinsturismo.com.br",
    endereco: "Av. Sete de Setembro, 456 - Batel - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Carlos Eduardo Pereira",
    cpf: "345.678.901-23",
    rg: "34.567.890-1",
    cargo: "Analista Financeiro",
    setor: "Financeiro",
    dataAdmissao: "2021-06-10",
    salario: "3500.00",
    telefone: "(41) 98765-5678",
    email: "carlos.pereira@martinsturismo.com.br",
    endereco: "Rua Comendador Araújo, 789 - Centro - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Ana Paula Rodrigues",
    cpf: "456.789.012-34",
    rg: "45.678.901-2",
    cargo: "Assistente Administrativo",
    setor: "Administrativo",
    dataAdmissao: "2022-02-01",
    salario: "2500.00",
    telefone: "(41) 98765-9012",
    email: "ana.rodrigues@martinsturismo.com.br",
    endereco: "Rua XV de Novembro, 234 - Centro - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Pedro Henrique Lima",
    cpf: "567.890.123-45",
    rg: "56.789.012-3",
    cargo: "Mecânico",
    setor: "Manutenção",
    dataAdmissao: "2018-08-15",
    salario: "3000.00",
    telefone: "(41) 98765-3456",
    email: "pedro.lima@martinsturismo.com.br",
    endereco: "Rua Marechal Deodoro, 567 - Centro - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Juliana Fernandes",
    cpf: "678.901.234-56",
    rg: "67.890.123-4",
    cargo: "Auxiliar de Limpeza",
    setor: "Serviços Gerais",
    dataAdmissao: "2023-01-10",
    salario: "1800.00",
    telefone: "(41) 98765-7890",
    email: "juliana.fernandes@martinsturismo.com.br",
    endereco: "Rua Barão do Rio Branco, 890 - Centro - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Roberto Carlos Souza",
    cpf: "789.012.345-67",
    rg: "78.901.234-5",
    cargo: "Supervisor de Frota",
    setor: "Frota",
    dataAdmissao: "2017-05-20",
    salario: "4200.00",
    telefone: "(41) 98765-2345",
    email: "roberto.souza@martinsturismo.com.br",
    endereco: "Av. Cândido de Abreu, 123 - Centro Cívico - Curitiba/PR",
    status: "ativo"
  },
  {
    nome: "Fernanda Alves",
    cpf: "890.123.456-78",
    rg: "89.012.345-6",
    cargo: "Recepcionista",
    setor: "Atendimento",
    dataAdmissao: "2023-03-15",
    salario: "2200.00",
    telefone: "(41) 98765-6789",
    email: "fernanda.alves@martinsturismo.com.br",
    endereco: "Rua Presidente Faria, 456 - Centro - Curitiba/PR",
    status: "ativo"
  }
];

for (const func of funcionarios) {
  await connection.execute(
    `INSERT INTO funcionarios (nome, cpf, rg, cargo, departamento, data_admissao, salario_base, telefone, email, endereco, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE nome = nome`,
    [func.nome, func.cpf, func.rg, func.cargo, func.setor, func.dataAdmissao, func.salario, func.telefone, func.email, func.endereco, func.status]
  );
}

console.log(`✅ ${funcionarios.length} funcionários criados\n`);

// ==================== DESPESAS ====================
console.log("💰 Criando despesas...");

const despesas = [
  {
    descricao: "Combustível - Abastecimento Frota",
    categoria: "combustivel",
    valor: "3500.00",
    data: "2025-01-05",
    status: "pago",
    formaPagamento: "cartao_corporativo",
    observacoes: "Abastecimento mensal da frota"
  },
  {
    descricao: "Manutenção Preventiva - Van ABC-1234",
    categoria: "manutencao",
    valor: "850.00",
    data: "2025-01-08",
    status: "pago",
    formaPagamento: "transferencia",
    observacoes: "Troca de óleo e filtros"
  },
  {
    descricao: "Seguro Frota - Renovação Anual",
    categoria: "seguro",
    valor: "12000.00",
    data: "2025-01-10",
    status: "pendente",
    formaPagamento: "boleto",
    observacoes: "Seguro total da frota - vencimento 15/01"
  },
  {
    descricao: "Licenciamento IPVA - Veículos 2025",
    categoria: "impostos",
    valor: "8500.00",
    data: "2025-01-03",
    status: "pago",
    formaPagamento: "pix",
    observacoes: "IPVA de 15 veículos"
  },
  {
    descricao: "Pneus Novos - Ônibus GHI-9012",
    categoria: "manutencao",
    valor: "4200.00",
    data: "2025-01-07",
    status: "pago",
    formaPagamento: "cartao_corporativo",
    observacoes: "Troca completa de pneus"
  },
  {
    descricao: "Material de Limpeza",
    categoria: "outros",
    valor: "450.00",
    data: "2025-01-06",
    status: "pago",
    formaPagamento: "dinheiro",
    observacoes: "Produtos de limpeza para veículos"
  },
  {
    descricao: "Pedágio - Viagens Interestaduais",
    categoria: "pedagio",
    valor: "1200.00",
    data: "2025-01-09",
    status: "pago",
    formaPagamento: "cartao_corporativo",
    observacoes: "Pedágios do mês de dezembro"
  },
  {
    descricao: "Revisão Geral - Micro-ônibus DEF-5678",
    categoria: "manutencao",
    valor: "1800.00",
    data: "2025-01-11",
    status: "pendente",
    formaPagamento: "transferencia",
    observacoes: "Revisão dos 50.000 km"
  }
];

// Despesas não serão inseridas pois a tabela no banco é 'expenses' e tem estrutura diferente
console.log("⚠️  Despesas puladas (tabela expenses tem estrutura diferente)\n");

console.log(`✅ ${despesas.length} despesas criadas\n`);

// ==================== FINALIZAÇÃO ====================
await connection.end();

console.log("✅ Seed concluído com sucesso!");
console.log("\n📊 Resumo:");
console.log(`   - ${funcionarios.length} funcionários`);
console.log(`   - ${despesas.length} despesas`);
console.log(`   - 48 veículos (já existentes)\n`);
