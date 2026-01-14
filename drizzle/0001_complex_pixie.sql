CREATE TABLE `alertas_documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`tipo_documento` enum('cnh','exame_medico','certificado_curso','contrato_trabalho','seguro_vida','outro') NOT NULL,
	`data_vencimento` date NOT NULL,
	`data_alerta` date NOT NULL,
	`status` enum('pendente','alertado','renovado','vencido') NOT NULL DEFAULT 'pendente',
	`descricao` text NOT NULL,
	`observacoes` text,
	`notificado_em` timestamp,
	`notificado_para` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertas_documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`username` varchar(100) NOT NULL,
	`action` enum('create','update','delete','login','logout','approve','reject') NOT NULL,
	`module` varchar(50) NOT NULL,
	`entity` varchar(100) NOT NULL,
	`entity_id` int,
	`description` text NOT NULL,
	`old_values` text,
	`new_values` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banco_horas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`mes_referencia` int NOT NULL,
	`ano_referencia` int NOT NULL,
	`saldo_anterior` decimal(6,2) DEFAULT '0',
	`horas_extras` decimal(6,2) DEFAULT '0',
	`horas_compensadas` decimal(6,2) DEFAULT '0',
	`saldo_atual` decimal(6,2) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banco_horas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`slug` varchar(300) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`coverImage` text,
	`category` enum('praias','montanhas','cidades-historicas','ecoturismo','cultura','gastronomia','aventura','eventos') NOT NULL,
	`tags` text,
	`authorId` int NOT NULL,
	`authorName` varchar(200) NOT NULL,
	`metaDescription` text,
	`metaKeywords` text,
	`status` enum('rascunho','publicado','arquivado') NOT NULL DEFAULT 'rascunho',
	`publishedAt` timestamp,
	`views` int NOT NULL DEFAULT 0,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int,
	`customerId` int NOT NULL,
	`vehicleId` int,
	`driverId` int,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`departureDate` timestamp NOT NULL,
	`returnDate` timestamp,
	`passengers` int NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`paid` boolean NOT NULL DEFAULT false,
	`paymentDate` timestamp,
	`status` enum('pendente','confirmado','em-andamento','concluido','cancelado') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorias_financeiras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`cor` varchar(7) DEFAULT '#3B82F6',
	`icone` varchar(50),
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categorias_financeiras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`customerName` text,
	`customerEmail` varchar(320),
	`customerPhone` varchar(20),
	`status` enum('ativa','encerrada','transferida') NOT NULL DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatConversations_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`veiculo_id` int NOT NULL,
	`motorista_id` int NOT NULL,
	`template_id` int NOT NULL,
	`km_atual` int NOT NULL,
	`data_realizacao` timestamp NOT NULL DEFAULT (now()),
	`observacoes` text,
	`status` enum('em_andamento','concluido','cancelado') NOT NULL DEFAULT 'em_andamento',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cnab_arquivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`folha_id` int NOT NULL,
	`nome_arquivo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`status` enum('gerado','enviado','processado','erro') NOT NULL DEFAULT 'gerado',
	`data_geracao` timestamp NOT NULL DEFAULT (now()),
	`data_atualizacao` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`data_envio` timestamp,
	`data_processamento` timestamp,
	`retorno` text,
	`observacoes` text,
	CONSTRAINT `cnab_arquivos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contas_pagar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoria_id` int,
	`descricao` text NOT NULL,
	`fornecedor` varchar(255),
	`numero_documento` varchar(100),
	`valor_original` decimal(10,2) NOT NULL,
	`valor_pago` decimal(10,2) DEFAULT '0',
	`valor_desconto` decimal(10,2) DEFAULT '0',
	`valor_juros` decimal(10,2) DEFAULT '0',
	`valor_multa` decimal(10,2) DEFAULT '0',
	`valor_total` decimal(10,2) NOT NULL,
	`data_emissao` date NOT NULL,
	`data_vencimento` date NOT NULL,
	`data_pagamento` date,
	`status` enum('pendente','paga','vencida','cancelada') NOT NULL DEFAULT 'pendente',
	`recorrente` boolean NOT NULL DEFAULT false,
	`frequencia` enum('mensal','bimestral','trimestral','semestral','anual'),
	`comprovante_url` varchar(500),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contas_pagar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contas_receber` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoria_id` int,
	`descricao` text NOT NULL,
	`cliente` varchar(255),
	`numero_documento` varchar(100),
	`valor_original` decimal(10,2) NOT NULL,
	`valor_recebido` decimal(10,2) DEFAULT '0',
	`valor_desconto` decimal(10,2) DEFAULT '0',
	`valor_juros` decimal(10,2) DEFAULT '0',
	`valor_multa` decimal(10,2) DEFAULT '0',
	`valor_total` decimal(10,2) NOT NULL,
	`data_emissao` date NOT NULL,
	`data_vencimento` date NOT NULL,
	`data_recebimento` date,
	`status` enum('pendente','recebida','vencida','cancelada') NOT NULL DEFAULT 'pendente',
	`recorrente` boolean NOT NULL DEFAULT false,
	`frequencia` enum('mensal','bimestral','trimestral','semestral','anual'),
	`comprovante_url` varchar(500),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contas_receber_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contratos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_cliente` varchar(255) NOT NULL,
	`cnpj` varchar(18) NOT NULL,
	`razao_social` varchar(255),
	`nome_fantasia` varchar(255),
	`email` varchar(255),
	`telefone` varchar(20),
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`nome_contato` varchar(255),
	`cargo_contato` varchar(100),
	`email_contato` varchar(255),
	`telefone_contato` varchar(20),
	`numero_contrato` varchar(50),
	`data_assinatura` date,
	`data_vencimento` date,
	`status` enum('ativo','inativo','vencido','cancelado') NOT NULL DEFAULT 'ativo',
	`tipos_servico` text,
	`descricao_servicos` text,
	`valor_mensal` decimal(12,2),
	`valor_km` decimal(10,2),
	`forma_pagamento` enum('boleto','credito','debito','pix','dinheiro'),
	`dias_pagamento` varchar(50),
	`documento_url` text,
	`observacoes` text,
	`criado_por` int,
	`atualizado_por` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contratos_id` PRIMARY KEY(`id`),
	CONSTRAINT `contratos_cnpj_unique` UNIQUE(`cnpj`),
	CONSTRAINT `contratos_numero_contrato_unique` UNIQUE(`numero_contrato`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('pessoa-fisica','pessoa-juridica') NOT NULL,
	`name` text NOT NULL,
	`cpfCnpj` varchar(20),
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`companyName` text,
	`tradeName` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_cpfCnpj_unique` UNIQUE(`cpfCnpj`)
);
--> statement-breakpoint
CREATE TABLE `dependentes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`data_nascimento` date NOT NULL,
	`parentesco` enum('Filho','Filha','Conjuge','Pai','Mae','Outro') NOT NULL,
	`dependente_ir` boolean NOT NULL DEFAULT true,
	`dependente_sf` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dependentes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` text NOT NULL,
	`cpf` varchar(14),
	`rg` varchar(20),
	`cnh` varchar(20) NOT NULL,
	`cnhCategory` varchar(5),
	`cnhExpiry` date,
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`status` enum('ativo','inativo','ferias') NOT NULL DEFAULT 'ativo',
	`hireDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `drivers_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo_servico` enum('viagem','especial','fretamento','transfer','excursao') NOT NULL DEFAULT 'viagem',
	`data_inicio` timestamp NOT NULL,
	`data_fim` timestamp NOT NULL,
	`cliente_id` int,
	`cliente_nome` varchar(255),
	`cliente_telefone` varchar(20),
	`cliente_email` varchar(320),
	`veiculo_id` int,
	`motorista_id` int,
	`valor_total` decimal(10,2) DEFAULT '0',
	`valor_pago` decimal(10,2) DEFAULT '0',
	`status` enum('agendado','confirmado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'agendado',
	`endereco_origem` text,
	`endereco_destino` text,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int,
	`driverId` int,
	`tripId` int,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`category` enum('combustivel','manutencao','pedagio','alimentacao','hospedagem','estacionamento','multa','outros') NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`receipt` text,
	`status` enum('pendente','aprovada','recusada') NOT NULL DEFAULT 'pendente',
	`approvedBy` int,
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extratos_bancarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`banco` varchar(100) NOT NULL,
	`agencia` varchar(20) NOT NULL,
	`conta` varchar(30) NOT NULL,
	`data` date NOT NULL,
	`descricao` text NOT NULL,
	`documento` varchar(100),
	`valor` decimal(10,2) NOT NULL,
	`tipo` enum('credito','debito') NOT NULL,
	`saldo` decimal(10,2),
	`conciliado` boolean NOT NULL DEFAULT false,
	`data_conciliacao` timestamp,
	`movimentacao_caixa_id` int,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `extratos_bancarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ferias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`periodo_aquisitivo_inicio` date NOT NULL,
	`periodo_aquisitivo_fim` date NOT NULL,
	`data_inicio` date NOT NULL,
	`data_fim` date NOT NULL,
	`dias_corridos` int NOT NULL,
	`dias_uteis` int NOT NULL,
	`abono_pecuniario` boolean NOT NULL DEFAULT false,
	`dias_abono` int DEFAULT 0,
	`adiantamento_13` boolean NOT NULL DEFAULT false,
	`status` enum('solicitado','aprovado','reprovado','em_gozo','concluido','cancelado') NOT NULL DEFAULT 'solicitado',
	`solicitado_em` timestamp NOT NULL DEFAULT (now()),
	`aprovado_por` int,
	`data_aprovacao` timestamp,
	`motivo_reprovacao` text,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ferias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folhas_pagamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mes_referencia` int NOT NULL,
	`ano_referencia` int NOT NULL,
	`status` enum('aberta','processando','fechada','paga') NOT NULL DEFAULT 'aberta',
	`data_fechamento` timestamp,
	`data_pagamento` date,
	`total_bruto` decimal(12,2) DEFAULT '0',
	`total_descontos` decimal(12,2) DEFAULT '0',
	`total_liquido` decimal(12,2) DEFAULT '0',
	`arquivo_cnab` text,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `folhas_pagamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fornecedores_pecas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`cnpj` varchar(18),
	`telefone` varchar(20),
	`email` varchar(100),
	`endereco` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fornecedores_pecas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fuelings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`driverId` int,
	`date` timestamp NOT NULL,
	`km` decimal(10,2) NOT NULL,
	`liters` decimal(10,2) NOT NULL,
	`pricePerLiter` decimal(10,2) NOT NULL,
	`totalCost` decimal(10,2) NOT NULL,
	`station` text,
	`city` text,
	`fuelType` enum('gasolina','etanol','diesel','gnv') NOT NULL,
	`receipt` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fuelings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`rg` varchar(20),
	`rg_orgao_emissor` varchar(20),
	`data_nascimento` date,
	`sexo` enum('M','F','Outro'),
	`estado_civil` enum('Solteiro','Casado','Divorciado','Viuvo','Uniao Estavel'),
	`telefone` varchar(20),
	`celular` varchar(20),
	`email` varchar(320),
	`cep` varchar(10),
	`endereco` text,
	`numero` varchar(20),
	`complemento` varchar(100),
	`bairro` varchar(100),
	`cidade` varchar(100),
	`estado` varchar(2),
	`data_admissao` date NOT NULL,
	`data_demissao` date,
	`cargo` varchar(100) NOT NULL,
	`departamento` varchar(100),
	`tipo_contrato` enum('CLT','PJ','Estagiario','Temporario') NOT NULL DEFAULT 'CLT',
	`salario_base` decimal(10,2) NOT NULL,
	`adicional_periculosidade` decimal(5,2) DEFAULT '0',
	`adicional_insalubridade` decimal(5,2) DEFAULT '0',
	`adicional_noturno` decimal(5,2) DEFAULT '0',
	`vale_transporte` decimal(10,2) DEFAULT '0',
	`vale_alimentacao` decimal(10,2) DEFAULT '0',
	`plano_saude` decimal(10,2) DEFAULT '0',
	`banco` varchar(100),
	`agencia` varchar(20),
	`conta` varchar(30),
	`tipo_conta` enum('Corrente','Poupanca','Salario'),
	`pix_chave` varchar(100),
	`ctps_numero` varchar(20),
	`ctps_serie` varchar(20),
	`ctps_uf` varchar(2),
	`pis_numero` varchar(20),
	`titulo_eleitor` varchar(20),
	`reservista` varchar(20),
	`cnh_numero` varchar(20),
	`cnh_categoria` varchar(5),
	`cnh_validade` date,
	`status` enum('ativo','ferias','afastado','demitido') NOT NULL DEFAULT 'ativo',
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `funcionarios_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `gps_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`message` text NOT NULL,
	`timestamp` timestamp NOT NULL,
	`acknowledged` boolean DEFAULT false,
	`acknowledged_by` int,
	`acknowledged_at` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_geofences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`radius` decimal(8,2) NOT NULL,
	`type` enum('entry','exit','both') DEFAULT 'both',
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gps_geofences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_id` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`speed` decimal(5,2) NOT NULL,
	`heading` int,
	`altitude` decimal(8,2),
	`accuracy` decimal(8,2),
	`timestamp` timestamp NOT NULL,
	`provider` varchar(50) NOT NULL,
	`provider_vehicle_id` varchar(100),
	`fuel_level` int,
	`temperature` decimal(5,2),
	`odometer` decimal(10,2),
	`status` enum('moving','stopped','idle','offline') DEFAULT 'offline',
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_providers` (
	`id` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`api_key` text NOT NULL,
	`api_url` text NOT NULL,
	`enabled` boolean DEFAULT true,
	`sync_interval` int DEFAULT 30,
	`credentials` text,
	`last_sync` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gps_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_route_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_id` int NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp,
	`start_latitude` decimal(10,8),
	`start_longitude` decimal(11,8),
	`end_latitude` decimal(10,8),
	`end_longitude` decimal(11,8),
	`distance` decimal(10,2),
	`duration` int,
	`average_speed` decimal(5,2),
	`max_speed` decimal(5,2),
	`fuel_consumed` decimal(8,2),
	`provider` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_route_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_contratos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contrato_id` int NOT NULL,
	`acao` enum('criado','atualizado','renovado','cancelado','vencido') NOT NULL,
	`descricao` text,
	`usuario_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_contratos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `horas_extras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`data` date NOT NULL,
	`horas_trabalhadas` decimal(5,2) NOT NULL,
	`tipo` enum('50%','100%','Noturno') NOT NULL,
	`valor_hora` decimal(10,2),
	`valor_total` decimal(10,2),
	`aprovado` boolean NOT NULL DEFAULT false,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `horas_extras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_folha` (
	`id` int AUTO_INCREMENT NOT NULL,
	`folha_id` int NOT NULL,
	`funcionario_id` int NOT NULL,
	`salario_base` decimal(10,2) DEFAULT '0',
	`horas_extras_50` decimal(10,2) DEFAULT '0',
	`horas_extras_100` decimal(10,2) DEFAULT '0',
	`adicional_noturno` decimal(10,2) DEFAULT '0',
	`adicional_periculosidade` decimal(10,2) DEFAULT '0',
	`adicional_insalubridade` decimal(10,2) DEFAULT '0',
	`comissoes` decimal(10,2) DEFAULT '0',
	`bonus` decimal(10,2) DEFAULT '0',
	`outros_proventos` decimal(10,2) DEFAULT '0',
	`inss` decimal(10,2) DEFAULT '0',
	`irrf` decimal(10,2) DEFAULT '0',
	`fgts` decimal(10,2) DEFAULT '0',
	`vale_transporte` decimal(10,2) DEFAULT '0',
	`vale_alimentacao` decimal(10,2) DEFAULT '0',
	`plano_saude` decimal(10,2) DEFAULT '0',
	`adiantamento` decimal(10,2) DEFAULT '0',
	`faltas` decimal(10,2) DEFAULT '0',
	`outros_descontos` decimal(10,2) DEFAULT '0',
	`total_proventos` decimal(10,2) DEFAULT '0',
	`total_descontos` decimal(10,2) DEFAULT '0',
	`salario_liquido` decimal(10,2) DEFAULT '0',
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itens_folha_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_template_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int NOT NULL,
	`categoria` varchar(50) NOT NULL,
	`descricao` text NOT NULL,
	`ordem` int NOT NULL,
	`obrigatorio` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itens_template_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lancamentos_rh` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`folha_pagamento_id` int,
	`tipo` enum('credito','debito') NOT NULL,
	`categoria` enum('salario','hora_extra_50','hora_extra_100','adicional_noturno','adicional_periculosidade','adicional_insalubridade','comissao','bonus','gratificacao','ferias','decimo_terceiro','vale_transporte','vale_alimentacao','vale_refeicao','auxilio_creche','plano_saude','seguro_vida','outros_creditos','adiantamento_salarial','desconto_falta','desconto_atraso','inss','irrf','vale_transporte_desc','vale_alimentacao_desc','plano_saude_desc','emprestimo','pensao_alimenticia','outros_debitos') NOT NULL,
	`descricao` text NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`mes_referencia` int NOT NULL,
	`ano_referencia` int NOT NULL,
	`data_lancamento` date NOT NULL,
	`observacoes` text,
	`comprovante_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `lancamentos_rh_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `local_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`ativo` boolean NOT NULL DEFAULT true,
	`permissions` text DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `local_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_users_username_unique` UNIQUE(`username`),
	CONSTRAINT `local_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `maintenances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`type` enum('preventiva','corretiva','revisao') NOT NULL,
	`description` text NOT NULL,
	`scheduledDate` date,
	`completedDate` date,
	`cost` decimal(10,2),
	`provider` text,
	`km` decimal(10,2),
	`status` enum('agendada','em-andamento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`path` varchar(200),
	`color` varchar(20),
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `modulos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modulos_id` PRIMARY KEY(`id`),
	CONSTRAINT `modulos_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `movimentacoes_caixa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoria_id` int,
	`tipo` enum('entrada','saida') NOT NULL,
	`descricao` text NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`data` date NOT NULL,
	`forma_pagamento` enum('dinheiro','cartao_credito','cartao_debito','pix','transferencia','boleto','cheque') NOT NULL,
	`conta_pagar_id` int,
	`conta_receber_id` int,
	`comprovante_url` varchar(500),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `movimentacoes_caixa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movimentacoes_estoque` (
	`id` int AUTO_INCREMENT NOT NULL,
	`peca_id` int NOT NULL,
	`tipo` enum('entrada','saida','ajuste') NOT NULL,
	`quantidade` int NOT NULL,
	`motivo` text,
	`ordem_servico_id` int,
	`usuario_id` int,
	`data_movimentacao` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimentacoes_estoque_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordens_servico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(20) NOT NULL,
	`veiculo_id` int NOT NULL,
	`checklist_id` int,
	`tipo` enum('preventiva','corretiva','emergencial') NOT NULL,
	`prioridade` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`descricao_problema` text NOT NULL,
	`descricao_servico` text,
	`status` enum('pendente','em_andamento','aguardando_pecas','concluida','cancelada') NOT NULL DEFAULT 'pendente',
	`mecanico_responsavel` varchar(100),
	`data_abertura` timestamp NOT NULL DEFAULT (now()),
	`data_inicio` timestamp,
	`data_conclusao` timestamp,
	`km_veiculo` int,
	`valor_mao_obra` decimal(10,2) DEFAULT '0',
	`valor_pecas` decimal(10,2) DEFAULT '0',
	`valor_total` decimal(10,2) DEFAULT '0',
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ordens_servico_id` PRIMARY KEY(`id`),
	CONSTRAINT `ordens_servico_numero_unique` UNIQUE(`numero`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos_evento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evento_id` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`data_pagamento` timestamp NOT NULL,
	`forma_pagamento` enum('dinheiro','cartao_credito','cartao_debito','pix','transferencia','boleto','cheque') NOT NULL,
	`comprovante` text,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pagamentos_evento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passageiros_rota` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rota_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`endereco` text NOT NULL,
	`telefone` varchar(20),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`ponto_embarque_sugerido` text,
	`ordem_coleta` int,
	`horario_estimado` varchar(10),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passageiros_rota_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pecas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`nome` varchar(200) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`fornecedor_id` int,
	`quantidade_estoque` int NOT NULL DEFAULT 0,
	`estoque_minimo` int NOT NULL DEFAULT 0,
	`preco_unitario` decimal(10,2) DEFAULT '0',
	`localizacao` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pecas_id` PRIMARY KEY(`id`),
	CONSTRAINT `pecas_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
CREATE TABLE `pecas_ordem_servico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordem_servico_id` int NOT NULL,
	`peca_id` int NOT NULL,
	`quantidade` int NOT NULL,
	`preco_unitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pecas_ordem_servico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permission_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` int,
	`changes` text,
	`ip_address` varchar(50),
	`user_agent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permission_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissoes_usuario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`modulo_id` int NOT NULL,
	`pode_visualizar` boolean NOT NULL DEFAULT true,
	`pode_editar` boolean NOT NULL DEFAULT false,
	`pode_deletar` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissoes_usuario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planos_manutencao_preventiva` (
	`id` int AUTO_INCREMENT NOT NULL,
	`veiculo_id` int NOT NULL,
	`tipo_manutencao` varchar(100) NOT NULL,
	`descricao` text,
	`intervalo_km` int,
	`intervalo_dias` int,
	`ultima_execucao_km` int,
	`ultima_execucao_data` date,
	`proxima_execucao_km` int,
	`proxima_execucao_data` date,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planos_manutencao_preventiva_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`departureDate` date,
	`returnDate` date,
	`passengers` int,
	`vehicleType` enum('van','micro-onibus','onibus'),
	`estimatedKm` decimal(10,2),
	`pricePerKm` decimal(10,2),
	`totalPrice` decimal(10,2),
	`status` enum('pendente','enviado','aprovado','recusado','expirado') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registros_ponto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`data` date NOT NULL,
	`entrada_manha` varchar(5),
	`saida_manha` varchar(5),
	`entrada_tarde` varchar(5),
	`saida_tarde` varchar(5),
	`horas_trabalhadas` decimal(5,2) DEFAULT '0',
	`horas_extras_50` decimal(5,2) DEFAULT '0',
	`horas_extras_100` decimal(5,2) DEFAULT '0',
	`horas_noturnas` decimal(5,2) DEFAULT '0',
	`atraso` boolean NOT NULL DEFAULT false,
	`minutos_atraso` int DEFAULT 0,
	`falta` boolean NOT NULL DEFAULT false,
	`justificativa` text,
	`aprovado` boolean NOT NULL DEFAULT false,
	`aprovado_por` int,
	`data_aprovacao` timestamp,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registros_ponto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklist_id` int NOT NULL,
	`item_id` int NOT NULL,
	`resposta` enum('ok','problema','nao_aplicavel') NOT NULL,
	`observacao` text,
	`foto_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(200) NOT NULL,
	`customerEmail` varchar(320),
	`customerCompany` varchar(200),
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`tripId` int,
	`status` enum('pendente','aprovada','recusada') NOT NULL DEFAULT 'pendente',
	`moderatedBy` int,
	`moderatedAt` timestamp,
	`moderationNotes` text,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_module_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`module_id` int NOT NULL,
	`can_view` boolean DEFAULT true,
	`can_create` boolean DEFAULT false,
	`can_edit` boolean DEFAULT false,
	`can_delete` boolean DEFAULT false,
	`can_export` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `role_module_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(20),
	`icon` varchar(50),
	`is_system_role` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `rotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`empresa_cliente` varchar(255) NOT NULL,
	`data_viagem` date,
	`horario_saida` varchar(10),
	`status` enum('rascunho','processando','concluida','arquivada') NOT NULL DEFAULT 'rascunho',
	`distancia_total_km` decimal(10,2),
	`tempo_total_min` int,
	`veiculo_sugerido` varchar(50),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rotas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saldo_ferias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionario_id` int NOT NULL,
	`periodo_aquisitivo_inicio` date NOT NULL,
	`periodo_aquisitivo_fim` date NOT NULL,
	`dias_direito` int NOT NULL DEFAULT 30,
	`dias_gozados` int NOT NULL DEFAULT 0,
	`dias_abono` int NOT NULL DEFAULT 0,
	`dias_disponiveis` int NOT NULL DEFAULT 30,
	`vencido` boolean NOT NULL DEFAULT false,
	`data_vencimento` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saldo_ferias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`tipo_veiculo` enum('van','onibus','micro-onibus','carro') NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`vehicleId` int NOT NULL,
	`driverId` int NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`startKm` decimal(10,2) NOT NULL,
	`endKm` decimal(10,2),
	`totalKm` decimal(10,2),
	`status` enum('planejada','em-andamento','concluida','cancelada') NOT NULL DEFAULT 'planejada',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	`assigned_by` int,
	`assigned_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_old` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` text NOT NULL,
	`loginMethod` text NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLogin` timestamp,
	CONSTRAINT `users_old_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_old_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fleetNumber` varchar(50) NOT NULL,
	`plate` varchar(10) NOT NULL,
	`type` enum('van','micro-onibus','onibus') NOT NULL,
	`brand` varchar(100),
	`model` varchar(100),
	`year` int,
	`capacity` int,
	`capacityKg` int,
	`capacityM3` decimal(8,2),
	`currentLoad` int DEFAULT 0,
	`currentPassengers` int DEFAULT 0,
	`color` varchar(50),
	`chassis` varchar(100),
	`renavam` varchar(20),
	`anttNumber` varchar(50),
	`anttExpiry` date,
	`derNumber` varchar(50),
	`derExpiry` date,
	`cadasturNumber` varchar(50),
	`cadasturExpiry` date,
	`rcoExpiry` date,
	`rcoHasThirdParty` boolean DEFAULT false,
	`imetroExpiry` date,
	`tachographExpiry` date,
	`ipvaExpiry` date,
	`ipvaIsInstallment` boolean DEFAULT false,
	`ipvaInstallments` int,
	`status` enum('ativo','manutencao','inativo') NOT NULL DEFAULT 'ativo',
	`currentKm` decimal(10,2) DEFAULT '0',
	`gpsDevice` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_plate_unique` UNIQUE(`plate`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','funcionario','motorista') NOT NULL DEFAULT 'funcionario';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastLogin` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `alertas_documentos` ADD CONSTRAINT `alertas_documentos_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_local_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `local_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `banco_horas` ADD CONSTRAINT `banco_horas_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blogPosts` ADD CONSTRAINT `blogPosts_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_quoteId_quotes_id_fk` FOREIGN KEY (`quoteId`) REFERENCES `quotes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vehicleId_vehicles_id_fk` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_driverId_drivers_id_fk` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_conversationId_chatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `chatConversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_veiculo_id_vehicles_id_fk` FOREIGN KEY (`veiculo_id`) REFERENCES `vehicles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_motorista_id_drivers_id_fk` FOREIGN KEY (`motorista_id`) REFERENCES `drivers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_template_id_templates_checklist_id_fk` FOREIGN KEY (`template_id`) REFERENCES `templates_checklist`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cnab_arquivos` ADD CONSTRAINT `cnab_arquivos_folha_id_folhas_pagamento_id_fk` FOREIGN KEY (`folha_id`) REFERENCES `folhas_pagamento`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contas_pagar` ADD CONSTRAINT `contas_pagar_categoria_id_categorias_financeiras_id_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_financeiras`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contas_receber` ADD CONSTRAINT `contas_receber_categoria_id_categorias_financeiras_id_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_financeiras`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contratos` ADD CONSTRAINT `contratos_criado_por_users_id_fk` FOREIGN KEY (`criado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contratos` ADD CONSTRAINT `contratos_atualizado_por_users_id_fk` FOREIGN KEY (`atualizado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dependentes` ADD CONSTRAINT `dependentes_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_veiculo_id_vehicles_id_fk` FOREIGN KEY (`veiculo_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_motorista_id_drivers_id_fk` FOREIGN KEY (`motorista_id`) REFERENCES `drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_vehicleId_vehicles_id_fk` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_driverId_drivers_id_fk` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_tripId_trips_id_fk` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extratos_bancarios` ADD CONSTRAINT `extratos_bancarios_movimentacao_caixa_id_movimentacoes_caixa_id_fk` FOREIGN KEY (`movimentacao_caixa_id`) REFERENCES `movimentacoes_caixa`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ferias` ADD CONSTRAINT `ferias_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ferias` ADD CONSTRAINT `ferias_aprovado_por_users_id_fk` FOREIGN KEY (`aprovado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fuelings` ADD CONSTRAINT `fuelings_vehicleId_vehicles_id_fk` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fuelings` ADD CONSTRAINT `fuelings_driverId_drivers_id_fk` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionarios` ADD CONSTRAINT `funcionarios_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_alerts` ADD CONSTRAINT `gps_alerts_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_alerts` ADD CONSTRAINT `gps_alerts_acknowledged_by_users_id_fk` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_geofences` ADD CONSTRAINT `gps_geofences_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_locations` ADD CONSTRAINT `gps_locations_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_route_history` ADD CONSTRAINT `gps_route_history_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_contratos` ADD CONSTRAINT `historico_contratos_contrato_id_contratos_id_fk` FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_contratos` ADD CONSTRAINT `historico_contratos_usuario_id_users_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `horas_extras` ADD CONSTRAINT `horas_extras_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_folha` ADD CONSTRAINT `itens_folha_folha_id_folhas_pagamento_id_fk` FOREIGN KEY (`folha_id`) REFERENCES `folhas_pagamento`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_folha` ADD CONSTRAINT `itens_folha_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_template_checklist` ADD CONSTRAINT `itens_template_checklist_template_id_templates_checklist_id_fk` FOREIGN KEY (`template_id`) REFERENCES `templates_checklist`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lancamentos_rh` ADD CONSTRAINT `lancamentos_rh_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lancamentos_rh` ADD CONSTRAINT `lancamentos_rh_folha_pagamento_id_folhas_pagamento_id_fk` FOREIGN KEY (`folha_pagamento_id`) REFERENCES `folhas_pagamento`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lancamentos_rh` ADD CONSTRAINT `lancamentos_rh_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenances` ADD CONSTRAINT `maintenances_vehicleId_vehicles_id_fk` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_caixa` ADD CONSTRAINT `movimentacoes_caixa_categoria_id_categorias_financeiras_id_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_financeiras`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_caixa` ADD CONSTRAINT `movimentacoes_caixa_conta_pagar_id_contas_pagar_id_fk` FOREIGN KEY (`conta_pagar_id`) REFERENCES `contas_pagar`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_caixa` ADD CONSTRAINT `movimentacoes_caixa_conta_receber_id_contas_receber_id_fk` FOREIGN KEY (`conta_receber_id`) REFERENCES `contas_receber`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_caixa` ADD CONSTRAINT `movimentacoes_caixa_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_estoque` ADD CONSTRAINT `movimentacoes_estoque_peca_id_pecas_id_fk` FOREIGN KEY (`peca_id`) REFERENCES `pecas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movimentacoes_estoque` ADD CONSTRAINT `movimentacoes_estoque_usuario_id_users_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_veiculo_id_vehicles_id_fk` FOREIGN KEY (`veiculo_id`) REFERENCES `vehicles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_checklist_id_checklists_id_fk` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pagamentos_evento` ADD CONSTRAINT `pagamentos_evento_evento_id_eventos_id_fk` FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passageiros_rota` ADD CONSTRAINT `passageiros_rota_rota_id_rotas_id_fk` FOREIGN KEY (`rota_id`) REFERENCES `rotas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_fornecedor_id_fornecedores_pecas_id_fk` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores_pecas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pecas_ordem_servico` ADD CONSTRAINT `pecas_ordem_servico_ordem_servico_id_ordens_servico_id_fk` FOREIGN KEY (`ordem_servico_id`) REFERENCES `ordens_servico`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pecas_ordem_servico` ADD CONSTRAINT `pecas_ordem_servico_peca_id_pecas_id_fk` FOREIGN KEY (`peca_id`) REFERENCES `pecas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permission_audit_log` ADD CONSTRAINT `permission_audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissoes_usuario` ADD CONSTRAINT `permissoes_usuario_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissoes_usuario` ADD CONSTRAINT `permissoes_usuario_modulo_id_modulos_id_fk` FOREIGN KEY (`modulo_id`) REFERENCES `modulos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `planos_manutencao_preventiva` ADD CONSTRAINT `planos_manutencao_preventiva_veiculo_id_vehicles_id_fk` FOREIGN KEY (`veiculo_id`) REFERENCES `vehicles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registros_ponto` ADD CONSTRAINT `registros_ponto_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registros_ponto` ADD CONSTRAINT `registros_ponto_aprovado_por_users_id_fk` FOREIGN KEY (`aprovado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_checklist` ADD CONSTRAINT `respostas_checklist_checklist_id_checklists_id_fk` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_checklist` ADD CONSTRAINT `respostas_checklist_item_id_itens_template_checklist_id_fk` FOREIGN KEY (`item_id`) REFERENCES `itens_template_checklist`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_tripId_trips_id_fk` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_moderatedBy_users_id_fk` FOREIGN KEY (`moderatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_module_permissions` ADD CONSTRAINT `role_module_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_module_permissions` ADD CONSTRAINT `role_module_permissions_module_id_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saldo_ferias` ADD CONSTRAINT `saldo_ferias_funcionario_id_funcionarios_id_fk` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_vehicleId_vehicles_id_fk` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_driverId_drivers_id_fk` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;