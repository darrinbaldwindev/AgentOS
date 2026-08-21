CREATE TABLE `attribution_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(96) NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('model_switch','referral_click') NOT NULL,
	`provider` varchar(128) NOT NULL,
	`consent` enum('granted','declined') NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attribution_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `attribution_records_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `recovery_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(96) NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('rate_limit','quota_exhausted','provider_offline','capability_mismatch','permission_denied','tool_timeout','partial_stream','artifact_conflict','referral_failure') NOT NULL,
	`provider` varchar(128) NOT NULL,
	`action` text NOT NULL,
	`status` enum('resolved','awaiting_user','blocked') NOT NULL,
	`containsPrompt` boolean NOT NULL DEFAULT false,
	`containsSecret` boolean NOT NULL DEFAULT false,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recovery_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `recovery_records_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE INDEX `attribution_user_occurred_idx` ON `attribution_records` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `recovery_user_occurred_idx` ON `recovery_records` (`userId`,`occurredAt`);