CREATE TABLE `businessBusinessTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`businessTypeId` int NOT NULL,
	CONSTRAINT `businessBusinessTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categoryApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`categoryType` enum('sport','business_type','region','hub') NOT NULL,
	`proposedName` varchar(255) NOT NULL,
	`proposedSlug` varchar(255),
	`parentRegion` varchar(100),
	`description` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categoryApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consumerClaims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralOfferId` int NOT NULL,
	`businessId` int NOT NULL,
	`userId` int NOT NULL,
	`claimCode` varchar(20),
	`status` enum('claimed','redeemed','expired','disputed') NOT NULL DEFAULT 'claimed',
	`isHonored` boolean NOT NULL DEFAULT false,
	`honoredAt` timestamp,
	`honoredNotes` text,
	`amountSaved` varchar(20),
	`currency` varchar(10) DEFAULT 'USD',
	`isDisputed` boolean NOT NULL DEFAULT false,
	`disputeReason` text,
	`disputedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consumerClaims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(10) NOT NULL,
	`businessId` int,
	`verificationType` enum('claim','submission') NOT NULL DEFAULT 'claim',
	`isVerified` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnershipEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderUserId` int NOT NULL,
	`senderBusinessId` int,
	`recipientBusinessId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`status` enum('sent','delivered','failed') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnershipEmails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statKey` varchar(100) NOT NULL,
	`statValue` int NOT NULL DEFAULT 0,
	`label` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `platformStats_statKey_unique` UNIQUE(`statKey`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`userEmail` varchar(320) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`ticketType` enum('bug','feature_request','general') NOT NULL DEFAULT 'general',
	`screenshotUrls` text,
	`status` enum('new','in_backlog','in_progress','in_testing','done','launched') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `businesses` ADD `googleMapsUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `businesses` ADD `brandsCarried` text;--> statement-breakpoint
ALTER TABLE `referrals` ADD `receiverHonored` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD `receiverHonoredAt` timestamp;--> statement-breakpoint
ALTER TABLE `referrals` ADD `receiverHonoredNotes` text;--> statement-breakpoint
ALTER TABLE `referrals` ADD `senderCashedOut` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD `senderCashedOutAt` timestamp;--> statement-breakpoint
ALTER TABLE `referrals` ADD `senderCashedOutNotes` text;--> statement-breakpoint
ALTER TABLE `referrals` ADD `incentiveAmount` varchar(20);--> statement-breakpoint
ALTER TABLE `referrals` ADD `incentiveCurrency` varchar(10) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE `referrals` ADD `isDisputed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD `disputeReason` text;--> statement-breakpoint
ALTER TABLE `referrals` ADD `disputedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referrals` ADD `disputedByUserId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('consumer','business_owner') DEFAULT 'consumer' NOT NULL;