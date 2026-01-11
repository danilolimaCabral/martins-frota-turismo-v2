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
  
  // Documentação
  ipvaExpiry: date("ipvaExpiry"), // Vencimento IPVA
  insuranceExpiry: date("insuranceExpiry"), // Vencimento Seguro
  licenseExpiry: date("licenseExpiry"), // Vencimento Licenciamento
  
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
