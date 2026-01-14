CREATE TABLE `route_share_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`share_id` int NOT NULL,
	`event_type` enum('shared','viewed','clicked','opened_waze','opened_maps','driver_accepted','driver_rejected') NOT NULL,
	`user_agent` text,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_share_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_id` int NOT NULL,
	`share_token` varchar(255) NOT NULL,
	`platform` enum('whatsapp','sms','email','qrcode','direct_link') NOT NULL,
	`qr_code_url` text,
	`qr_code_data` text,
	`shared_with_driver_id` int,
	`shared_with_email` varchar(320),
	`shared_with_phone` varchar(20),
	`view_count` int DEFAULT 0,
	`click_count` int DEFAULT 0,
	`driver_response_time` int,
	`driver_accepted` boolean DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`shared_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `route_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `route_shares_share_token_unique` UNIQUE(`share_token`)
);
--> statement-breakpoint
ALTER TABLE `route_share_events` ADD CONSTRAINT `route_share_events_share_id_route_shares_id_fk` FOREIGN KEY (`share_id`) REFERENCES `route_shares`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_shares` ADD CONSTRAINT `route_shares_route_id_optimized_routes_id_fk` FOREIGN KEY (`route_id`) REFERENCES `optimized_routes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_shares` ADD CONSTRAINT `route_shares_shared_with_driver_id_users_id_fk` FOREIGN KEY (`shared_with_driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `route_shares` ADD CONSTRAINT `route_shares_shared_by_users_id_fk` FOREIGN KEY (`shared_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;