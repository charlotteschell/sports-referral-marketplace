CREATE TABLE `businessSportCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`sportCategoryId` int NOT NULL,
	CONSTRAINT `businessSportCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businessTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businessTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `businessTypes_name_unique` UNIQUE(`name`),
	CONSTRAINT `businessTypes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`shortDescription` varchar(500),
	`sportCategoryId` int NOT NULL,
	`businessTypeId` int NOT NULL,
	`city` varchar(100),
	`state` varchar(100),
	`country` varchar(100),
	`address` text,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`phone` varchar(30),
	`email` varchar(320),
	`website` varchar(500),
	`instagram` varchar(255),
	`facebook` varchar(255),
	`isClaimed` boolean NOT NULL DEFAULT false,
	`claimedByUserId` int,
	`claimedAt` timestamp,
	`logoUrl` varchar(500),
	`coverImageUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `referralOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`incentiveType` enum('percentage','fixed','service','other') NOT NULL,
	`incentiveValue` varchar(100),
	`incentiveDescription` text,
	`termsAndConditions` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referringBusinessId` int NOT NULL,
	`referringUserId` int NOT NULL,
	`receivingBusinessId` int NOT NULL,
	`referralOfferId` int,
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`customerPhone` varchar(30),
	`notes` text,
	`status` enum('pending','contacted','converted','declined','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sportCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sportCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `sportCategories_name_unique` UNIQUE(`name`),
	CONSTRAINT `sportCategories_slug_unique` UNIQUE(`slug`)
);
