CREATE TABLE `private_conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`providerId` varchar(128) NOT NULL,
	`modelId` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_conversation_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `private_conversation_messages_messageId_unique` UNIQUE(`messageId`)
);
--> statement-breakpoint
CREATE TABLE `private_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`providerId` varchar(128) NOT NULL,
	`modelId` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `private_conversations_conversationId_unique` UNIQUE(`conversationId`)
);
--> statement-breakpoint
CREATE INDEX `private_message_conversation_created_idx` ON `private_conversation_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_message_user_conversation_idx` ON `private_conversation_messages` (`userId`,`conversationId`);--> statement-breakpoint
CREATE INDEX `private_conversation_user_expiry_idx` ON `private_conversations` (`userId`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `private_conversation_user_updated_idx` ON `private_conversations` (`userId`,`updatedAt`);