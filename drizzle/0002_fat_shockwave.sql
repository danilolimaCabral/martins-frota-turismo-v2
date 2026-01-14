CREATE TABLE `embarque_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`sequence_number` int NOT NULL,
	`arrival_time` time,
	`departure_time` time,
	`waiting_time` int,
	`passengers` int DEFAULT 0,
	`distance_from_previous` decimal(10,2),
	`status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embarque_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `optimized_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`vehicle_id` int,
	`driver_id` int,
	`total_distance` decimal(10,2) NOT NULL,
	`estimated_time` int NOT NULL,
	`total_passengers` int DEFAULT 0,
	`time_window_start` time,
	`time_window_end` time,
	`max_capacity` int,
	`status` enum('draft','optimized','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`original_distance` decimal(10,2),
	`savings` decimal(10,2),
	`savings_percentage` decimal(5,2),
	`algorithm_used` varchar(50),
	`iterations` int,
	`route_points` text,
	`created_by` int,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `optimized_routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_id` int NOT NULL,
	`actual_distance` decimal(10,2),
	`actual_time` int,
	`actual_fuel_consumed` decimal(8,2),
	`actual_cost` decimal(12,2),
	`distance_variance` decimal(5,2),
	`time_variance` decimal(5,2),
	`on_time_delivery` int,
	`passengers_delivered` int,
	`execution_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_constraints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_id` int NOT NULL,
	`constraint_type` enum('time_window','capacity','vehicle_type','driver_license','custom') NOT NULL,
	`constraint_value` text,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `route_constraints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_version_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_id` int NOT NULL,
	`version_number` int NOT NULL,
	`total_distance` decimal(10,2) NOT NULL,
	`estimated_time` int NOT NULL,
	`savings` decimal(10,2),
	`savings_percentage` decimal(5,2),
	`algorithm_used` varchar(50),
	`iterations` int,
	`route_points` text,
	`change_description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_version_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `embarque_points` ADD CONSTRAINT `embarque_points_route_id_optimized_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `optimized_routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `optimized_routes` ADD CONSTRAINT `optimized_routes_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `optimized_routes` ADD CONSTRAINT `optimized_routes_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `optimized_routes` ADD CONSTRAINT `optimized_routes_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `optimized_routes` ADD CONSTRAINT `optimized_routes_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_analytics` ADD CONSTRAINT `route_analytics_route_id_optimized_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `optimized_routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_constraints` ADD CONSTRAINT `route_constraints_route_id_optimized_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `optimized_routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_version_history` ADD CONSTRAINT `route_version_history_route_id_optimized_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `optimized_routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_version_history` ADD CONSTRAINT `route_version_history_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;