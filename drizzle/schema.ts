import { int, mysqlTable, text, timestamp, varchar, decimal, mysqlEnum, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Sistema de Gestão de Frotas - Martins Viagens e Turismo
 * Schema completo do banco de dados
 */

// ==================== AUTENTICAÇÃO ====================

// Tabela antiga do Manus OAuth (manter para compatibilidade)
export const usersOld = mysqlTable("users_old", {
  id: int("id").autoincrement().primaryKey(),
  openId: text("openId").notNull().unique(),
  loginMethod: text("loginMethod").notNull(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

// Nova tabela de usuários com autenticação local
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(), // Hash bcrypt
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "funcionario", "motorista"]).default("funcionario").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== VEÍCULOS (FROTA) ====================

export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  plate: varchar("plate", { length: 10 }).notNull().unique(), // Placa
  type: mysqlEnum("type", ["van", "micro-onibus", "onibus"]).notNull(),
  brand: varchar("brand", { length: 100 }), // Marca
  model: varchar("model", { length: 100 }), // Modelo
  year: int("year"), // Ano
  capacity: int("capacity"), // Capacidade de passageiros
  color: varchar("color", { length: 50 }),
  chassis: varchar("chassis", { length: 100 }), // Chassi
  renavam: varchar("renavam", { length: 20 }),
  
  // Certificados e Registros
  anttNumber: varchar("anttNumber", { length: 50 }), // Número ANTT (Federal)
  anttExpiry: date("anttExpiry"), // Vencimento ANTT
  derNumber: varchar("derNumber", { length: 50 }), // Número DER (Estadual)
  derExpiry: date("derExpiry"), // Vencimento DER
  cadasturNumber: varchar("cadasturNumber", { length: 50 }), // Número Cadastur
  cadasturExpiry: date("cadasturExpiry"), // Vencimento Cadastur
  
  // Status
  status: mysqlEnum("status", ["ativo", "manutencao", "inativo"]).default("ativo").notNull(),
  currentKm: decimal("currentKm", { precision: 10, scale: 2 }).default("0"), // Quilometragem atual
  
  // Rastreamento
  gpsDevice: varchar("gpsDevice", { length: 100 }), // ID do dispositivo GPS
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ==================== MOTORISTAS ====================

export const drivers = mysqlTable("drivers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id), // Link com usuário
  name: text("name").notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  rg: varchar("rg", { length: 20 }),
  cnh: varchar("cnh", { length: 20 }).notNull(), // CNH
  cnhCategory: varchar("cnhCategory", { length: 5 }), // Categoria CNH
  cnhExpiry: date("cnhExpiry"), // Vencimento CNH
  
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  
  // Status
  status: mysqlEnum("status", ["ativo", "inativo", "ferias"]).default("ativo").notNull(),
  
  // Histórico
  hireDate: date("hireDate"), // Data de contratação
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

// ==================== CLIENTES ====================

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["pessoa-fisica", "pessoa-juridica"]).notNull(),
  name: text("name").notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }).unique(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  
  // Pessoa Jurídica
  companyName: text("companyName"), // Razão Social
  tradeName: text("tradeName"), // Nome Fantasia
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ==================== ORÇAMENTOS ====================

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").references(() => customers.id),
  
  // Dados da viagem
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureDate: date("departureDate"),
  returnDate: date("returnDate"),
  passengers: int("passengers"),
  vehicleType: mysqlEnum("vehicleType", ["van", "micro-onibus", "onibus"]),
  
  // Valores
  estimatedKm: decimal("estimatedKm", { precision: 10, scale: 2 }),
  pricePerKm: decimal("pricePerKm", { precision: 10, scale: 2 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["pendente", "enviado", "aprovado", "recusado", "expirado"]).default("pendente").notNull(),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// ==================== AGENDAMENTOS/RESERVAS ====================

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").references(() => quotes.id),
  customerId: int("customerId").references(() => customers.id).notNull(),
  vehicleId: int("vehicleId").references(() => vehicles.id),
  driverId: int("driverId").references(() => drivers.id),
  
  // Dados da viagem
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureDate: timestamp("departureDate").notNull(),
  returnDate: timestamp("returnDate"),
  passengers: int("passengers").notNull(),
  
  // Valores
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  paid: boolean("paid").default(false).notNull(),
  paymentDate: timestamp("paymentDate"),
  
  // Status
  status: mysqlEnum("status", ["pendente", "confirmado", "em-andamento", "concluido", "cancelado"]).default("pendente").notNull(),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ==================== VIAGENS ====================

export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").references(() => bookings.id).notNull(),
  vehicleId: int("vehicleId").references(() => vehicles.id).notNull(),
  driverId: int("driverId").references(() => drivers.id).notNull(),
  
  // Dados da viagem
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Quilometragem
  startKm: decimal("startKm", { precision: 10, scale: 2 }).notNull(),
  endKm: decimal("endKm", { precision: 10, scale: 2 }),
  totalKm: decimal("totalKm", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["planejada", "em-andamento", "concluida", "cancelada"]).default("planejada").notNull(),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

// ==================== MANUTENÇÕES ====================

export const maintenances = mysqlTable("maintenances", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").references(() => vehicles.id).notNull(),
  
  // Tipo
  type: mysqlEnum("type", ["preventiva", "corretiva", "revisao"]).notNull(),
  description: text("description").notNull(),
  
  // Datas
  scheduledDate: date("scheduledDate"),
  completedDate: date("completedDate"),
  
  // Valores
  cost: decimal("cost", { precision: 10, scale: 2 }),
  
  // Fornecedor/Oficina
  provider: text("provider"),
  
  // Quilometragem
  km: decimal("km", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["agendada", "em-andamento", "concluida", "cancelada"]).default("agendada").notNull(),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Maintenance = typeof maintenances.$inferSelect;
export type InsertMaintenance = typeof maintenances.$inferInsert;

// ==================== ABASTECIMENTOS ====================

export const fuelings = mysqlTable("fuelings", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").references(() => vehicles.id).notNull(),
  driverId: int("driverId").references(() => drivers.id),
  
  // Dados do abastecimento
  date: timestamp("date").notNull(),
  km: decimal("km", { precision: 10, scale: 2 }).notNull(),
  liters: decimal("liters", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("pricePerLiter", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).notNull(),
  
  // Local
  station: text("station"), // Posto
  city: text("city"),
  
  // Tipo de combustível
  fuelType: mysqlEnum("fuelType", ["gasolina", "etanol", "diesel", "gnv"]).notNull(),
  
  // Comprovante
  receipt: text("receipt"), // URL do comprovante
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Fueling = typeof fuelings.$inferSelect;
export type InsertFueling = typeof fuelings.$inferInsert;

// ==================== DESPESAS ====================

export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").references(() => vehicles.id),
  driverId: int("driverId").references(() => drivers.id),
  tripId: int("tripId").references(() => trips.id),
  userId: int("userId").references(() => users.id).notNull(), // Quem lançou
  
  // Dados da despesa
  date: date("date").notNull(),
  category: mysqlEnum("category", [
    "combustivel",
    "manutencao",
    "pedagio",
    "alimentacao",
    "hospedagem",
    "estacionamento",
    "multa",
    "outros"
  ]).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Comprovante
  receipt: text("receipt"), // URL do comprovante
  
  // Status
  status: mysqlEnum("status", ["pendente", "aprovada", "recusada"]).default("pendente").notNull(),
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ==================== CHATBOT ====================

export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull().unique(),
  customerName: text("customerName"),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  
  // Status
  status: mysqlEnum("status", ["ativa", "encerrada", "transferida"]).default("ativa").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").references(() => chatConversations.id).notNull(),
  
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ==================== AVALIAÇÕES ====================

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  
  // Cliente
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerCompany: varchar("customerCompany", { length: 200 }),
  
  // Avaliação
  rating: int("rating").notNull(), // 1-5 estrelas
  comment: text("comment").notNull(),
  
  // Viagem relacionada (opcional)
  tripId: int("tripId").references(() => trips.id),
  
  // Moderação
  status: mysqlEnum("status", ["pendente", "aprovada", "recusada"]).default("pendente").notNull(),
  moderatedBy: int("moderatedBy").references(() => users.id),
  moderatedAt: timestamp("moderatedAt"),
  moderationNotes: text("moderationNotes"),
  
  // Destaque
  featured: boolean("featured").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ==================== BLOG ====================

export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conteúdo
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt").notNull(), // Resumo/descrição curta
  content: text("content").notNull(), // Conteúdo completo em HTML/Markdown
  
  // Imagens
  coverImage: text("coverImage"), // URL da imagem de capa
  
  // Categorização
  category: mysqlEnum("category", [
    "praias",
    "montanhas",
    "cidades-historicas",
    "ecoturismo",
    "cultura",
    "gastronomia",
    "aventura",
    "eventos"
  ]).notNull(),
  
  // Tags (separadas por vírgula)
  tags: text("tags"),
  
  // Autor
  authorId: int("authorId").references(() => users.id).notNull(),
  authorName: varchar("authorName", { length: 200 }).notNull(),
  
  // SEO
  metaDescription: text("metaDescription"),
  metaKeywords: text("metaKeywords"),
  
  // Status
  status: mysqlEnum("status", ["rascunho", "publicado", "arquivado"]).default("rascunho").notNull(),
  publishedAt: timestamp("publishedAt"),
  
  // Estatísticas
  views: int("views").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(), // Destaque na home
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ==================== ROTEIRIZADOR INTELIGENTE ====================

export const rotas = mysqlTable("rotas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  empresaCliente: varchar("empresa_cliente", { length: 255 }).notNull(),
  dataViagem: date("data_viagem"),
  horarioSaida: varchar("horario_saida", { length: 10 }),
  
  // Resultados do processamento
  status: mysqlEnum("status", ["rascunho", "processando", "concluida", "arquivada"]).default("rascunho").notNull(),
  distanciaTotalKm: decimal("distancia_total_km", { precision: 10, scale: 2 }),
  tempoTotalMin: int("tempo_total_min"),
  veiculoSugerido: varchar("veiculo_sugerido", { length: 50 }),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Rota = typeof rotas.$inferSelect;
export type InsertRota = typeof rotas.$inferInsert;

export const passageirosRota = mysqlTable("passageiros_rota", {
  id: int("id").autoincrement().primaryKey(),
  rotaId: int("rota_id").references(() => rotas.id, { onDelete: "cascade" }).notNull(),
  
  // Dados do passageiro
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco").notNull(),
  telefone: varchar("telefone", { length: 20 }),
  
  // Geocodificação
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Otimização de rota
  pontoEmbarqueSugerido: text("ponto_embarque_sugerido"),
  ordemColeta: int("ordem_coleta"),
  horarioEstimado: varchar("horario_estimado", { length: 10 }),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PassageiroRota = typeof passageirosRota.$inferSelect;
export type InsertPassageiroRota = typeof passageirosRota.$inferInsert;

// ==================== SISTEMA DE MÓDULOS E PERMISSÕES ====================

export const modulos = mysqlTable("modulos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }), // Nome do ícone (ex: "Users", "DollarSign", "Truck")
  ordem: int("ordem").default(0), // Ordem de exibição no menu
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Modulo = typeof modulos.$inferSelect;
export type InsertModulo = typeof modulos.$inferInsert;

export const permissoesUsuario = mysqlTable("permissoes_usuario", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moduloId: int("modulo_id").references(() => modulos.id, { onDelete: "cascade" }).notNull(),
  podeVisualizar: boolean("pode_visualizar").default(true).notNull(),
  podeEditar: boolean("pode_editar").default(false).notNull(),
  podeDeletar: boolean("pode_deletar").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PermissaoUsuario = typeof permissoesUsuario.$inferSelect;
export type InsertPermissaoUsuario = typeof permissoesUsuario.$inferInsert;

// ==================== MÓDULO RH - FUNCIONÁRIOS ====================

export const funcionarios = mysqlTable("funcionarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id), // Link opcional com usuário do sistema
  
  // Dados Pessoais
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).unique().notNull(),
  rg: varchar("rg", { length: 20 }),
  rgOrgaoEmissor: varchar("rg_orgao_emissor", { length: 20 }),
  dataNascimento: date("data_nascimento"),
  sexo: mysqlEnum("sexo", ["M", "F", "Outro"]),
  estadoCivil: mysqlEnum("estado_civil", ["Solteiro", "Casado", "Divorciado", "Viuvo", "Uniao Estavel"]),
  
  // Contato
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  email: varchar("email", { length: 320 }),
  
  // Endereço
  cep: varchar("cep", { length: 10 }),
  endereco: text("endereco"),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  
  // Dados Contratuais
  dataAdmissao: date("data_admissao").notNull(),
  dataDemissao: date("data_demissao"),
  cargo: varchar("cargo", { length: 100 }).notNull(),
  departamento: varchar("departamento", { length: 100 }),
  tipoContrato: mysqlEnum("tipo_contrato", ["CLT", "PJ", "Estagiario", "Temporario"]).default("CLT").notNull(),
  
  // Dados Salariais
  salarioBase: decimal("salario_base", { precision: 10, scale: 2 }).notNull(),
  adicionalPericulosidade: decimal("adicional_periculosidade", { precision: 5, scale: 2 }).default("0"),
  adicionalInsalubridade: decimal("adicional_insalubridade", { precision: 5, scale: 2 }).default("0"),
  adicionalNoturno: decimal("adicional_noturno", { precision: 5, scale: 2 }).default("0"),
  valeTransporte: decimal("vale_transporte", { precision: 10, scale: 2 }).default("0"),
  valeAlimentacao: decimal("vale_alimentacao", { precision: 10, scale: 2 }).default("0"),
  planoSaude: decimal("plano_saude", { precision: 10, scale: 2 }).default("0"),
  
  // Dados Bancários
  banco: varchar("banco", { length: 100 }),
  agencia: varchar("agencia", { length: 20 }),
  conta: varchar("conta", { length: 30 }),
  tipoConta: mysqlEnum("tipo_conta", ["Corrente", "Poupanca", "Salario"]),
  pixChave: varchar("pix_chave", { length: 100 }),
  
  // Documentos Trabalhistas
  ctpsNumero: varchar("ctps_numero", { length: 20 }),
  ctpsSerie: varchar("ctps_serie", { length: 20 }),
  ctpsUf: varchar("ctps_uf", { length: 2 }),
  pisNumero: varchar("pis_numero", { length: 20 }),
  tituloEleitor: varchar("titulo_eleitor", { length: 20 }),
  reservista: varchar("reservista", { length: 20 }),
  
  // CNH (para motoristas)
  cnhNumero: varchar("cnh_numero", { length: 20 }),
  cnhCategoria: varchar("cnh_categoria", { length: 5 }),
  cnhValidade: date("cnh_validade"),
  
  // Status
  status: mysqlEnum("status", ["ativo", "ferias", "afastado", "demitido"]).default("ativo").notNull(),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Funcionario = typeof funcionarios.$inferSelect;
export type InsertFuncionario = typeof funcionarios.$inferInsert;

export const dependentes = mysqlTable("dependentes", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: date("data_nascimento").notNull(),
  parentesco: mysqlEnum("parentesco", ["Filho", "Filha", "Conjuge", "Pai", "Mae", "Outro"]).notNull(),
  dependenteIR: boolean("dependente_ir").default(true).notNull(), // Dependente para IR
  dependenteSF: boolean("dependente_sf").default(true).notNull(), // Dependente para Salário Família
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Dependente = typeof dependentes.$inferSelect;
export type InsertDependente = typeof dependentes.$inferInsert;

// ==================== MÓDULO FOLHA DE PAGAMENTO ====================

export const folhasPagamento = mysqlTable("folhas_pagamento", {
  id: int("id").autoincrement().primaryKey(),
  mesReferencia: int("mes_referencia").notNull(), // 1-12
  anoReferencia: int("ano_referencia").notNull(), // 2026
  status: mysqlEnum("status", ["aberta", "processando", "fechada", "paga"]).default("aberta").notNull(),
  dataFechamento: timestamp("data_fechamento"),
  dataPagamento: date("data_pagamento"),
  totalBruto: decimal("total_bruto", { precision: 12, scale: 2 }).default("0"),
  totalDescontos: decimal("total_descontos", { precision: 12, scale: 2 }).default("0"),
  totalLiquido: decimal("total_liquido", { precision: 12, scale: 2 }).default("0"),
  arquivoCnab: text("arquivo_cnab"), // Path do arquivo CNAB gerado
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FolhaPagamento = typeof folhasPagamento.$inferSelect;
export type InsertFolhaPagamento = typeof folhasPagamento.$inferInsert;

export const itensFolha = mysqlTable("itens_folha", {
  id: int("id").autoincrement().primaryKey(),
  folhaId: int("folha_id").references(() => folhasPagamento.id, { onDelete: "cascade" }).notNull(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id).notNull(),
  
  // Proventos
  salarioBase: decimal("salario_base", { precision: 10, scale: 2 }).default("0"),
  horasExtras50: decimal("horas_extras_50", { precision: 10, scale: 2 }).default("0"),
  horasExtras100: decimal("horas_extras_100", { precision: 10, scale: 2 }).default("0"),
  adicionalNoturno: decimal("adicional_noturno", { precision: 10, scale: 2 }).default("0"),
  adicionalPericulosidade: decimal("adicional_periculosidade", { precision: 10, scale: 2 }).default("0"),
  adicionalInsalubridade: decimal("adicional_insalubridade", { precision: 10, scale: 2 }).default("0"),
  comissoes: decimal("comissoes", { precision: 10, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  outrosProventos: decimal("outros_proventos", { precision: 10, scale: 2 }).default("0"),
  
  // Descontos
  inss: decimal("inss", { precision: 10, scale: 2 }).default("0"),
  irrf: decimal("irrf", { precision: 10, scale: 2 }).default("0"),
  fgts: decimal("fgts", { precision: 10, scale: 2 }).default("0"),
  valeTransporte: decimal("vale_transporte", { precision: 10, scale: 2 }).default("0"),
  valeAlimentacao: decimal("vale_alimentacao", { precision: 10, scale: 2 }).default("0"),
  planoSaude: decimal("plano_saude", { precision: 10, scale: 2 }).default("0"),
  adiantamento: decimal("adiantamento", { precision: 10, scale: 2 }).default("0"),
  faltas: decimal("faltas", { precision: 10, scale: 2 }).default("0"),
  outrosDescontos: decimal("outros_descontos", { precision: 10, scale: 2 }).default("0"),
  
  // Totais
  totalProventos: decimal("total_proventos", { precision: 10, scale: 2 }).default("0"),
  totalDescontos: decimal("total_descontos", { precision: 10, scale: 2 }).default("0"),
  salarioLiquido: decimal("salario_liquido", { precision: 10, scale: 2 }).default("0"),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ItemFolha = typeof itensFolha.$inferSelect;
export type InsertItemFolha = typeof itensFolha.$inferInsert;

export const horasExtras = mysqlTable("horas_extras", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  data: date("data").notNull(),
  horasTrabalhadas: decimal("horas_trabalhadas", { precision: 5, scale: 2 }).notNull(),
  tipo: mysqlEnum("tipo", ["50%", "100%", "Noturno"]).notNull(),
  valorHora: decimal("valor_hora", { precision: 10, scale: 2 }),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }),
  aprovado: boolean("aprovado").default(false).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HoraExtra = typeof horasExtras.$inferSelect;
export type InsertHoraExtra = typeof horasExtras.$inferInsert;

// ============================================
// MÓDULO: CHECK-LIST E MANUTENÇÃO
// ============================================

// Templates de Check-list
export const templatesChecklist = mysqlTable("templates_checklist", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipoVeiculo: mysqlEnum("tipo_veiculo", ["van", "onibus", "micro-onibus", "carro"]).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TemplateChecklist = typeof templatesChecklist.$inferSelect;
export type InsertTemplateChecklist = typeof templatesChecklist.$inferInsert;

// Itens do Template
export const itensTemplateChecklist = mysqlTable("itens_template_checklist", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("template_id").references(() => templatesChecklist.id, { onDelete: "cascade" }).notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  descricao: text("descricao").notNull(),
  ordem: int("ordem").notNull(),
  obrigatorio: boolean("obrigatorio").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ItemTemplateChecklist = typeof itensTemplateChecklist.$inferSelect;
export type InsertItemTemplateChecklist = typeof itensTemplateChecklist.$inferInsert;

// Check-lists Realizados
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  veiculoId: int("veiculo_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  motoristaId: int("motorista_id").references(() => drivers.id, { onDelete: "cascade" }).notNull(),
  templateId: int("template_id").references(() => templatesChecklist.id).notNull(),
  kmAtual: int("km_atual").notNull(),
  dataRealizacao: timestamp("data_realizacao").defaultNow().notNull(),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["em_andamento", "concluido", "cancelado"]).default("em_andamento").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

// Respostas do Check-list
export const respostasChecklist = mysqlTable("respostas_checklist", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklist_id").references(() => checklists.id, { onDelete: "cascade" }).notNull(),
  itemId: int("item_id").references(() => itensTemplateChecklist.id).notNull(),
  resposta: mysqlEnum("resposta", ["ok", "problema", "nao_aplicavel"]).notNull(),
  observacao: text("observacao"),
  fotoUrl: varchar("foto_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RespostaChecklist = typeof respostasChecklist.$inferSelect;
export type InsertRespostaChecklist = typeof respostasChecklist.$inferInsert;

// Fornecedores de Peças
export const fornecedoresPecas = mysqlTable("fornecedores_pecas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  endereco: text("endereco"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FornecedorPecas = typeof fornecedoresPecas.$inferSelect;
export type InsertFornecedorPecas = typeof fornecedoresPecas.$inferInsert;

// Peças (Estoque)
export const pecas = mysqlTable("pecas", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  nome: varchar("nome", { length: 200 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  fornecedorId: int("fornecedor_id").references(() => fornecedoresPecas.id),
  quantidadeEstoque: int("quantidade_estoque").default(0).notNull(),
  estoqueMinimo: int("estoque_minimo").default(0).notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).default("0"),
  localizacao: varchar("localizacao", { length: 100 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Peca = typeof pecas.$inferSelect;
export type InsertPeca = typeof pecas.$inferInsert;

// Movimentações de Estoque
export const movimentacoesEstoque = mysqlTable("movimentacoes_estoque", {
  id: int("id").autoincrement().primaryKey(),
  pecaId: int("peca_id").references(() => pecas.id, { onDelete: "cascade" }).notNull(),
  tipo: mysqlEnum("tipo", ["entrada", "saida", "ajuste"]).notNull(),
  quantidade: int("quantidade").notNull(),
  motivo: text("motivo"),
  ordemServicoId: int("ordem_servico_id"),
  usuarioId: int("usuario_id").references(() => users.id),
  dataMovimentacao: timestamp("data_movimentacao").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MovimentacaoEstoque = typeof movimentacoesEstoque.$inferSelect;
export type InsertMovimentacaoEstoque = typeof movimentacoesEstoque.$inferInsert;

// Ordens de Serviço
export const ordensServico = mysqlTable("ordens_servico", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 20 }).notNull().unique(),
  veiculoId: int("veiculo_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  checklistId: int("checklist_id").references(() => checklists.id),
  tipo: mysqlEnum("tipo", ["preventiva", "corretiva", "emergencial"]).notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  descricaoProblema: text("descricao_problema").notNull(),
  descricaoServico: text("descricao_servico"),
  status: mysqlEnum("status", ["pendente", "em_andamento", "aguardando_pecas", "concluida", "cancelada"]).default("pendente").notNull(),
  mecanicoResponsavel: varchar("mecanico_responsavel", { length: 100 }),
  dataAbertura: timestamp("data_abertura").defaultNow().notNull(),
  dataInicio: timestamp("data_inicio"),
  dataConclusao: timestamp("data_conclusao"),
  kmVeiculo: int("km_veiculo"),
  valorMaoObra: decimal("valor_mao_obra", { precision: 10, scale: 2 }).default("0"),
  valorPecas: decimal("valor_pecas", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).default("0"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = typeof ordensServico.$inferInsert;

// Peças Utilizadas na OS
export const pecasOrdemServico = mysqlTable("pecas_ordem_servico", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordem_servico_id").references(() => ordensServico.id, { onDelete: "cascade" }).notNull(),
  pecaId: int("peca_id").references(() => pecas.id).notNull(),
  quantidade: int("quantidade").notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PecaOrdemServico = typeof pecasOrdemServico.$inferSelect;
export type InsertPecaOrdemServico = typeof pecasOrdemServico.$inferInsert;

// Planos de Manutenção Preventiva
export const planosManutencaoPreventiva = mysqlTable("planos_manutencao_preventiva", {
  id: int("id").autoincrement().primaryKey(),
  veiculoId: int("veiculo_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  tipoManutencao: varchar("tipo_manutencao", { length: 100 }).notNull(),
  descricao: text("descricao"),
  intervaloKm: int("intervalo_km"),
  intervaloDias: int("intervalo_dias"),
  ultimaExecucaoKm: int("ultima_execucao_km"),
  ultimaExecucaoData: date("ultima_execucao_data"),
  proximaExecucaoKm: int("proxima_execucao_km"),
  proximaExecucaoData: date("proxima_execucao_data"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlanoManutencaoPreventiva = typeof planosManutencaoPreventiva.$inferSelect;
export type InsertPlanoManutencaoPreventiva = typeof planosManutencaoPreventiva.$inferInsert;
