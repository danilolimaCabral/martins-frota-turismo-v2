import { int, mysqlTable, text, timestamp, varchar, decimal, mysqlEnum, boolean, date, json, time } from "drizzle-orm/mysql-core";

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
  
  // Identificação
  fleetNumber: varchar("fleetNumber", { length: 50 }).notNull(), // Número de frota (mín 5 caracteres)
  plate: varchar("plate", { length: 10 }).notNull().unique(), // Placa
  type: mysqlEnum("type", ["van", "micro-onibus", "onibus"]).notNull(),
  brand: varchar("brand", { length: 100 }), // Marca
  model: varchar("model", { length: 100 }), // Modelo
  year: int("year"), // Ano
  capacity: int("capacity"), // Capacidade de passageiros
  capacityKg: int("capacityKg"), // Capacidade de carga em kg
  capacityM3: decimal("capacityM3", { precision: 8, scale: 2 }), // Capacidade de volume em m3
  currentLoad: int("currentLoad").default(0), // Carga atual em kg
  currentPassengers: int("currentPassengers").default(0), // Passageiros atuais
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
  
  // Documentação de Veículos
  // Seguro RCO
  rcoExpiry: date("rcoExpiry"), // Validade do Seguro RCO
  rcoHasThirdParty: boolean("rcoHasThirdParty").default(false), // Tem cobertura de terceiros
  
  // Vistoria IMETRO
  imetroExpiry: date("imetroExpiry"), // Validade da Vistoria IMETRO
  
  // Aferição Tacógrafo
  tachographExpiry: date("tachographExpiry"), // Validade da Aferição do Tacógrafo
  
  // IPVA
  ipvaExpiry: date("ipvaExpiry"), // Validade do IPVA
  ipvaIsInstallment: boolean("ipvaIsInstallment").default(false), // IPVA parcelado
  ipvaInstallments: int("ipvaInstallments"), // Número de parcelas do IPVA
  
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


// ============================================
// MÓDULO: CONTROLE DE PONTO
// ============================================

