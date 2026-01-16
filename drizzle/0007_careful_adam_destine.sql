CREATE TABLE `medicao_configuracao_valores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_type_id` int NOT NULL,
	`city_id` int NOT NULL,
	`turno` varchar(20) NOT NULL,
	`valor_viagem` decimal(10,2) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`observacoes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicao_configuracao_valores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicao_periodos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ano` int NOT NULL,
	`mes` int NOT NULL,
	`data_inicio` date NOT NULL,
	`data_fim` date NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'aberto',
	`observacoes` text,
	`created_at` timestamp DEFAULT (now()),
	`created_by` varchar(255),
	CONSTRAINT `medicao_periodos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicao_viagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodo_id` int NOT NULL,
	`data` date NOT NULL,
	`dia_semana` varchar(10) NOT NULL,
	`turno` varchar(20) NOT NULL,
	`vehicle_type_id` int NOT NULL,
	`city_id` int NOT NULL,
	`tipo_viagem` varchar(20) NOT NULL,
	`quantidade` int NOT NULL DEFAULT 0,
	`valor_unitario` decimal(10,2),
	`valor_total` decimal(10,2),
	`observacoes` text,
	`created_at` timestamp DEFAULT (now()),
	`created_by` varchar(255),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicao_viagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `medicao_configuracao_valores` ADD CONSTRAINT `medicao_configuracao_valores_vehicle_type_id_vehicle_types_id_fk` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicao_configuracao_valores` ADD CONSTRAINT `medicao_configuracao_valores_city_id_city_configs_id_fk` FOREIGN KEY (`city_id`) REFERENCES `city_configs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicao_viagens` ADD CONSTRAINT `medicao_viagens_periodo_id_medicao_periodos_id_fk` FOREIGN KEY (`periodo_id`) REFERENCES `medicao_periodos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicao_viagens` ADD CONSTRAINT `medicao_viagens_vehicle_type_id_vehicle_types_id_fk` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicao_viagens` ADD CONSTRAINT `medicao_viagens_city_id_city_configs_id_fk` FOREIGN KEY (`city_id`) REFERENCES `city_configs`(`id`) ON DELETE no action ON UPDATE no action;