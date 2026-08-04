ALTER TABLE `tenants` ADD `clickupApiKey` varchar(500);--> statement-breakpoint
ALTER TABLE `tenants` ADD `clickupListId` varchar(100);--> statement-breakpoint
ALTER TABLE `tickets` ADD `clickupTaskId` varchar(100);