export const registrosPonto = mysqlTable("registros_ponto", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  data: date("data").notNull(),
  
  // Horários
  entradaManha: varchar("entrada_manha", { length: 5 }), // HH:MM
  saidaManha: varchar("saida_manha", { length: 5 }),
  entradaTarde: varchar("entrada_tarde", { length: 5 }),
  saidaTarde: varchar("saida_tarde", { length: 5 }),
  
  // Horas calculadas
  horasTrabalhadas: decimal("horas_trabalhadas", { precision: 5, scale: 2 }).default("0"),
  horasExtras50: decimal("horas_extras_50", { precision: 5, scale: 2 }).default("0"),
  horasExtras100: decimal("horas_extras_100", { precision: 5, scale: 2 }).default("0"),
  horasNoturnas: decimal("horas_noturnas", { precision: 5, scale: 2 }).default("0"),
  
  // Status
  atraso: boolean("atraso").default(false).notNull(),
  minutosAtraso: int("minutos_atraso").default(0),
  falta: boolean("falta").default(false).notNull(),
  justificativa: text("justificativa"),
  
  // Aprovação
  aprovado: boolean("aprovado").default(false).notNull(),
  aprovadoPor: int("aprovado_por").references(() => users.id),
  dataAprovacao: timestamp("data_aprovacao"),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RegistroPonto = typeof registrosPonto.$inferSelect;
export type InsertRegistroPonto = typeof registrosPonto.$inferInsert;

// Banco de Horas
export const bancoHoras = mysqlTable("banco_horas", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  mesReferencia: int("mes_referencia").notNull(), // 1-12
  anoReferencia: int("ano_referencia").notNull(), // 2026
  
  saldoAnterior: decimal("saldo_anterior", { precision: 6, scale: 2 }).default("0"),
  horasExtras: decimal("horas_extras", { precision: 6, scale: 2 }).default("0"),
  horasCompensadas: decimal("horas_compensadas", { precision: 6, scale: 2 }).default("0"),
  saldoAtual: decimal("saldo_atual", { precision: 6, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BancoHoras = typeof bancoHoras.$inferSelect;
export type InsertBancoHoras = typeof bancoHoras.$inferInsert;

// ============================================
// MÓDULO: FÉRIAS
// ============================================

export const ferias = mysqlTable("ferias", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  
  // Período aquisitivo
  periodoAquisitivoInicio: date("periodo_aquisitivo_inicio").notNull(),
  periodoAquisitivoFim: date("periodo_aquisitivo_fim").notNull(),
  
  // Período de gozo
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  diasCorridos: int("dias_corridos").notNull(),
  diasUteis: int("dias_uteis").notNull(),
  
  // Abono pecuniário (venda de férias)
  abonoPecuniario: boolean("abono_pecuniario").default(false).notNull(),
  diasAbono: int("dias_abono").default(0),
  
  // Adiantamento 13º
  adiantamento13: boolean("adiantamento_13").default(false).notNull(),
  
  // Status
  status: mysqlEnum("status", ["solicitado", "aprovado", "reprovado", "em_gozo", "concluido", "cancelado"]).default("solicitado").notNull(),
  
  // Aprovação
  solicitadoEm: timestamp("solicitado_em").defaultNow().notNull(),
  aprovadoPor: int("aprovado_por").references(() => users.id),
  dataAprovacao: timestamp("data_aprovacao"),
  motivoReprovacao: text("motivo_reprovacao"),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Ferias = typeof ferias.$inferSelect;
export type InsertFerias = typeof ferias.$inferInsert;

// Saldo de Férias
export const saldoFerias = mysqlTable("saldo_ferias", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  
  // Período aquisitivo
  periodoAquisitivoInicio: date("periodo_aquisitivo_inicio").notNull(),
  periodoAquisitivoFim: date("periodo_aquisitivo_fim").notNull(),
  
  // Dias
  diasDireito: int("dias_direito").default(30).notNull(), // 30 dias padrão
  diasGozados: int("dias_gozados").default(0).notNull(),
  diasAbono: int("dias_abono").default(0).notNull(),
  diasDisponiveis: int("dias_disponiveis").default(30).notNull(),
  
  // Status
  vencido: boolean("vencido").default(false).notNull(),
  dataVencimento: date("data_vencimento").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SaldoFerias = typeof saldoFerias.$inferSelect;
export type InsertSaldoFerias = typeof saldoFerias.$inferInsert;


// ============================================
// MÓDULO: LANÇAMENTOS RH (CRÉDITOS E DÉBITOS)
// ============================================

export const lancamentosRH = mysqlTable("lancamentos_rh", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  folhaPagamentoId: int("folha_pagamento_id").references(() => folhasPagamento.id, { onDelete: "set null" }),
  
  // Tipo de lançamento
  tipo: mysqlEnum("tipo", ["credito", "debito"]).notNull(),
  
  // Categoria
  categoria: mysqlEnum("categoria", [
    // Créditos
    "salario",
    "hora_extra_50",
    "hora_extra_100",
    "adicional_noturno",
    "adicional_periculosidade",
    "adicional_insalubridade",
    "comissao",
    "bonus",
    "gratificacao",
    "ferias",
    "decimo_terceiro",
    "vale_transporte",
    "vale_alimentacao",
    "vale_refeicao",
    "auxilio_creche",
    "plano_saude",
    "seguro_vida",
    "outros_creditos",
    // Débitos
    "adiantamento_salarial",
    "desconto_falta",
    "desconto_atraso",
    "inss",
    "irrf",
    "vale_transporte_desc",
    "vale_alimentacao_desc",
    "plano_saude_desc",
    "emprestimo",
    "pensao_alimenticia",
    "outros_debitos"
  ]).notNull(),
  
  // Descrição e valor
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  
  // Referência
  mesReferencia: int("mes_referencia").notNull(), // 1-12
  anoReferencia: int("ano_referencia").notNull(), // 2026
  dataLancamento: date("data_lancamento").notNull(),
  
  // Observações
  observacoes: text("observacoes"),
  
  // Comprovante
  comprovanteUrl: varchar("comprovante_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by").references(() => users.id),
});

export type LancamentoRH = typeof lancamentosRH.$inferSelect;
export type InsertLancamentoRH = typeof lancamentosRH.$inferInsert;

// ============================================
// MÓDULO: ALERTAS DE DOCUMENTOS
// ============================================

export const alertasDocumentos = mysqlTable("alertas_documentos", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionario_id").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  
  // Tipo de documento
  tipoDocumento: mysqlEnum("tipo_documento", [
    "cnh",
    "exame_medico",
    "certificado_curso",
    "contrato_trabalho",
    "seguro_vida",
    "outro"
  ]).notNull(),
  
  // Datas
  dataVencimento: date("data_vencimento").notNull(),
  dataAlerta: date("data_alerta").notNull(), // Data para começar a alertar (ex: 30 dias antes)
  
  // Status
  status: mysqlEnum("status", ["pendente", "alertado", "renovado", "vencido"]).default("pendente").notNull(),
  
  // Descrição
  descricao: text("descricao").notNull(),
  observacoes: text("observacoes"),
  
  // Notificações
  notificadoEm: timestamp("notificado_em"),
  notificadoPara: text("notificado_para"), // Emails separados por vírgula
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AlertaDocumento = typeof alertasDocumentos.$inferSelect;
export type InsertAlertaDocumento = typeof alertasDocumentos.$inferInsert;


// ============================================
// MÓDULO: FINANCEIRO
// ============================================

// Categorias Financeiras
export const categoriasFinanceiras = mysqlTable("categorias_financeiras", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  tipo: mysqlEnum("tipo", ["receita", "despesa"]).notNull(),
  cor: varchar("cor", { length: 7 }).default("#3B82F6"), // Hex color
  icone: varchar("icone", { length: 50 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CategoriaFinanceira = typeof categoriasFinanceiras.$inferSelect;
export type InsertCategoriaFinanceira = typeof categoriasFinanceiras.$inferInsert;

// Contas a Pagar
export const contasPagar = mysqlTable("contas_pagar", {
  id: int("id").autoincrement().primaryKey(),
  categoriaId: int("categoria_id").references(() => categoriasFinanceiras.id),
  
  // Dados da conta
  descricao: text("descricao").notNull(),
  fornecedor: varchar("fornecedor", { length: 255 }),
  numeroDocumento: varchar("numero_documento", { length: 100 }),
  
  // Valores
  valorOriginal: decimal("valor_original", { precision: 10, scale: 2 }).notNull(),
  valorPago: decimal("valor_pago", { precision: 10, scale: 2 }).default("0"),
  valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default("0"),
  valorJuros: decimal("valor_juros", { precision: 10, scale: 2 }).default("0"),
  valorMulta: decimal("valor_multa", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  
  // Datas
  dataEmissao: date("data_emissao").notNull(),
  dataVencimento: date("data_vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  
  // Status
  status: mysqlEnum("status", ["pendente", "paga", "vencida", "cancelada"]).default("pendente").notNull(),
  
  // Recorrência
  recorrente: boolean("recorrente").default(false).notNull(),
  frequencia: mysqlEnum("frequencia", ["mensal", "bimestral", "trimestral", "semestral", "anual"]),
  
  // Comprovante
  comprovanteUrl: varchar("comprovante_url", { length: 500 }),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContaPagar = typeof contasPagar.$inferSelect;
export type InsertContaPagar = typeof contasPagar.$inferInsert;

// Contas a Receber
export const contasReceber = mysqlTable("contas_receber", {
  id: int("id").autoincrement().primaryKey(),
  categoriaId: int("categoria_id").references(() => categoriasFinanceiras.id),
  
  // Dados da conta
  descricao: text("descricao").notNull(),
  cliente: varchar("cliente", { length: 255 }),
  numeroDocumento: varchar("numero_documento", { length: 100 }),
  
  // Valores
  valorOriginal: decimal("valor_original", { precision: 10, scale: 2 }).notNull(),
  valorRecebido: decimal("valor_recebido", { precision: 10, scale: 2 }).default("0"),
  valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default("0"),
  valorJuros: decimal("valor_juros", { precision: 10, scale: 2 }).default("0"),
  valorMulta: decimal("valor_multa", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  
  // Datas
  dataEmissao: date("data_emissao").notNull(),
  dataVencimento: date("data_vencimento").notNull(),
  dataRecebimento: date("data_recebimento"),
  
  // Status
  status: mysqlEnum("status", ["pendente", "recebida", "vencida", "cancelada"]).default("pendente").notNull(),
  
  // Recorrência
  recorrente: boolean("recorrente").default(false).notNull(),
  frequencia: mysqlEnum("frequencia", ["mensal", "bimestral", "trimestral", "semestral", "anual"]),
  
  // Comprovante
  comprovanteUrl: varchar("comprovante_url", { length: 500 }),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContaReceber = typeof contasReceber.$inferSelect;
export type InsertContaReceber = typeof contasReceber.$inferInsert;

// Movimentações de Caixa
export const movimentacoesCaixa = mysqlTable("movimentacoes_caixa", {
  id: int("id").autoincrement().primaryKey(),
  categoriaId: int("categoria_id").references(() => categoriasFinanceiras.id),
  
  // Tipo de movimentação
  tipo: mysqlEnum("tipo", ["entrada", "saida"]).notNull(),
  
  // Dados
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  data: date("data").notNull(),
  
  // Forma de pagamento
  formaPagamento: mysqlEnum("forma_pagamento", [
    "dinheiro",
    "cartao_credito",
    "cartao_debito",
    "pix",
    "transferencia",
    "boleto",
    "cheque"
  ]).notNull(),
  
  // Relacionamento (opcional)
  contaPagarId: int("conta_pagar_id").references(() => contasPagar.id),
  contaReceberId: int("conta_receber_id").references(() => contasReceber.id),
  
  // Comprovante
  comprovanteUrl: varchar("comprovante_url", { length: 500 }),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by").references(() => users.id),
});

export type MovimentacaoCaixa = typeof movimentacoesCaixa.$inferSelect;
export type InsertMovimentacaoCaixa = typeof movimentacoesCaixa.$inferInsert;

// Extratos Bancários
export const extratosBancarios = mysqlTable("extratos_bancarios", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados bancários
  banco: varchar("banco", { length: 100 }).notNull(),
  agencia: varchar("agencia", { length: 20 }).notNull(),
  conta: varchar("conta", { length: 30 }).notNull(),
  
  // Movimentação
  data: date("data").notNull(),
  descricao: text("descricao").notNull(),
  documento: varchar("documento", { length: 100 }),
  
  // Valores
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  tipo: mysqlEnum("tipo", ["credito", "debito"]).notNull(),
  saldo: decimal("saldo", { precision: 10, scale: 2 }),
  
  // Conciliação
  conciliado: boolean("conciliado").default(false).notNull(),
  dataConciliacao: timestamp("data_conciliacao"),
  movimentacaoCaixaId: int("movimentacao_caixa_id").references(() => movimentacoesCaixa.id),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ExtratoBancario = typeof extratosBancarios.$inferSelect;
export type InsertExtratoBancario = typeof extratosBancarios.$inferInsert;


// ============================================
// MÓDULO: AGENDA DE COMPROMISSOS
// ============================================

export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados do Evento
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipoServico: mysqlEnum("tipo_servico", ["viagem", "especial", "fretamento", "transfer", "excursao"]).default("viagem").notNull(),
  
  // Datas
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim").notNull(),
  
  // Cliente
  clienteId: int("cliente_id"),
  clienteNome: varchar("cliente_nome", { length: 255 }),
  clienteTelefone: varchar("cliente_telefone", { length: 20 }),
  clienteEmail: varchar("cliente_email", { length: 320 }),
  
  // Veículo
  veiculoId: int("veiculo_id").references(() => vehicles.id),
  
  // Motorista
  motoristaId: int("motorista_id").references(() => drivers.id),
  
  // Valores
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).default("0"),
  valorPago: decimal("valor_pago", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("status", ["agendado", "confirmado", "em_andamento", "concluido", "cancelado"]).default("agendado").notNull(),
  
  // Localização
  enderecoOrigem: text("endereco_origem"),
  enderecoDestino: text("endereco_destino"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdBy: int("created_by").references(() => users.id),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

// Pagamentos do Evento
export const pagamentosEvento = mysqlTable("pagamentos_evento", {
  id: int("id").autoincrement().primaryKey(),
  eventoId: int("evento_id").references(() => eventos.id, { onDelete: "cascade" }).notNull(),
  
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataPagamento: timestamp("data_pagamento").notNull(),
  formaPagamento: mysqlEnum("forma_pagamento", ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "boleto", "cheque"]).notNull(),
  
  comprovante: text("comprovante"), // URL do comprovante
  observacoes: text("observacoes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PagamentoEvento = typeof pagamentosEvento.$inferSelect;
export type InsertPagamentoEvento = typeof pagamentosEvento.$inferInsert;


// ============================================
// TABELA DE USUÁRIOS LOCAIS (SEM MANUS OAUTH)
// ============================================

export const localUsers = mysqlTable("local_users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Hash bcrypt
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  ativo: boolean("ativo").notNull().default(true),
  // Permissões granulares por módulo (JSON string)
  permissions: text("permissions").default("{}"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================
// LOGS DE AUDITORIA
// ============================================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => localUsers.id),
  username: varchar("username", { length: 100 }).notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "login", "logout", "approve", "reject"]).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // rh, financeiro, frota, agenda, etc.
  entity: varchar("entity", { length: 100 }).notNull(), // funcionarios, veiculos, despesas, etc.
  entityId: int("entity_id"), // ID do registro afetado
  description: text("description").notNull(), // Descrição detalhada da ação
  oldValues: text("old_values"), // JSON com valores antigos (para updates)
  newValues: text("new_values"), // JSON com valores novos (para creates/updates)
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 ou IPv6
  userAgent: text("user_agent"), // Navegador/dispositivo
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ==================== MÓDULO FINANCEIRO - CNAB ====================

export const cnabArquivos = mysqlTable("cnab_arquivos", {
  id: int("id").autoincrement().primaryKey(),
  folhaId: int("folha_id").references(() => folhasPagamento.id, { onDelete: "cascade" }).notNull(),
  nomeArquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(), // Conteúdo do arquivo CNAB240
  status: mysqlEnum("status", ["gerado", "enviado", "processado", "erro"]).default("gerado").notNull(),
  dataGeracao: timestamp("data_geracao").defaultNow().notNull(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow().onUpdateNow(),
  dataEnvio: timestamp("data_envio"),
  dataProcessamento: timestamp("data_processamento"),
  retorno: text("retorno"), // Retorno do banco (se houver)
  observacoes: text("observacoes"),
});

export type CNABArquivo = typeof cnabArquivos.$inferSelect;
export type InsertCNABArquivo = typeof cnabArquivos.$inferInsert;


// ==================== GESTÃO DE ROLES E PERMISSÕES ====================

/**
 * Tabela de Roles (Papéis/Cargos)
 * Define os diferentes papéis disponíveis no sistema
 */
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // Ex: Gerente, Supervisor, Manutenção, Diretor, RH, Financeiro
  description: text("description"),
  color: varchar("color", { length: 20 }), // Cor para UI
  icon: varchar("icon", { length: 50 }), // Ícone para UI
  isSystemRole: boolean("is_system_role").default(false), // Se é um role do sistema (não pode deletar)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * Tabela de Módulos
 * Define os módulos/funcionalidades disponíveis no sistema
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // Ex: RH, Financeiro, Roteirização, etc
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Ícone do módulo
  path: varchar("path", { length: 200 }), // Rota da página
  color: varchar("color", { length: 20 }), // Cor para UI
  order: int("order").default(0), // Ordem de exibição
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

/**
 * Tabela de Permissões de Módulos por Role
 * Define quais módulos cada role pode acessar
 */
export const roleModulePermissions = mysqlTable("role_module_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  moduleId: int("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  canView: boolean("can_view").default(true), // Pode visualizar
  canCreate: boolean("can_create").default(false), // Pode criar
  canEdit: boolean("can_edit").default(false), // Pode editar
  canDelete: boolean("can_delete").default(false), // Pode deletar
  canExport: boolean("can_export").default(false), // Pode exportar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoleModulePermission = typeof roleModulePermissions.$inferSelect;
export type InsertRoleModulePermission = typeof roleModulePermissions.$inferInsert;

/**
 * Tabela de Atribuição de Roles aos Usuários
 * Um usuário pode ter múltiplos roles
 */
export const userRoles = mysqlTable("user_roles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: int("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  assignedBy: int("assigned_by").references(() => users.id), // Quem atribuiu o role
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Data de expiração (opcional)
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

/**
 * Tabela de Auditoria de Permissões
 * Registra todas as mudanças de permissões
 */
export const permissionAuditLog = mysqlTable("permission_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // create, update, delete, assign, revoke
  entityType: varchar("entity_type", { length: 50 }).notNull(), // role, module, permission, user_role
  entityId: int("entity_id"),
  changes: text("changes"), // JSON com as mudanças
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PermissionAuditLog = typeof permissionAuditLog.$inferSelect;
export type InsertPermissionAuditLog = typeof permissionAuditLog.$inferInsert;


// ==================== GPS E RASTREAMENTO ====================

export const gpsLocations = mysqlTable("gps_locations", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  speed: decimal("speed", { precision: 5, scale: 2 }).notNull(), // km/h
  heading: int("heading"), // 0-360 graus
  altitude: decimal("altitude", { precision: 8, scale: 2 }), // metros
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }), // metros
  timestamp: timestamp("timestamp").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // onixsat, sascar, generic_rest, etc
  providerVehicleId: varchar("provider_vehicle_id", { length: 100 }), // ID do veículo no sistema do provedor
  fuelLevel: int("fuel_level"), // 0-100%
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // °C
  odometer: decimal("odometer", { precision: 10, scale: 2 }), // km
  status: mysqlEnum("status", ["moving", "stopped", "idle", "offline"]).default("offline"),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GPSLocation = typeof gpsLocations.$inferSelect;
export type InsertGPSLocation = typeof gpsLocations.$inferInsert;

export const gpsAlerts = mysqlTable("gps_alerts", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  type: varchar("type", { length: 50 }).notNull(), // speeding, harsh_braking, harsh_acceleration, low_fuel, engine_fault, geofence_violation, offline, custom
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: int("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  metadata: text("metadata"), // JSON com dados adicionais
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GPSAlert = typeof gpsAlerts.$inferSelect;
export type InsertGPSAlert = typeof gpsAlerts.$inferInsert;

export const gpsProviders = mysqlTable("gps_providers", {
  id: varchar("id", { length: 100 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // onixsat, sascar, autotrac, generic_rest, traccar
  name: varchar("name", { length: 100 }).notNull(),
  apiKey: text("api_key").notNull(),
  apiUrl: text("api_url").notNull(),
  enabled: boolean("enabled").default(true),
  syncInterval: int("sync_interval").default(30), // em segundos
  credentials: text("credentials"), // JSON com credenciais adicionais
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GPSProvider = typeof gpsProviders.$inferSelect;
export type InsertGPSProvider = typeof gpsProviders.$inferInsert;

export const gpsGeofences = mysqlTable("gps_geofences", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  name: varchar("name", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  radius: decimal("radius", { precision: 8, scale: 2 }).notNull(), // metros
  type: mysqlEnum("type", ["entry", "exit", "both"]).default("both"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GPSGeofence = typeof gpsGeofences.$inferSelect;
export type InsertGPSGeofence = typeof gpsGeofences.$inferInsert;

export const gpsRouteHistory = mysqlTable("gps_route_history", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startLatitude: decimal("start_latitude", { precision: 10, scale: 8 }),
  startLongitude: decimal("start_longitude", { precision: 11, scale: 8 }),
  endLatitude: decimal("end_latitude", { precision: 10, scale: 8 }),
  endLongitude: decimal("end_longitude", { precision: 11, scale: 8 }),
  distance: decimal("distance", { precision: 10, scale: 2 }), // km
  duration: int("duration"), // minutos
  averageSpeed: decimal("average_speed", { precision: 5, scale: 2 }), // km/h
  maxSpeed: decimal("max_speed", { precision: 5, scale: 2 }), // km/h
  fuelConsumed: decimal("fuel_consumed", { precision: 8, scale: 2 }), // litros
  provider: varchar("provider", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GPSRouteHistory = typeof gpsRouteHistory.$inferSelect;
export type InsertGPSRouteHistory = typeof gpsRouteHistory.$inferInsert;


// ==================== MÓDULO DE CONTRATOS ====================

export const contratos = mysqlTable("contratos", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações do Cliente
  nomeCliente: varchar("nome_cliente", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  razaoSocial: varchar("razao_social", { length: 255 }),
  nomeFantasia: varchar("nome_fantasia", { length: 255 }),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  
  // Informações do Contato
  nomeContato: varchar("nome_contato", { length: 255 }),
  cargoContato: varchar("cargo_contato", { length: 100 }),
  emailContato: varchar("email_contato", { length: 255 }),
  telefoneContato: varchar("telefone_contato", { length: 20 }),
  
  // Dados do Contrato
  numeroContrato: varchar("numero_contrato", { length: 50 }).unique(),
  dataAssinatura: date("data_assinatura"),
  dataVencimento: date("data_vencimento"),
  status: mysqlEnum("status", ["ativo", "inativo", "vencido", "cancelado"]).default("ativo").notNull(),
  
  // Serviços
  tiposServico: text("tipos_servico"), // JSON array de serviços (fretamento, turismo, etc)
  descricaoServicos: text("descricao_servicos"),
  
  // Valores
  valorMensal: decimal("valor_mensal", { precision: 12, scale: 2 }),
  valorKm: decimal("valor_km", { precision: 10, scale: 2 }),
  formaPagamento: mysqlEnum("forma_pagamento", ["boleto", "credito", "debito", "pix", "dinheiro"]),
  diasPagamento: varchar("dias_pagamento", { length: 50 }), // Ex: "5,15,25"
  
  // Documentos
  documentoUrl: text("documento_url"), // URL do contrato em PDF
  
  // Observações
  observacoes: text("observacoes"),
  
  // Auditoria
  criadoPor: int("criado_por").references(() => users.id),
  atualizadoPor: int("atualizado_por").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;

// Tabela de histórico de contratos
export const historicoContratos = mysqlTable("historico_contratos", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").references(() => contratos.id, { onDelete: "cascade" }).notNull(),
  
  acao: mysqlEnum("acao", ["criado", "atualizado", "renovado", "cancelado", "vencido"]).notNull(),
  descricao: text("descricao"),
  
  usuarioId: int("usuario_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HistoricoContrato = typeof historicoContratos.$inferSelect;
export type InsertHistoricoContrato = typeof historicoContratos.$inferInsert;


// ==================== MÓDULO DE ROTEIRIZAÇÃO OTIMIZADA ====================

export const optimizedRoutes = mysqlTable("optimized_routes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identificação
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Veículo e Motorista
  vehicleId: int("vehicle_id").references(() => vehicles.id),
  driverId: int("driver_id").references(() => users.id),
  
  // Dados da Rota
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }).notNull(), // km
  estimatedTime: int("estimated_time").notNull(), // minutos
  totalPassengers: int("total_passengers").default(0),
  
  // Restrições
  timeWindowStart: time("time_window_start"), // Horário de início
  timeWindowEnd: time("time_window_end"), // Horário de fim
  maxCapacity: int("max_capacity"), // Capacidade máxima
  
  // Status
  status: mysqlEnum("status", ["draft", "optimized", "active", "completed", "cancelled"]).default("draft").notNull(),
  
  // Dados da Otimização
  originalDistance: decimal("original_distance", { precision: 10, scale: 2 }), // km
  savings: decimal("savings", { precision: 10, scale: 2 }), // km economizados
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 }), // percentual
  algorithmUsed: varchar("algorithm_used", { length: 50 }), // nearest_neighbor, 2opt, genetic, etc
  iterations: int("iterations"), // número de iterações do algoritmo
  
  // Pontos da Rota (JSON)
  routePoints: text("route_points"), // JSON array com pontos ordenados
  
  // Auditoria
  createdBy: int("created_by").references(() => users.id),
  updatedBy: int("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type OptimizedRoute = typeof optimizedRoutes.$inferSelect;
export type InsertOptimizedRoute = typeof optimizedRoutes.$inferInsert;

// Tabela de histórico de versões de rotas
export const routeVersionHistory = mysqlTable("route_version_history", {
  id: int("id").autoincrement().primaryKey(),
  
  routeId: int("route_id").notNull().references(() => optimizedRoutes.id, { onDelete: "cascade" }),
  versionNumber: int("version_number").notNull(),
  
  // Dados da versão
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: int("estimated_time").notNull(),
  savings: decimal("savings", { precision: 10, scale: 2 }),
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 }),
  algorithmUsed: varchar("algorithm_used", { length: 50 }),
  iterations: int("iterations"),
  
  // Pontos da rota (JSON)
  routePoints: text("route_points"),
  
  // Mudanças
  changeDescription: text("change_description"),
  
  // Auditoria
  createdBy: int("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RouteVersionHistory = typeof routeVersionHistory.$inferSelect;
export type InsertRouteVersionHistory = typeof routeVersionHistory.$inferInsert;

// Tabela de pontos de embarque
export const embarquePoints = mysqlTable("embarque_points", {
  id: int("id").autoincrement().primaryKey(),
  
  routeId: int("route_id").notNull().references(() => optimizedRoutes.id, { onDelete: "cascade" }),
  
  // Localização
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  
  // Ordem na rota
  sequenceNumber: int("sequence_number").notNull(),
  
  // Tempo
  arrivalTime: time("arrival_time"),
  departureTime: time("departure_time"),
  waitingTime: int("waiting_time"), // minutos
  
  // Passageiros
  passengers: int("passengers").default(0),
  
  // Distância
  distanceFromPrevious: decimal("distance_from_previous", { precision: 10, scale: 2 }), // km
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "skipped"]).default("pending").notNull(),
  
  // Auditoria
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EmbarquePoint = typeof embarquePoints.$inferSelect;
export type InsertEmbarquePoint = typeof embarquePoints.$inferInsert;

// Tabela de restrições de rota
export const routeConstraints = mysqlTable("route_constraints", {
  id: int("id").autoincrement().primaryKey(),
  
  routeId: int("route_id").notNull().references(() => optimizedRoutes.id, { onDelete: "cascade" }),
  
  // Tipo de restrição
  constraintType: mysqlEnum("constraint_type", ["time_window", "capacity", "vehicle_type", "driver_license", "custom"]).notNull(),
  
  // Valores
  constraintValue: text("constraint_value"), // JSON com valores específicos
  
  // Descrição
  description: text("description"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Auditoria
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RouteConstraint = typeof routeConstraints.$inferSelect;
export type InsertRouteConstraint = typeof routeConstraints.$inferInsert;

// Tabela de análise de rotas
export const routeAnalytics = mysqlTable("route_analytics", {
  id: int("id").autoincrement().primaryKey(),
  
  routeId: int("route_id").notNull().references(() => optimizedRoutes.id, { onDelete: "cascade" }),
  
  // Métricas
  actualDistance: decimal("actual_distance", { precision: 10, scale: 2 }), // km reais
  actualTime: int("actual_time"), // minutos reais
  actualFuelConsumed: decimal("actual_fuel_consumed", { precision: 8, scale: 2 }), // litros
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }), // R$
  
  // Eficiência
  distanceVariance: decimal("distance_variance", { precision: 5, scale: 2 }), // % de diferença
  timeVariance: decimal("time_variance", { precision: 5, scale: 2 }), // % de diferença
  
  // Qualidade
  onTimeDelivery: int("on_time_delivery"), // % de pontos no horário
  passengersDelivered: int("passengers_delivered"),
  
  // Data
  executionDate: date("execution_date").notNull(),
  
  // Auditoria
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RouteAnalytic = typeof routeAnalytics.$inferSelect;
export type InsertRouteAnalytic = typeof routeAnalytics.$inferInsert;
