ALTER TABLE `businesses` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `approvalNotes` text;--> statement-breakpoint
ALTER TABLE `businesses` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `businesses` ADD `isHidden` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `isAdminHidden` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referralOffers` ADD `isHidden` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referralOffers` ADD `isAdminHidden` boolean DEFAULT false NOT NULL;