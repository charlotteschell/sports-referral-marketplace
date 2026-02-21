import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  
  // Approval workflow
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("approved").notNull(),
  approvalNotes: text("approvalNotes"),
  approvedAt: timestamp("approvedAt"),
  
  // Visibility controls
  isHidden: boolean("isHidden").default(false).notNull(), // owner can hide
  isAdminHidden: boolean("isAdminHidden").default(false).notNull(), // super admin can hide
  
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
  isHidden: boolean("isHidden").default(false).notNull(), // owner can hide
  isAdminHidden: boolean("isAdminHidden").default(false).notNull(), // super admin can hide
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
  
  // Who sent the referral
  referringBusinessId: int("referringBusinessId").notNull(),
  referringUserId: int("referringUserId").notNull(),
  
  // Who received the referral
  receivingBusinessId: int("receivingBusinessId").notNull(),
  referralOfferId: int("referralOfferId"),
  
  // Customer info
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 30 }),
  
  // Notes
  notes: text("notes"),
  
  // Status
  status: mysqlEnum("status", ["pending", "contacted", "converted", "declined", "expired"]).default("pending").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Business submissions: pending requests from businesses not yet in the directory
 */
export const businessSubmissions = mysqlTable("businessSubmissions", {
  id: int("id").autoincrement().primaryKey(),

  // Business info
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessDescription: text("businessDescription"),
  sportCategoryId: int("sportCategoryId").notNull(),
  businessTypeId: int("businessTypeId").notNull(),

  // Location
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  hub: varchar("hub", { length: 100 }),

  // Contact
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 30 }),
  website: varchar("website", { length: 500 }),

  // Social
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),

  // Additional info
  additionalNotes: text("additionalNotes"),

  // Submitter (optional - if logged in)
  submittedByUserId: int("submittedByUserId"),

  // Review status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessSubmission = typeof businessSubmissions.$inferSelect;
export type InsertBusinessSubmission = typeof businessSubmissions.$inferInsert;
