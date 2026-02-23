CREATE TABLE `admin_test_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminUserId` int NOT NULL,
	`profileName` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`sportIds` text,
	`experienceLevels` text,
	`city` varchar(100),
	`state` varchar(100),
	`country` varchar(100),
	`region` varchar(100),
	`hub` varchar(100),
	`interests` text,
	`goals` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_test_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `athlete_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(255),
	`sportIds` text,
	`experienceLevels` text,
	`city` varchar(100),
	`state` varchar(100),
	`country` varchar(100),
	`region` varchar(100),
	`hub` varchar(100),
	`interests` text,
	`goals` text,
	`referralSource` varchar(255),
	`newsletterOptIn` boolean NOT NULL DEFAULT false,
	`notificationPreference` varchar(20) NOT NULL DEFAULT 'both',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `athlete_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `athlete_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `category_approvals` (
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
	CONSTRAINT `category_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnership_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderUserId` int NOT NULL,
	`senderBusinessId` int,
	`recipientBusinessId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`status` enum('sent','delivered','failed') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnership_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`fileName` varchar(500) NOT NULL,
	`fileUrl` varchar(2000) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
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
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_profile_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testProfileId` int NOT NULL,
	`referralOfferId` int NOT NULL,
	`businessId` int NOT NULL,
	`claimCode` varchar(20),
	`status` enum('claimed','redeemed','expired','disputed') NOT NULL DEFAULT 'claimed',
	`isHonored` boolean NOT NULL DEFAULT false,
	`honoredAt` timestamp,
	`honoredNotes` text,
	`amountSaved` varchar(20),
	`isDisputed` boolean NOT NULL DEFAULT false,
	`disputeReason` text,
	`disputedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `test_profile_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_profile_saved_businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testProfileId` int NOT NULL,
	`businessId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_profile_saved_businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text,
	`businessId` int,
	`offerId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `categoryApprovals`;--> statement-breakpoint
DROP TABLE `partnershipEmails`;--> statement-breakpoint
DROP TABLE `supportTickets`;--> statement-breakpoint
ALTER TABLE `referrals` ADD `senderConfirmedIncentiveAmount` varchar(20);--> statement-breakpoint
ALTER TABLE `referrals` ADD `receiverConfirmedIncentiveAmount` varchar(20);--> statement-breakpoint
ALTER TABLE `referrals` ADD `senderConfirmedRevenueAmount` varchar(20);--> statement-breakpoint
ALTER TABLE `referrals` ADD `receiverConfirmedRevenueAmount` varchar(20);--> statement-breakpoint
ALTER TABLE `referrals` ADD `isIncentiveVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD `isRevenueVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `contactName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `notificationPreference` varchar(20) DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `hasSeenWelcome` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `welcomeProgress` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isDeleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `deletedBy` varchar(50);