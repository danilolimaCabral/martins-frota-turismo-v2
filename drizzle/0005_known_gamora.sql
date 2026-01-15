ALTER TABLE `route_shares` ADD `resend_attempts` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `route_shares` ADD `last_resend_at` timestamp;--> statement-breakpoint
ALTER TABLE `route_shares` ADD `max_resend_attempts` int DEFAULT 3;