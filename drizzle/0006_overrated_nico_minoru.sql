CREATE TABLE `city_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`state` varchar(2) NOT NULL DEFAULT 'PR',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `city_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `import_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`total_records` int NOT NULL,
	`successful_records` int NOT NULL,
	`failed_records` int NOT NULL,
	`errors` json,
	`imported_at` timestamp DEFAULT (now()),
	`imported_by` varchar(255),
	CONSTRAINT `import_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicle_type_id` int NOT NULL,
	`city_id` int NOT NULL,
	`price_per_trip` decimal(10,2) NOT NULL,
	`price_per_km` decimal(10,2),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `route_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`capacity` int NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `vehicle_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `route_prices` ADD CONSTRAINT `route_prices_vehicle_type_id_vehicle_types_id_fk` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_prices` ADD CONSTRAINT `route_prices_city_id_city_configs_id_fk` FOREIGN KEY (`city_id`) REFERENCES `city_configs`(`id`) ON DELETE no action ON UPDATE no action;