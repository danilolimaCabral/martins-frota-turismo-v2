CREATE TABLE `passengers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`rating` decimal(3,2) DEFAULT '5.00',
	`total_trips` int DEFAULT 0,
	`payment_methods` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passengers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ride_coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discount_type` enum('percentage','fixed') NOT NULL,
	`discount_value` decimal(8,2) NOT NULL,
	`max_discount` decimal(10,2),
	`min_ride_amount` decimal(10,2),
	`max_uses` int,
	`current_uses` int DEFAULT 0,
	`valid_from` timestamp,
	`valid_until` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ride_coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `ride_coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ride_location_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ride_id` int NOT NULL,
	`driver_id` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`accuracy` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ride_location_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ride_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ride_id` int NOT NULL,
	`passenger_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payment_method` enum('credit_card','debit_card','cash','wallet') DEFAULT 'credit_card',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`stripe_payment_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ride_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ride_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ride_id` int NOT NULL,
	`from_user_id` int NOT NULL,
	`to_user_id` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ride_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passenger_id` int NOT NULL,
	`driver_id` int,
	`pickup_location` text NOT NULL,
	`dropoff_location` text NOT NULL,
	`status` enum('requested','accepted','in_progress','completed','cancelled') DEFAULT 'requested',
	`estimated_distance` decimal(8,2),
	`estimated_duration` int,
	`estimated_price` decimal(10,2),
	`final_distance` decimal(8,2),
	`final_duration` int,
	`final_price` decimal(10,2),
	`requested_at` timestamp DEFAULT (now()),
	`accepted_at` timestamp,
	`started_at` timestamp,
	`completed_at` timestamp,
	`passenger_notes` text,
	`driver_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uber_drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`license_number` varchar(50) NOT NULL,
	`license_expiry` date,
	`vehicle_id` int,
	`rating` decimal(3,2) DEFAULT '5.00',
	`total_trips` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`current_location` text,
	`is_online` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uber_drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uber_drivers_license_number_unique` UNIQUE(`license_number`)
);
--> statement-breakpoint
ALTER TABLE `passengers` ADD CONSTRAINT `passengers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_location_history` ADD CONSTRAINT `ride_location_history_ride_id_rides_id_fk` FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_location_history` ADD CONSTRAINT `ride_location_history_driver_id_uber_drivers_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `uber_drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_payments` ADD CONSTRAINT `ride_payments_ride_id_rides_id_fk` FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_payments` ADD CONSTRAINT `ride_payments_passenger_id_passengers_id_fk` FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_ratings` ADD CONSTRAINT `ride_ratings_ride_id_rides_id_fk` FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_ratings` ADD CONSTRAINT `ride_ratings_from_user_id_users_id_fk` FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_ratings` ADD CONSTRAINT `ride_ratings_to_user_id_users_id_fk` FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rides` ADD CONSTRAINT `rides_passenger_id_passengers_id_fk` FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rides` ADD CONSTRAINT `rides_driver_id_uber_drivers_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `uber_drivers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uber_drivers` ADD CONSTRAINT `uber_drivers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uber_drivers` ADD CONSTRAINT `uber_drivers_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;