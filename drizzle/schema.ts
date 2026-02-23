import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * accountType: consumer or business_owner
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountType: mysqlEnum("accountType", ["consumer", "business_owner"]).default("consumer").notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  notificationPreference: varchar("notificationPreference", { length: 20 }).default("both").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: varchar("deletedBy", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sport categories: cycling, running, snowsports, sport-vacations
 */
export const sportCategories = mysqlTable("sportCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SportCategory = typeof sportCategories.$inferSelect;

/**
 * Business types: coach, bike_shop, physio, nutritionist, vacation_provider, etc.
 */
export const businessTypes = mysqlTable("businessTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BusinessType = typeof businessTypes.$inferSelect;

/**
 * Businesses directory
 */
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  
  // Category references
  sportCategoryId: int("sportCategoryId").notNull(),
  businessTypeId: int("businessTypeId").notNull(),
  
  // Location
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  address: text("address"),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  // Region / Hub for geographic filtering
  region: varchar("region", { length: 100 }),
  hub: varchar("hub", { length: 100 }),
  
  // Contact (only shown when claimed)
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Google ratings
  googleRating: varchar("googleRating", { length: 10 }),
  googleReviewCount: int("googleReviewCount"),
  googleMapsUrl: varchar("googleMapsUrl", { length: 500 }),
  
  // Social
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  
  // Claiming
  isClaimed: boolean("isClaimed").default(false).notNull(),
  claimedByUserId: int("claimedByUserId"),
  claimedAt: timestamp("claimedAt"),
  
  // Media
  logoUrl: varchar("logoUrl", { length: 500 }),
  coverImageUrl: varchar("coverImageUrl", { length: 500 }),
  
  // Brands carried (for retailers: bike retailers, supplement retailers)
  brandsCarried: text("brandsCarried"),
  
  // Approval workflow
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("approved").notNull(),
  approvalNotes: text("approvalNotes"),
  approvedAt: timestamp("approvedAt"),
  
  // Visibility controls
  isHidden: boolean("isHidden").default(false).notNull(),
  isAdminHidden: boolean("isAdminHidden").default(false).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

/**
 * Additional sport categories for a business (many-to-many)
 */
export const businessSportCategories = mysqlTable("businessSportCategories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  sportCategoryId: int("sportCategoryId").notNull(),
});

/**
 * Additional business types for a business (many-to-many)
 */
export const businessBusinessTypes = mysqlTable("businessBusinessTypes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  businessTypeId: int("businessTypeId").notNull(),
});

/**
 * Referral offers that businesses post
 * offerType: 'b2b' for business-to-business, 'consumer' for individual consumers
 */
export const referralOffers = mysqlTable("referralOffers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  offerType: mysqlEnum("offerType", ["b2b", "consumer"]).default("b2b").notNull(),
  incentiveType: mysqlEnum("incentiveType", ["percentage", "fixed", "service", "other"]).notNull(),
  incentiveValue: varchar("incentiveValue", { length: 100 }),
  incentiveDescription: text("incentiveDescription"),
  termsAndConditions: text("termsAndConditions"),
  isSample: boolean("isSample").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  isAdminHidden: boolean("isAdminHidden").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralOffer = typeof referralOffers.$inferSelect;
export type InsertReferralOffer = typeof referralOffers.$inferInsert;

/**
 * Referral tracking: when business A sends a customer to business B
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referringBusinessId: int("referringBusinessId").notNull(),
  referringUserId: int("referringUserId").notNull(),
  receivingBusinessId: int("receivingBusinessId").notNull(),
  referralOfferId: int("referralOfferId"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 30 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "contacted", "converted", "declined", "expired"]).default("pending").notNull(),
  receiverHonored: boolean("receiverHonored").default(false).notNull(),
  receiverHonoredAt: timestamp("receiverHonoredAt"),
  receiverHonoredNotes: text("receiverHonoredNotes"),
  senderCashedOut: boolean("senderCashedOut").default(false).notNull(),
  senderCashedOutAt: timestamp("senderCashedOutAt"),
  senderCashedOutNotes: text("senderCashedOutNotes"),
  incentiveAmount: varchar("incentiveAmount", { length: 20 }),
  incentiveCurrency: varchar("incentiveCurrency", { length: 10 }).default("USD"),
  senderConfirmedIncentiveAmount: varchar("senderConfirmedIncentiveAmount", { length: 20 }),
  receiverConfirmedIncentiveAmount: varchar("receiverConfirmedIncentiveAmount", { length: 20 }),
  senderConfirmedRevenueAmount: varchar("senderConfirmedRevenueAmount", { length: 20 }),
  receiverConfirmedRevenueAmount: varchar("receiverConfirmedRevenueAmount", { length: 20 }),
  isIncentiveVerified: boolean("isIncentiveVerified").default(false).notNull(),
  isRevenueVerified: boolean("isRevenueVerified").default(false).notNull(),
  isDisputed: boolean("isDisputed").default(false).notNull(),
  disputeReason: text("disputeReason"),
  disputedAt: timestamp("disputedAt"),
  disputedByUserId: int("disputedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Consumer offer claims
 */
export const consumerClaims = mysqlTable("consumerClaims", {
  id: int("id").autoincrement().primaryKey(),
  referralOfferId: int("referralOfferId").notNull(),
  businessId: int("businessId").notNull(),
  userId: int("userId").notNull(),
  claimCode: varchar("claimCode", { length: 20 }),
  status: mysqlEnum("status", ["claimed", "redeemed", "expired", "disputed"]).default("claimed").notNull(),
  isHonored: boolean("isHonored").default(false).notNull(),
  honoredAt: timestamp("honoredAt"),
  honoredNotes: text("honoredNotes"),
  amountSaved: varchar("amountSaved", { length: 20 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  isDisputed: boolean("isDisputed").default(false).notNull(),
  disputeReason: text("disputeReason"),
  disputedAt: timestamp("disputedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConsumerClaim = typeof consumerClaims.$inferSelect;
export type InsertConsumerClaim = typeof consumerClaims.$inferInsert;

/**
 * Platform activity stats for the home page tracker
 */
export const platformStats = mysqlTable("platformStats", {
  id: int("id").autoincrement().primaryKey(),
  statKey: varchar("statKey", { length: 100 }).notNull().unique(),
  statValue: int("statValue").default(0).notNull(),
  label: varchar("label", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformStat = typeof platformStats.$inferSelect;

/**
 * Business submissions: pending requests from businesses not yet in the directory
 */
export const businessSubmissions = mysqlTable("businessSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessDescription: text("businessDescription"),
  sportCategoryId: int("sportCategoryId").notNull(),
  businessTypeId: int("businessTypeId").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  hub: varchar("hub", { length: 100 }),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 30 }),
  website: varchar("website", { length: 500 }),
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  additionalNotes: text("additionalNotes"),
  sportCategoryIds: text("sportCategoryIds"), // JSON array of additional sport category IDs
  businessTypeIds: text("businessTypeIds"), // JSON array of additional business type IDs
  submittedByUserId: int("submittedByUserId"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessSubmission = typeof businessSubmissions.$inferSelect;
export type InsertBusinessSubmission = typeof businessSubmissions.$inferInsert;

/**
 * Email verification codes for business claims and submissions
 */
export const emailVerifications = mysqlTable("emailVerifications", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  businessId: int("businessId"),
  verificationType: mysqlEnum("verificationType", ["claim", "submission"]).default("claim").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

/**
 * Partnership emails: messages sent between businesses through the platform
 */
export const partnershipEmails = mysqlTable("partnership_emails", {
  id: int("id").autoincrement().primaryKey(),
  senderUserId: int("senderUserId").notNull(),
  senderBusinessId: int("senderBusinessId"),
  recipientBusinessId: int("recipientBusinessId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "failed"]).default("sent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnershipEmail = typeof partnershipEmails.$inferSelect;
export type InsertPartnershipEmail = typeof partnershipEmails.$inferInsert;

/**
 * Support tickets: user-submitted bug reports and feature requests
 */
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  ticketType: mysqlEnum("ticketType", ["bug", "feature_request", "general"]).default("general").notNull(),
  screenshotUrls: text("screenshotUrls"),
  status: mysqlEnum("status", ["new", "in_backlog", "in_progress", "in_testing", "done", "launched"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Category approval requests: when users want to add new categories/regions/hubs
 */
export const categoryApprovals = mysqlTable("category_approvals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  categoryType: mysqlEnum("categoryType", ["sport", "business_type", "region", "hub"]).notNull(),
  proposedName: varchar("proposedName", { length: 255 }).notNull(),
  proposedSlug: varchar("proposedSlug", { length: 255 }),
  parentRegion: varchar("parentRegion", { length: 100 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CategoryApproval = typeof categoryApprovals.$inferSelect;
export type InsertCategoryApproval = typeof categoryApprovals.$inferInsert;

/**
 * Athlete profiles: data collected from consumer/athlete signups for recommendations
 */
export const athleteProfiles = mysqlTable("athlete_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 255 }),
  // Sports they participate in (JSON array of sport category IDs)
  sportIds: text("sportIds"),
  // Experience level per sport (JSON object: { sportId: level })
  experienceLevels: text("experienceLevels"),
  // Location
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  hub: varchar("hub", { length: 100 }),
  // What they're looking for (JSON array: e.g. ["coaching", "bike_fit", "nutrition", "physio"])
  interests: text("interests"),
  // Goals (free text)
  goals: text("goals"),
  // How they heard about us
  referralSource: varchar("referralSource", { length: 255 }),
  // Newsletter opt-in
  newsletterOptIn: boolean("newsletterOptIn").default(false).notNull(),
  // Notification preferences: in_app_only, email_only, both, none
  notificationPreference: varchar("notificationPreference", { length: 20 }).default("both").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AthleteProfile = typeof athleteProfiles.$inferSelect;
export type InsertAthleteProfile = typeof athleteProfiles.$inferInsert;

/**
 * Saved/bookmarked businesses by consumers
 */
export const savedBusinesses = mysqlTable("saved_businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessId: int("businessId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedBusiness = typeof savedBusinesses.$inferSelect;
export type InsertSavedBusiness = typeof savedBusinesses.$inferInsert;

/**
 * In-app notifications for users (new offers on saved businesses, etc.)
 */
export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'new_offer', 'offer_updated', etc.
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message"),
  businessId: int("businessId"),
  offerId: int("offerId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

/**
 * Admin test athlete profiles: allows admins to create multiple athlete personas for testing
 * Unlike athlete_profiles (one per user), admins can have many test profiles
 */
export const adminTestProfiles = mysqlTable("admin_test_profiles", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(), // The admin user who created this profile
  profileName: varchar("profileName", { length: 255 }).notNull(), // e.g. "Pro Cyclist - Boulder"
  displayName: varchar("displayName", { length: 255 }),
  sportIds: text("sportIds"), // JSON array of sport category IDs
  experienceLevels: text("experienceLevels"), // JSON object: { sportId: level }
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  hub: varchar("hub", { length: 100 }),
  interests: text("interests"), // JSON array
  goals: text("goals"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminTestProfile = typeof adminTestProfiles.$inferSelect;
export type InsertAdminTestProfile = typeof adminTestProfiles.$inferInsert;

/**
 * Support ticket attachments: screenshots/images uploaded with support tickets
 */
export const supportTicketAttachments = mysqlTable("support_ticket_attachments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 2000 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // bytes
  uploadedByUserId: int("uploadedByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportTicketAttachment = typeof supportTicketAttachments.$inferSelect;
export type InsertSupportTicketAttachment = typeof supportTicketAttachments.$inferInsert;

/**
 * Test profile saved businesses: separate saved list per admin test profile
 */
export const testProfileSavedBusinesses = mysqlTable("test_profile_saved_businesses", {
  id: int("id").autoincrement().primaryKey(),
  testProfileId: int("testProfileId").notNull(),
  businessId: int("businessId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TestProfileSavedBusiness = typeof testProfileSavedBusinesses.$inferSelect;

/**
 * Test profile claims: separate claimed offers per admin test profile
 */
export const testProfileClaims = mysqlTable("test_profile_claims", {
  id: int("id").autoincrement().primaryKey(),
  testProfileId: int("testProfileId").notNull(),
  referralOfferId: int("referralOfferId").notNull(),
  businessId: int("businessId").notNull(),
  claimCode: varchar("claimCode", { length: 20 }),
  status: mysqlEnum("status", ["claimed", "redeemed", "expired", "disputed"]).default("claimed").notNull(),
  isHonored: boolean("isHonored").default(false).notNull(),
  honoredAt: timestamp("honoredAt"),
  honoredNotes: text("honoredNotes"),
  amountSaved: varchar("amountSaved", { length: 20 }),
  isDisputed: boolean("isDisputed").default(false).notNull(),
  disputeReason: text("disputeReason"),
  disputedAt: timestamp("disputedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TestProfileClaim = typeof testProfileClaims.$inferSelect;
