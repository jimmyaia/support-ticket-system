CREATE TABLE `tenant_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(63) NOT NULL,
	`logoUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ghlWebhookUrl` text,
	`ghlApiKey` varchar(500),
	`ghlWebhookNewTicket` boolean NOT NULL DEFAULT true,
	`ghlWebhookStatusChange` boolean NOT NULL DEFAULT true,
	`ghlWebhookAssignment` boolean NOT NULL DEFAULT true,
	`internalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`ticketId` int,
	`event` varchar(64) NOT NULL,
	`webhookUrl` text NOT NULL,
	`payload` text NOT NULL,
	`statusCode` int,
	`success` boolean NOT NULL DEFAULT false,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tickets` MODIFY COLUMN `product` varchar(255) NOT NULL DEFAULT 'General';--> statement-breakpoint
ALTER TABLE `ticket_attachments` ADD `tenantId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `ticket_notes` ADD `tenantId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `tenantId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` int;