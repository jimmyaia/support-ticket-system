CREATE TABLE `ticket_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`actorId` int,
	`actorName` varchar(255),
	`event` enum('ticket.created','status.changed','assignee.changed','note.added','attachment.added') NOT NULL,
	`meta` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_activity_id` PRIMARY KEY(`id`)
);
