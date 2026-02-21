ALTER TABLE `businesses` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `businesses` ADD `hub` varchar(100);--> statement-breakpoint
ALTER TABLE `referralOffers` ADD `offerType` enum('b2b','consumer') DEFAULT 'b2b' NOT NULL;