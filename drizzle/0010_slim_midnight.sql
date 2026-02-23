ALTER TABLE `businessSubmissions` ADD `resubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `businessSubmissions` ADD `resubmissionCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `businessSubmissions` ADD `previousReviewNotes` text;