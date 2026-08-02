ALTER TABLE `tenants` ADD `ghlLocationId` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlPipelineId` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlStageNew` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlStageInProgress` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlStageStuck` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlStageCompleted` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlStageClosed` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlSendEmail` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `ghlSendSms` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `ghlContactId` varchar(100);--> statement-breakpoint
ALTER TABLE `tickets` ADD `ghlOpportunityId` varchar(100);