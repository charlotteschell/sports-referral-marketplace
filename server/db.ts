import { eq, and, like, or, sql, desc, asc, inArray, isNotNull, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  businesses, InsertBusiness, Business,
  sportCategories, SportCategory,
  businessTypes, BusinessType,
  referralOffers, InsertReferralOffer, ReferralOffer,
  referrals, InsertReferral, Referral,
  businessSportCategories,
  businessBusinessTypes,
  businessSubmissions, InsertBusinessSubmission, BusinessSubmission,
  emailVerifications, InsertEmailVerification,
  consumerClaims, InsertConsumerClaim, ConsumerClaim,
  platformStats,
  partnershipEmails, InsertPartnershipEmail,
  supportTickets, InsertSupportTicket, SupportTicket,
  categoryApprovals, InsertCategoryApproval,
  athleteProfiles, InsertAthleteProfile,
  savedBusinesses,
  userNotifications, InsertUserNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Helpers ───────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Sport Categories ───────────────────────────────────────────

export async function getAllSportCategories(): Promise<SportCategory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sportCategories).orderBy(asc(sportCategories.name));
}

// ─── Business Types ─────────────────────────────────────────────

export async function getAllBusinessTypes(): Promise<BusinessType[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessTypes).orderBy(asc(businessTypes.name));
}

// ─── Regions & Hubs ─────────────────────────────────────────────

export async function getDistinctRegions() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ region: businesses.region })
    .from(businesses)
    .where(and(
      eq(businesses.isActive, true),
      eq(businesses.approvalStatus, 'approved'),
      eq(businesses.isHidden, false),
      eq(businesses.isAdminHidden, false),
      isNotNull(businesses.region)
    ))
    .orderBy(asc(businesses.region));
  return result.map(r => r.region).filter(Boolean) as string[];
}

export async function getHubsByRegion(region?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(businesses.isActive, true),
    eq(businesses.approvalStatus, 'approved'),
    eq(businesses.isHidden, false),
    eq(businesses.isAdminHidden, false),
    isNotNull(businesses.hub),
  ];
  if (region) {
    conditions.push(eq(businesses.region, region));
  }
  const result = await db.selectDistinct({ hub: businesses.hub, region: businesses.region })
    .from(businesses)
    .where(and(...conditions))
    .orderBy(asc(businesses.hub));
  return result.filter(r => r.hub) as { hub: string; region: string | null }[];
}

// ─── Businesses ─────────────────────────────────────────────────

/** Conditions for publicly visible businesses */
function publicBusinessConditions() {
  return [
    eq(businesses.isActive, true),
    eq(businesses.approvalStatus, 'approved'),
    eq(businesses.isHidden, false),
    eq(businesses.isAdminHidden, false),
  ];
}

export interface BusinessSearchParams {
  search?: string;
  sportCategoryId?: number;
  businessTypeId?: number;
  city?: string;
  country?: string;
  region?: string;
  hub?: string;
  isClaimed?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchBusinesses(params: BusinessSearchParams) {
  const db = await getDb();
  if (!db) return { businesses: [], total: 0 };

  const conditions = publicBusinessConditions();

  if (params.search) {
    const q = params.search.toLowerCase();
    conditions.push(
      or(
        sql`LOWER(${businesses.name}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businesses.city}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businesses.shortDescription}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businesses.hub}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businesses.region}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businesses.country}) LIKE ${`%${q}%`}`,
        sql`LOWER(${businessTypes.name}) LIKE ${`%${q}%`}`,
        sql`LOWER(${sportCategories.name}) LIKE ${`%${q}%`}`
      )!
    );
  }
  if (params.sportCategoryId) {
    conditions.push(eq(businesses.sportCategoryId, params.sportCategoryId));
  }
  if (params.businessTypeId) {
    conditions.push(eq(businesses.businessTypeId, params.businessTypeId));
  }
  if (params.city) {
    const q = params.city.toLowerCase();
    conditions.push(sql`LOWER(${businesses.city}) LIKE ${`%${q}%`}`);
  }
  if (params.country) {
    const q = params.country.toLowerCase();
    conditions.push(sql`LOWER(${businesses.country}) LIKE ${`%${q}%`}`);
  }
  if (params.region) {
    conditions.push(eq(businesses.region, params.region));
  }
  if (params.hub) {
    conditions.push(eq(businesses.hub, params.hub));
  }
  if (params.isClaimed !== undefined) {
    conditions.push(eq(businesses.isClaimed, params.isClaimed));
  }

  const whereClause = and(...conditions);
  const limit = params.limit || 20;
  const offset = params.offset || 0;

  // Need joins before where clause for context-smart search across related tables
  const baseQuery = db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id));

  const countQuery = db.select({ count: sql<number>`count(*)` })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id));

  const [results, countResult] = await Promise.all([
    baseQuery
      .where(whereClause)
      .orderBy(desc(businesses.isFeatured), desc(businesses.isClaimed), asc(businesses.name))
      .limit(limit)
      .offset(offset),
    countQuery
      .where(whereClause),
  ]);

  return {
    businesses: results,
    total: Number(countResult[0]?.count || 0),
  };
}

// ─── Business Autocomplete Search (case-insensitive) ──────────

export async function searchBusinessesAutocomplete(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const q = query.toLowerCase();
  const results = await db.select({
    id: businesses.id,
    name: businesses.name,
    city: businesses.city,
    region: businesses.region,
    hub: businesses.hub,
    country: businesses.country,
    slug: businesses.slug,
    sportCategoryId: businesses.sportCategoryId,
    businessTypeId: businesses.businessTypeId,
    businessTypeName: businessTypes.name,
    sportCategoryName: sportCategories.name,
  })
    .from(businesses)
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .where(
      and(
        eq(businesses.isActive, true),
        eq(businesses.approvalStatus, 'approved'),
        eq(businesses.isHidden, false),
        eq(businesses.isAdminHidden, false),
        or(
          sql`LOWER(${businesses.name}) LIKE ${`%${q}%`}`,
          sql`LOWER(${businesses.city}) LIKE ${`%${q}%`}`,
          sql`LOWER(${businesses.hub}) LIKE ${`%${q}%`}`,
          sql`LOWER(${businesses.region}) LIKE ${`%${q}%`}`,
          sql`LOWER(${businesses.country}) LIKE ${`%${q}%`}`,
          sql`LOWER(${businessTypes.name}) LIKE ${`%${q}%`}`,
          sql`LOWER(${sportCategories.name}) LIKE ${`%${q}%`}`
        )!
      )
    )
    .orderBy(asc(businesses.name))
    .limit(limit);
  return results;
}

export async function getBusinessBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(eq(businesses.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(eq(businesses.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBusinessesByOwner(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(eq(businesses.claimedByUserId, userId))
    .orderBy(asc(businesses.name));
}

export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(businesses).values(data);
  return result[0].insertId;
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set(data).where(eq(businesses.id, id));
}

export async function claimBusiness(businessId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({
    isClaimed: true,
    claimedByUserId: userId,
    claimedAt: new Date(),
    approvalStatus: 'pending', // Requires admin approval
  }).where(eq(businesses.id, businessId));
  // Clear all sample data associated with this business
  await clearSampleDataForBusiness(businessId);
}

/**
 * Remove all sample/seed data associated with a business when it gets claimed.
 * This ensures real owners start with a clean slate.
 */
export async function clearSampleDataForBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return;

  // 1. Delete sample referral offers for this business
  await db.delete(referralOffers)
    .where(and(eq(referralOffers.businessId, businessId), eq(referralOffers.isSample, true)));

  // 2. Delete sample referrals where this business was the sender or receiver
  await db.delete(referrals)
    .where(eq(referrals.referringBusinessId, businessId));
  await db.delete(referrals)
    .where(eq(referrals.receivingBusinessId, businessId));

  // 3. Delete consumer claims for this business
  await db.delete(consumerClaims)
    .where(eq(consumerClaims.businessId, businessId));
}

export async function getFeaturedBusinesses(limit = 6) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(and(...publicBusinessConditions(), eq(businesses.isFeatured, true)))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
}

// ─── Admin: Approval Workflow ─────────────────────────────────

export async function getBusinessesPendingApproval() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(eq(businesses.approvalStatus, 'pending'))
    .orderBy(desc(businesses.updatedAt));
}

export async function approveOrRejectBusiness(
  businessId: number,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = {
    approvalStatus: status,
    approvalNotes: notes || null,
  };
  if (status === 'approved') {
    updateData.approvedAt = new Date();
  }
  if (status === 'rejected') {
    // If rejected, unclaim the business
    updateData.isClaimed = false;
    updateData.claimedByUserId = null;
    updateData.claimedAt = null;
  }
  await db.update(businesses).set(updateData).where(eq(businesses.id, businessId));
  // When approving a claimed business, clear sample data so the real owner starts fresh
  if (status === 'approved') {
    await clearSampleDataForBusiness(businessId);
  }
}

// ─── Admin: All businesses (including hidden) ─────────────────

export async function getAllBusinessesAdmin(params?: { approvalStatus?: string; isHidden?: boolean; isAdminHidden?: boolean; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { businesses: [], total: 0 };

  const conditions = [eq(businesses.isActive, true)];
  if (params?.approvalStatus) {
    conditions.push(eq(businesses.approvalStatus, params.approvalStatus as "pending" | "approved" | "rejected"));
  }
  if (params?.isHidden !== undefined) {
    conditions.push(eq(businesses.isHidden, params.isHidden));
  }
  if (params?.isAdminHidden !== undefined) {
    conditions.push(eq(businesses.isAdminHidden, params.isAdminHidden));
  }

  const whereClause = and(...conditions);
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  const [results, countResult] = await Promise.all([
    db.select({
      business: businesses,
      sportCategory: sportCategories,
      businessType: businessTypes,
    })
      .from(businesses)
      .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
      .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
      .where(whereClause)
      .orderBy(desc(businesses.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(businesses)
      .where(whereClause),
  ]);

  return {
    businesses: results,
    total: Number(countResult[0]?.count || 0),
  };
}

// ─── Admin: Toggle visibility ─────────────────────────────────

export async function adminToggleBusinessVisibility(businessId: number, isAdminHidden: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({ isAdminHidden }).where(eq(businesses.id, businessId));
}

export async function adminToggleOfferVisibility(offerId: number, isAdminHidden: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralOffers).set({ isAdminHidden }).where(eq(referralOffers.id, offerId));
}

// ─── Owner: Toggle visibility ─────────────────────────────────

export async function ownerToggleBusinessVisibility(businessId: number, isHidden: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({ isHidden }).where(eq(businesses.id, businessId));
}

export async function ownerToggleOfferVisibility(offerId: number, isHidden: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralOffers).set({ isHidden }).where(eq(referralOffers.id, offerId));
}

// ─── Referral Offers ────────────────────────────────────────────

export async function getReferralOffersByBusiness(businessId: number, offerType?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(referralOffers.businessId, businessId),
    eq(referralOffers.isActive, true),
    eq(referralOffers.isHidden, false),
    eq(referralOffers.isAdminHidden, false),
  ];
  if (offerType) {
    conditions.push(eq(referralOffers.offerType, offerType as "b2b" | "consumer"));
  }
  return db.select().from(referralOffers)
    .where(and(...conditions))
    .orderBy(desc(referralOffers.createdAt));
}

/** Get all offers for a business (including hidden) - for owner/admin */
export async function getReferralOffersByBusinessAll(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralOffers)
    .where(and(eq(referralOffers.businessId, businessId), eq(referralOffers.isActive, true)))
    .orderBy(desc(referralOffers.createdAt));
}

export async function createReferralOffer(data: InsertReferralOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(referralOffers).values(data);
  return result[0].insertId;
}

export async function updateReferralOffer(id: number, data: Partial<InsertReferralOffer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralOffers).set(data).where(eq(referralOffers.id, id));
}

export async function deleteReferralOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralOffers).set({ isActive: false }).where(eq(referralOffers.id, id));
}

export async function getReferralOfferById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(referralOffers).where(eq(referralOffers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllActiveReferralOffers(offerType?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(referralOffers.isActive, true),
    eq(referralOffers.isHidden, false),
    eq(referralOffers.isAdminHidden, false),
    eq(businesses.isClaimed, true),
    eq(businesses.approvalStatus, 'approved'),
    eq(businesses.isHidden, false),
    eq(businesses.isAdminHidden, false),
  ];
  if (offerType) {
    conditions.push(eq(referralOffers.offerType, offerType as "b2b" | "consumer"));
  }
  return db.select({
    offer: referralOffers,
    business: businesses,
    sportCategory: sportCategories,
  })
    .from(referralOffers)
    .leftJoin(businesses, eq(referralOffers.businessId, businesses.id))
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .where(and(...conditions))
    .orderBy(desc(referralOffers.createdAt))
    .limit(limit)
    .offset(offset);
}

// ─── Admin: All offers (including hidden) ─────────────────────

export async function getAllOffersAdmin(businessId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(referralOffers.isActive, true)];
  if (businessId) {
    conditions.push(eq(referralOffers.businessId, businessId));
  }
  return db.select({
    offer: referralOffers,
    business: businesses,
  })
    .from(referralOffers)
    .leftJoin(businesses, eq(referralOffers.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(desc(referralOffers.createdAt));
}

// ─── Referrals (Tracking) ───────────────────────────────────────

export async function createReferral(data: InsertReferral) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(referrals).values(data);
  return result[0].insertId;
}

export async function updateReferralStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (status === 'converted') {
    updateData.completedAt = new Date();
  }
  await db.update(referrals).set(updateData).where(eq(referrals.id, id));
}

export async function getReferralsSent(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const referringBizIds = await db.select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.claimedByUserId, userId));

  if (referringBizIds.length === 0) return [];

  const bizIds = referringBizIds.map(b => b.id);
  return db.select({
    referral: referrals,
    receivingBusiness: businesses,
  })
    .from(referrals)
    .leftJoin(businesses, eq(referrals.receivingBusinessId, businesses.id))
    .where(inArray(referrals.referringBusinessId, bizIds))
    .orderBy(desc(referrals.createdAt));
}

export async function getReferralsReceived(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const receivingBizIds = await db.select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.claimedByUserId, userId));

  if (receivingBizIds.length === 0) return [];

  const bizIds = receivingBizIds.map(b => b.id);
  return db.select({
    referral: referrals,
    referringBusiness: businesses,
  })
    .from(referrals)
    .leftJoin(businesses, eq(referrals.referringBusinessId, businesses.id))
    .where(inArray(referrals.receivingBusinessId, bizIds))
    .orderBy(desc(referrals.createdAt));
}

export async function getReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return { sent: 0, received: 0, converted: 0, pending: 0 };

  const userBizIds = await db.select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.claimedByUserId, userId));

  if (userBizIds.length === 0) return { sent: 0, received: 0, converted: 0, pending: 0 };

  const bizIds = userBizIds.map(b => b.id);

  const [sentResult, receivedResult, convertedResult, pendingResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(inArray(referrals.referringBusinessId, bizIds)),
    db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(inArray(referrals.receivingBusinessId, bizIds)),
    db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(
        inArray(referrals.receivingBusinessId, bizIds),
        eq(referrals.status, 'converted')
      )),
    db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(
        or(
          inArray(referrals.referringBusinessId, bizIds),
          inArray(referrals.receivingBusinessId, bizIds)
        )!,
        eq(referrals.status, 'pending')
      )),
  ]);

  return {
    sent: Number(sentResult[0]?.count || 0),
    received: Number(receivedResult[0]?.count || 0),
    converted: Number(convertedResult[0]?.count || 0),
    pending: Number(pendingResult[0]?.count || 0),
  };
}

// ─── Business Submissions ──────────────────────────────────────

export async function createBusinessSubmission(data: InsertBusinessSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(businessSubmissions).values(data);
  return result[0].insertId;
}

export async function getBusinessSubmissions(status?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (status) {
    conditions.push(eq(businessSubmissions.status, status as "pending" | "approved" | "rejected"));
  }
  return db.select({
    submission: businessSubmissions,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businessSubmissions)
    .leftJoin(sportCategories, eq(businessSubmissions.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businessSubmissions.businessTypeId, businessTypes.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(businessSubmissions.createdAt));
}

export async function updateBusinessSubmissionStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businessSubmissions).set({
    status,
    reviewNotes: reviewNotes || null,
    reviewedAt: new Date(),
  }).where(eq(businessSubmissions.id, id));
}

export async function getBusinessSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    submission: businessSubmissions,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(businessSubmissions)
    .leftJoin(sportCategories, eq(businessSubmissions.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businessSubmissions.businessTypeId, businessTypes.id))
    .where(eq(businessSubmissions.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ─── Unclaim & Delete Business ─────────────────────────────────

export async function unclaimBusiness(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({
    isClaimed: false,
    claimedByUserId: null,
    claimedAt: null,
    approvalStatus: 'approved', // Reset to approved (unclaimed)
  }).where(eq(businesses.id, businessId));
  await db.update(referralOffers).set({ isActive: false }).where(eq(referralOffers.businessId, businessId));
}

export async function deleteBusiness(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({
    isActive: false,
    isClaimed: false,
    claimedByUserId: null,
    claimedAt: null,
  }).where(eq(businesses.id, businessId));
  await db.update(referralOffers).set({ isActive: false }).where(eq(referralOffers.businessId, businessId));
}

// ─── Dashboard Analytics ──────────────────────────────────────

export async function getDashboardAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return { totalReferralsSent: 0, totalReferralsReceived: 0, conversionRate: 0, activeOffers: 0, statusBreakdown: { pending: 0, contacted: 0, converted: 0, declined: 0, expired: 0 }, topPartners: [], recentActivity: [] };

  const userBizIds = await db.select({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .where(eq(businesses.claimedByUserId, userId));

  if (userBizIds.length === 0) return { totalReferralsSent: 0, totalReferralsReceived: 0, conversionRate: 0, activeOffers: 0, statusBreakdown: { pending: 0, contacted: 0, converted: 0, declined: 0, expired: 0 }, topPartners: [], recentActivity: [] };

  const bizIds = userBizIds.map(b => b.id);

  const [sentResult, receivedResult, convertedResult, activeOffersResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(referrals).where(inArray(referrals.referringBusinessId, bizIds)),
    db.select({ count: sql<number>`count(*)` }).from(referrals).where(inArray(referrals.receivingBusinessId, bizIds)),
    db.select({ count: sql<number>`count(*)` }).from(referrals).where(and(inArray(referrals.receivingBusinessId, bizIds), eq(referrals.status, 'converted'))),
    db.select({ count: sql<number>`count(*)` }).from(referralOffers).where(and(inArray(referralOffers.businessId, bizIds), eq(referralOffers.isActive, true))),
  ]);

  const totalSent = Number(sentResult[0]?.count || 0);
  const totalReceived = Number(receivedResult[0]?.count || 0);
  const totalConverted = Number(convertedResult[0]?.count || 0);
  const totalAll = totalSent + totalReceived;
  const conversionRate = totalAll > 0 ? Math.round((totalConverted / totalAll) * 100) : 0;

  const statusCounts = await db.select({
    status: referrals.status,
    count: sql<number>`count(*)`,
  })
    .from(referrals)
    .where(or(
      inArray(referrals.referringBusinessId, bizIds),
      inArray(referrals.receivingBusinessId, bizIds)
    )!)
    .groupBy(referrals.status);

  const statusBreakdown = { pending: 0, contacted: 0, converted: 0, declined: 0, expired: 0 };
  for (const row of statusCounts) {
    if (row.status in statusBreakdown) {
      statusBreakdown[row.status as keyof typeof statusBreakdown] = Number(row.count);
    }
  }

  const topPartnersRaw = await db.select({
    businessId: businesses.id,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    count: sql<number>`count(*)`,
  })
    .from(referrals)
    .leftJoin(businesses, eq(referrals.referringBusinessId, businesses.id))
    .where(inArray(referrals.receivingBusinessId, bizIds))
    .groupBy(businesses.id, businesses.name, businesses.slug)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const topPartners = topPartnersRaw.map(p => ({
    businessId: p.businessId,
    businessName: p.businessName,
    businessSlug: p.businessSlug,
    referralCount: Number(p.count),
  }));

  const recentSent = await db.select({
    referral: referrals,
    partnerBusiness: businesses,
  })
    .from(referrals)
    .leftJoin(businesses, eq(referrals.receivingBusinessId, businesses.id))
    .where(inArray(referrals.referringBusinessId, bizIds))
    .orderBy(desc(referrals.createdAt))
    .limit(5);

  const recentReceived = await db.select({
    referral: referrals,
    partnerBusiness: businesses,
  })
    .from(referrals)
    .leftJoin(businesses, eq(referrals.referringBusinessId, businesses.id))
    .where(inArray(referrals.receivingBusinessId, bizIds))
    .orderBy(desc(referrals.createdAt))
    .limit(5);

  const recentActivity = [
    ...recentSent.map(r => ({ ...r, direction: 'sent' as const })),
    ...recentReceived.map(r => ({ ...r, direction: 'received' as const })),
  ].sort((a, b) => {
    const dateA = a.referral.createdAt ? new Date(a.referral.createdAt).getTime() : 0;
    const dateB = b.referral.createdAt ? new Date(b.referral.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 10);

  return {
    totalReferralsSent: totalSent,
    totalReferralsReceived: totalReceived,
    conversionRate,
    activeOffers: Number(activeOffersResult[0]?.count || 0),
    statusBreakdown,
    topPartners,
    recentActivity,
  };
}

// ─── Directory Stats ───────────────────────────────────────────

export async function getDirectoryStats() {
  const db = await getDb();
  if (!db) return { totalBusinesses: 0, claimedBusinesses: 0, totalReferrals: 0, sportCategories: 0, regions: 0 };

  const [totalBiz, claimedBiz, totalRef, totalCats, totalRegions] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(businesses).where(and(...publicBusinessConditions())),
    db.select({ count: sql<number>`count(*)` }).from(businesses).where(and(...publicBusinessConditions(), eq(businesses.isClaimed, true))),
    db.select({ count: sql<number>`count(*)` }).from(referrals),
    db.select({ count: sql<number>`count(*)` }).from(sportCategories),
    db.select({ count: sql<number>`count(distinct ${businesses.region})` }).from(businesses).where(and(...publicBusinessConditions(), isNotNull(businesses.region))),
  ]);

  return {
    totalBusinesses: Number(totalBiz[0]?.count || 0),
    claimedBusinesses: Number(claimedBiz[0]?.count || 0),
    totalReferrals: Number(totalRef[0]?.count || 0),
    sportCategories: Number(totalCats[0]?.count || 0),
    regions: Number(totalRegions[0]?.count || 0),
  };
}

// ─── Email Verification ──────────────────────────────────────

export async function createEmailVerification(data: { email: string; code: string; businessId?: number; verificationType: 'claim' | 'submission'; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailVerifications).values(data);
  return result[0].insertId;
}

export async function verifyEmailCode(email: string, code: string, verificationType: 'claim' | 'submission') {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(emailVerifications)
    .where(and(
      eq(emailVerifications.email, email),
      eq(emailVerifications.code, code),
      eq(emailVerifications.verificationType, verificationType),
      eq(emailVerifications.isVerified, false),
      sql`${emailVerifications.expiresAt} > NOW()`
    ))
    .limit(1);
  if (result.length === 0) return false;
  await db.update(emailVerifications).set({ isVerified: true }).where(eq(emailVerifications.id, result[0].id));
  return true;
}

export async function isEmailVerified(email: string, verificationType: 'claim' | 'submission') {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(emailVerifications)
    .where(and(
      eq(emailVerifications.email, email),
      eq(emailVerifications.verificationType, verificationType),
      eq(emailVerifications.isVerified, true),
      sql`${emailVerifications.expiresAt} > NOW()`
    ))
    .limit(1);
  return result.length > 0;
}

// ─── Featured Business Offers (for directory cards & featured section) ──

export async function getOffersForBusinessIds(businessIds: number[]) {
  const db = await getDb();
  if (!db || businessIds.length === 0) return [];
  return db.select().from(referralOffers)
    .where(and(
      inArray(referralOffers.businessId, businessIds),
      eq(referralOffers.isActive, true),
      eq(referralOffers.isHidden, false),
      eq(referralOffers.isAdminHidden, false),
    ))
    .orderBy(asc(referralOffers.businessId), desc(referralOffers.createdAt));
}

// ─── Phone Formatting Utility ─────────────────────────────────

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    // North American: (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    // North American with country code: +1 (XXX) XXX-XXXX
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (hasPlus || digits.length > 10) {
    // International: +XX XXX XXX XXXX (general grouping)
    const prefix = hasPlus ? '+' : '';
    if (digits.length <= 12) {
      return `${prefix}${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
    }
    return `${prefix}${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
  }
  // Fallback: return as-is
  return phone;
}


// ─── Referral Verification ──────────────────────────────────────

/**
 * Receiver marks a referral as honored (they served the customer)
 */
export async function markReferralHonored(referralId: number, userId: number, notes?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(referrals)
    .set({
      receiverHonored: true,
      receiverHonoredAt: new Date(),
      receiverHonoredNotes: notes || null,
      status: 'converted',
    })
    .where(eq(referrals.id, referralId));
}

/**
 * Sender marks that they received the incentive (cashed out)
 */
export async function markReferralCashedOut(referralId: number, userId: number, amount?: string, notes?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(referrals)
    .set({
      senderCashedOut: true,
      senderCashedOutAt: new Date(),
      senderCashedOutNotes: notes || null,
      incentiveAmount: amount || null,
      completedAt: new Date(),
    })
    .where(eq(referrals.id, referralId));
}

/**
 * Dispute a referral
 */
export async function disputeReferral(referralId: number, userId: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(referrals)
    .set({
      isDisputed: true,
      disputeReason: reason,
      disputedAt: new Date(),
      disputedByUserId: userId,
    })
    .where(eq(referrals.id, referralId));
}

/**
 * Get referral by ID with full details
 */
export async function getReferralById(referralId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(referrals).where(eq(referrals.id, referralId)).limit(1);
  return rows[0] || null;
}

// ─── Consumer Claims ────────────────────────────────────────────

/**
 * Consumer claims an offer - generates a unique claim code
 */
export async function createConsumerClaim(data: { referralOfferId: number; businessId: number; userId: number }) {
  const db = await getDb();
  if (!db) return null;
  
  // Generate unique claim code: SC-XXXXX
  const code = 'SC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const result = await db.insert(consumerClaims).values({
    referralOfferId: data.referralOfferId,
    businessId: data.businessId,
    userId: data.userId,
    claimCode: code,
    status: 'claimed',
  });
  
  return { id: Number(result[0].insertId), claimCode: code };
}

/**
 * Consumer verifies if the business honored their offer
 */
export async function verifyConsumerClaim(claimId: number, userId: number, honored: boolean, amountSaved?: string, notes?: string) {
  const db = await getDb();
  if (!db) return;
  
  if (honored) {
    await db.update(consumerClaims)
      .set({
        isHonored: true,
        honoredAt: new Date(),
        honoredNotes: notes || null,
        amountSaved: amountSaved || null,
        status: 'redeemed',
      })
      .where(and(eq(consumerClaims.id, claimId), eq(consumerClaims.userId, userId)));
  } else {
    await db.update(consumerClaims)
      .set({
        isDisputed: true,
        disputeReason: notes || 'Business did not honor the offer',
        disputedAt: new Date(),
        status: 'disputed',
      })
      .where(and(eq(consumerClaims.id, claimId), eq(consumerClaims.userId, userId)));
  }
}

/**
 * Get consumer claims for a user
 */
export async function getConsumerClaimsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    claim: consumerClaims,
    offer: referralOffers,
    business: {
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      logoUrl: businesses.logoUrl,
    },
  })
    .from(consumerClaims)
    .innerJoin(referralOffers, eq(consumerClaims.referralOfferId, referralOffers.id))
    .innerJoin(businesses, eq(consumerClaims.businessId, businesses.id))
    .where(eq(consumerClaims.userId, userId))
    .orderBy(desc(consumerClaims.createdAt));
}

/**
 * Get consumer claims for a business (business owner view)
 */
export async function getConsumerClaimsByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    claim: consumerClaims,
    offer: referralOffers,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
    },
  })
    .from(consumerClaims)
    .innerJoin(referralOffers, eq(consumerClaims.referralOfferId, referralOffers.id))
    .innerJoin(users, eq(consumerClaims.userId, users.id))
    .where(eq(consumerClaims.businessId, businessId))
    .orderBy(desc(consumerClaims.createdAt));
}

/**
 * Check if user already claimed a specific offer
 */
export async function hasUserClaimedOffer(userId: number, referralOfferId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: consumerClaims.id })
    .from(consumerClaims)
    .where(and(
      eq(consumerClaims.userId, userId),
      eq(consumerClaims.referralOfferId, referralOfferId),
      inArray(consumerClaims.status, ['claimed', 'redeemed']),
    ))
    .limit(1);
  return rows.length > 0;
}

// ─── Business Dashboard Analytics ───────────────────────────────

/**
 * Get comprehensive analytics for a business
 */
export async function getBusinessAnalytics(businessId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Referrals received
  const receivedRows = await db.select({
    total: sql<number>`COUNT(*)`,
    honored: sql<number>`SUM(CASE WHEN ${referrals.receiverHonored} = true THEN 1 ELSE 0 END)`,
    disputed: sql<number>`SUM(CASE WHEN ${referrals.isDisputed} = true THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${referrals.receiverHonored} = false AND ${referrals.isDisputed} = false THEN 1 ELSE 0 END)`,
  }).from(referrals).where(eq(referrals.receivingBusinessId, businessId));
  
  // Referrals sent
  const sentRows = await db.select({
    total: sql<number>`COUNT(*)`,
    cashedOut: sql<number>`SUM(CASE WHEN ${referrals.senderCashedOut} = true THEN 1 ELSE 0 END)`,
    totalEarned: sql<string>`COALESCE(SUM(CASE WHEN ${referrals.senderCashedOut} = true THEN CAST(${referrals.incentiveAmount} AS DECIMAL(10,2)) ELSE 0 END), 0)`,
    disputed: sql<number>`SUM(CASE WHEN ${referrals.isDisputed} = true THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${referrals.senderCashedOut} = false AND ${referrals.isDisputed} = false THEN 1 ELSE 0 END)`,
  }).from(referrals).where(eq(referrals.referringBusinessId, businessId));
  
  // Consumer claims received
  const claimRows = await db.select({
    total: sql<number>`COUNT(*)`,
    redeemed: sql<number>`SUM(CASE WHEN ${consumerClaims.isHonored} = true THEN 1 ELSE 0 END)`,
    disputed: sql<number>`SUM(CASE WHEN ${consumerClaims.isDisputed} = true THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${consumerClaims.isHonored} = false AND ${consumerClaims.isDisputed} = false THEN 1 ELSE 0 END)`,
  }).from(consumerClaims).where(eq(consumerClaims.businessId, businessId));
  
  return {
    referralsReceived: {
      total: Number(receivedRows[0]?.total || 0),
      honored: Number(receivedRows[0]?.honored || 0),
      disputed: Number(receivedRows[0]?.disputed || 0),
      pending: Number(receivedRows[0]?.pending || 0),
    },
    referralsSent: {
      total: Number(sentRows[0]?.total || 0),
      cashedOut: Number(sentRows[0]?.cashedOut || 0),
      totalEarned: sentRows[0]?.totalEarned || '0',
      disputed: Number(sentRows[0]?.disputed || 0),
      pending: Number(sentRows[0]?.pending || 0),
    },
    consumerClaims: {
      total: Number(claimRows[0]?.total || 0),
      redeemed: Number(claimRows[0]?.redeemed || 0),
      disputed: Number(claimRows[0]?.disputed || 0),
      pending: Number(claimRows[0]?.pending || 0),
    },
  };
}

// ─── Consumer Dashboard Analytics ───────────────────────────────

/**
 * Get analytics for a consumer user
 */
export async function getConsumerAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const rows = await db.select({
    totalClaims: sql<number>`COUNT(*)`,
    redeemed: sql<number>`SUM(CASE WHEN ${consumerClaims.isHonored} = true THEN 1 ELSE 0 END)`,
    totalSaved: sql<string>`COALESCE(SUM(CASE WHEN ${consumerClaims.isHonored} = true THEN CAST(${consumerClaims.amountSaved} AS DECIMAL(10,2)) ELSE 0 END), 0)`,
    disputed: sql<number>`SUM(CASE WHEN ${consumerClaims.isDisputed} = true THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${consumerClaims.isHonored} = false AND ${consumerClaims.isDisputed} = false THEN 1 ELSE 0 END)`,
  }).from(consumerClaims).where(eq(consumerClaims.userId, userId));
  
  return {
    totalClaims: Number(rows[0]?.totalClaims || 0),
    redeemed: Number(rows[0]?.redeemed || 0),
    totalSaved: rows[0]?.totalSaved || '0',
    disputed: Number(rows[0]?.disputed || 0),
    pending: Number(rows[0]?.pending || 0),
  };
}

// ─── Platform Stats ─────────────────────────────────────────────

/**
 * Get all platform stats for the home page tracker
 */
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalReferrals: 0, honoredReferrals: 0, totalIncentivesExchanged: 0, consumerOffersClaimed: 0, consumerSavings: 0, activeBusinesses: 0 };
  const rows = await db.select().from(platformStats);
  const raw: Record<string, number> = {};
  for (const row of rows) {
    raw[row.statKey] = row.statValue;
  }
  return {
    totalReferrals: raw['totalReferrals'] || 0,
    honoredReferrals: raw['honoredReferrals'] || 0,
    totalIncentivesExchanged: raw['totalIncentivesExchanged'] || 0,
    consumerOffersClaimed: raw['consumerOffersClaimed'] || 0,
    consumerSavings: raw['consumerSavings'] || 0,
    activeBusinesses: raw['activeBusinesses'] || 0,
  };
}

/**
 * Increment a platform stat by a given amount
 */
export async function incrementPlatformStat(key: string, amount: number = 1) {
  const db = await getDb();
  if (!db) return;
  await db.update(platformStats)
    .set({ statValue: sql`${platformStats.statValue} + ${amount}` })
    .where(eq(platformStats.statKey, key));
}

/**
 * Get referrals for a business with full partner details (for dashboard)
 */
export async function getReferralsForBusiness(businessId: number, direction: 'sent' | 'received', limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  if (direction === 'received') {
    return db.select({
      referral: referrals,
      partnerBusiness: {
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        logoUrl: businesses.logoUrl,
      },
    })
      .from(referrals)
      .innerJoin(businesses, eq(referrals.referringBusinessId, businesses.id))
      .where(eq(referrals.receivingBusinessId, businessId))
      .orderBy(desc(referrals.createdAt))
      .limit(limit);
  } else {
    return db.select({
      referral: referrals,
      partnerBusiness: {
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        logoUrl: businesses.logoUrl,
      },
    })
      .from(referrals)
      .innerJoin(businesses, eq(referrals.receivingBusinessId, businesses.id))
      .where(eq(referrals.referringBusinessId, businessId))
      .orderBy(desc(referrals.createdAt))
      .limit(limit);
  }
}


// ─── Partnership Emails ─────────────────────────────────────
export async function sendPartnershipEmail(data: {
  senderUserId: number;
  senderBusinessId?: number;
  recipientBusinessId: number;
  recipientEmail: string;
  subject: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(partnershipEmails).values(data);
  return { id: result[0].insertId };
}

export async function getPartnershipEmailsSent(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnershipEmails)
    .where(eq(partnershipEmails.senderUserId, userId))
    .orderBy(desc(partnershipEmails.createdAt));
}

export async function getPartnershipEmailsForBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnershipEmails)
    .where(eq(partnershipEmails.recipientBusinessId, businessId))
    .orderBy(desc(partnershipEmails.createdAt));
}

export async function getPartnershipEmailCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(partnershipEmails);
  return result[0]?.count ?? 0;
}

// ─── Support Tickets ────────────────────────────────────────
export async function createSupportTicket(data: {
  userId?: number;
  userName?: string;
  userEmail: string;
  title: string;
  description: string;
  ticketType: 'bug' | 'feature_request' | 'general';
  screenshotUrls?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supportTickets).values(data);
  return { id: result[0].insertId };
}

export async function getAllSupportTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function getSupportTicketsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function updateSupportTicketStatus(id: number, status: string, adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (status === 'done' || status === 'launched') updateData.resolvedAt = new Date();
  await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, id));
}

export async function getSupportTicketById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
  return result[0] ?? null;
}

// ─── Category Approvals ─────────────────────────────────────
export async function createCategoryApproval(data: {
  userId?: number;
  categoryType: 'sport' | 'business_type' | 'region' | 'hub';
  proposedName: string;
  proposedSlug?: string;
  parentRegion?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categoryApprovals).values(data);
  return { id: result[0].insertId };
}

export async function getAllCategoryApprovals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categoryApprovals).orderBy(desc(categoryApprovals.createdAt));
}

export async function getPendingCategoryApprovals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categoryApprovals)
    .where(eq(categoryApprovals.status, 'pending'))
    .orderBy(desc(categoryApprovals.createdAt));
}

export async function updateCategoryApprovalStatus(id: number, status: 'approved' | 'rejected', adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categoryApprovals).set({ status, adminNotes }).where(eq(categoryApprovals.id, id));
}

export async function getCategoryApprovalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categoryApprovals).where(eq(categoryApprovals.id, id));
  return result[0] ?? null;
}

// ─── Account Type ───────────────────────────────────────────
export async function updateUserAccountType(userId: number, accountType: 'consumer' | 'business_owner') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ accountType }).where(eq(users.id, userId));
}

export async function markOnboardingComplete(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ onboardingComplete: true }).where(eq(users.id, userId));
}

// ─── Logo Upload ────────────────────────────────────────────
export async function updateBusinessLogo(businessId: number, logoUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({ logoUrl }).where(eq(businesses.id, businessId));
}

// ─── Brands Carried ─────────────────────────────────────────
export async function updateBusinessBrands(businessId: number, brandsCarried: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businesses).set({ brandsCarried }).where(eq(businesses.id, businessId));
}

// ─── Multi-Select: Sport Categories & Business Types ────────

export async function getBusinessSportCategories(businessId: number): Promise<SportCategory[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ category: sportCategories })
    .from(businessSportCategories)
    .innerJoin(sportCategories, eq(businessSportCategories.sportCategoryId, sportCategories.id))
    .where(eq(businessSportCategories.businessId, businessId))
    .orderBy(asc(sportCategories.name));
  return rows.map(r => r.category);
}

export async function getBusinessBusinessTypes(businessId: number): Promise<BusinessType[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ type: businessTypes })
    .from(businessBusinessTypes)
    .innerJoin(businessTypes, eq(businessBusinessTypes.businessTypeId, businessTypes.id))
    .where(eq(businessBusinessTypes.businessId, businessId))
    .orderBy(asc(businessTypes.name));
  return rows.map(r => r.type);
}

export async function setBusinessSportCategories(businessId: number, categoryIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete existing
  await db.delete(businessSportCategories).where(eq(businessSportCategories.businessId, businessId));
  // Insert new
  if (categoryIds.length > 0) {
    await db.insert(businessSportCategories).values(
      categoryIds.map(id => ({ businessId, sportCategoryId: id }))
    );
    // Update primary to first selected
    await db.update(businesses).set({ sportCategoryId: categoryIds[0] }).where(eq(businesses.id, businessId));
  }
}

export async function setBusinessBusinessTypes(businessId: number, typeIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete existing
  await db.delete(businessBusinessTypes).where(eq(businessBusinessTypes.businessId, businessId));
  // Insert new
  if (typeIds.length > 0) {
    await db.insert(businessBusinessTypes).values(
      typeIds.map(id => ({ businessId, businessTypeId: id }))
    );
    // Update primary to first selected
    await db.update(businesses).set({ businessTypeId: typeIds[0] }).where(eq(businesses.id, businessId));
  }
}

// ─── Multi-select search support ────────────────────────────
export async function searchBusinessesMulti(filters: {
  search?: string;
  sportCategoryIds?: number[];
  businessTypeIds?: number[];
  regions?: string[];
  hubs?: string[];
  isClaimed?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { businesses: [], total: 0 };
  
  const conditions = [
    eq(businesses.isActive, true),
    eq(businesses.approvalStatus, 'approved'),
    eq(businesses.isHidden, false),
    eq(businesses.isAdminHidden, false),
  ];

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(businesses.name, term),
        like(businesses.description, term),
        like(businesses.city, term),
        like(businesses.region, term),
        like(businesses.hub, term),
        like(businesses.country, term),
      )!
    );
  }

  if (filters.sportCategoryIds && filters.sportCategoryIds.length > 0) {
    conditions.push(inArray(businesses.sportCategoryId, filters.sportCategoryIds));
  }

  if (filters.businessTypeIds && filters.businessTypeIds.length > 0) {
    conditions.push(inArray(businesses.businessTypeId, filters.businessTypeIds));
  }

  if (filters.regions && filters.regions.length > 0) {
    conditions.push(inArray(businesses.region, filters.regions));
  }

  if (filters.hubs && filters.hubs.length > 0) {
    conditions.push(inArray(businesses.hub, filters.hubs));
  }

  if (filters.isClaimed !== undefined) {
    conditions.push(eq(businesses.isClaimed, filters.isClaimed));
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [results, countResult] = await Promise.all([
    db.select({
      business: businesses,
      sportCategory: sportCategories,
      businessType: businessTypes,
    })
    .from(businesses)
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(and(...conditions))
    .orderBy(desc(businesses.isFeatured), desc(businesses.isClaimed), asc(businesses.name))
    .limit(limit)
    .offset(offset),
    
    db.select({ count: sql<number>`COUNT(*)` })
    .from(businesses)
    .where(and(...conditions)),
  ]);

  return {
    businesses: results,
    total: countResult[0]?.count ?? 0,
  };
}


// ─── Create Sport Category / Business Type (for approved category requests) ──
export async function createSportCategory(data: { name: string; slug: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(sportCategories).values(data);
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') return; // already exists
    throw e;
  }
}

export async function createBusinessType(data: { name: string; slug: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(businessTypes).values(data);
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') return; // already exists
    throw e;
  }
}

// ─── Athlete Profiles ──────────────────────────────────────────

export async function createOrUpdateAthleteProfile(userId: number, data: Partial<InsertAthleteProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(athleteProfiles).where(eq(athleteProfiles.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(athleteProfiles).set(data).where(eq(athleteProfiles.userId, userId));
    return existing[0].id;
  } else {
    const result = await db.insert(athleteProfiles).values({ userId, ...data });
    return Number(result[0].insertId);
  }
}

export async function getAthleteProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(athleteProfiles).where(eq(athleteProfiles.userId, userId)).limit(1);
  return rows[0] || null;
}

// ─── Saved Businesses ──────────────────────────────────────────

export async function saveBusiness(userId: number, businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(savedBusinesses).values({ userId, businessId });
    return { success: true };
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') return { success: true, alreadySaved: true };
    throw e;
  }
}

export async function unsaveBusiness(userId: number, businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(savedBusinesses).where(
    and(eq(savedBusinesses.userId, userId), eq(savedBusinesses.businessId, businessId))
  );
  return { success: true };
}

export async function getSavedBusinesses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    savedBusiness: savedBusinesses,
    business: businesses,
    sportCategory: sportCategories,
    businessType: businessTypes,
  })
    .from(savedBusinesses)
    .innerJoin(businesses, eq(savedBusinesses.businessId, businesses.id))
    .leftJoin(sportCategories, eq(businesses.sportCategoryId, sportCategories.id))
    .leftJoin(businessTypes, eq(businesses.businessTypeId, businessTypes.id))
    .where(eq(savedBusinesses.userId, userId))
    .orderBy(desc(savedBusinesses.createdAt));
}

export async function isBusinessSaved(userId: number, businessId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: savedBusinesses.id })
    .from(savedBusinesses)
    .where(and(eq(savedBusinesses.userId, userId), eq(savedBusinesses.businessId, businessId)))
    .limit(1);
  return rows.length > 0;
}

export async function getSavedBusinessIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ businessId: savedBusinesses.businessId })
    .from(savedBusinesses)
    .where(eq(savedBusinesses.userId, userId));
  return rows.map(r => r.businessId);
}

// ─── Leaderboard Queries ─────────────────────────────────────

export async function getLeaderboard(opts: { limit?: number; timeframe?: 'all' | 'month' | 'year' } = {}) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts.limit || 20;
  
  let timeFilter = '';
  if (opts.timeframe === 'month') {
    timeFilter = `AND r.createdAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
  } else if (opts.timeframe === 'year') {
    timeFilter = `AND r.createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
  }

  // Top businesses by referrals sent that were honored
  const [sentRows] = await db.execute(sql.raw(`
    SELECT 
      b.id, b.name, b.slug, b.logoUrl, b.city, b.region,
      bt.name as businessTypeName,
      COUNT(r.id) as totalSent,
      SUM(CASE WHEN r.receiverHonored = 1 THEN 1 ELSE 0 END) as honored,
      SUM(CASE WHEN r.senderCashedOut = 1 THEN 1 ELSE 0 END) as cashedOut,
      COALESCE(SUM(CASE WHEN r.senderCashedOut = 1 THEN CAST(r.incentiveAmount AS DECIMAL(10,2)) ELSE 0 END), 0) as totalEarned
    FROM businesses b
    LEFT JOIN referrals r ON r.referringBusinessId = b.id ${timeFilter}
    LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
    WHERE b.isActive = 1
    GROUP BY b.id, b.name, b.slug, b.logoUrl, b.city, b.region, bt.name
    HAVING totalSent > 0
    ORDER BY totalSent DESC, totalEarned DESC
    LIMIT ${limit}
  `));

  // Top businesses by referrals received that they honored
  const [receivedRows] = await db.execute(sql.raw(`
    SELECT 
      b.id, b.name, b.slug, b.logoUrl, b.city, b.region,
      bt.name as businessTypeName,
      COUNT(r.id) as totalReceived,
      SUM(CASE WHEN r.receiverHonored = 1 THEN 1 ELSE 0 END) as honored,
      COALESCE(SUM(CASE WHEN r.receiverHonored = 1 THEN CAST(r.incentiveAmount AS DECIMAL(10,2)) ELSE 0 END), 0) as totalPaidOut
    FROM businesses b
    LEFT JOIN referrals r ON r.receivingBusinessId = b.id ${timeFilter}
    LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
    WHERE b.isActive = 1
    GROUP BY b.id, b.name, b.slug, b.logoUrl, b.city, b.region, bt.name
    HAVING totalReceived > 0
    ORDER BY honored DESC, totalReceived DESC
    LIMIT ${limit}
  `));

  // Top partnership connectors (most emails exchanged)
  const [connectorRows] = await db.execute(sql.raw(`
    SELECT 
      b.id, b.name, b.slug, b.logoUrl, b.city, b.region,
      bt.name as businessTypeName,
      (
        SELECT COUNT(*) FROM partnership_emails pe 
        WHERE pe.senderBusinessId = b.id OR pe.recipientBusinessId = b.id
      ) as totalEmails
    FROM businesses b
    LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
    WHERE b.isActive = 1
    HAVING totalEmails > 0
    ORDER BY totalEmails DESC
    LIMIT ${limit}
  `));

  return {
    topReferrers: sentRows as unknown as any[],
    topReceivers: receivedRows as unknown as any[],
    topConnectors: connectorRows as unknown as any[],
  };
}

export async function getLeaderboardSummary() {
  const db = await getDb();
  if (!db) return { totalReferrals: 0, totalHonored: 0, totalEarned: 0, totalBusinessesParticipating: 0 };

  const [rows] = await db.execute(sql.raw(`
    SELECT 
      COUNT(*) as totalReferrals,
      SUM(CASE WHEN receiverHonored = 1 THEN 1 ELSE 0 END) as totalHonored,
      COALESCE(SUM(CASE WHEN senderCashedOut = 1 THEN CAST(incentiveAmount AS DECIMAL(10,2)) ELSE 0 END), 0) as totalEarned,
      COUNT(DISTINCT referringBusinessId) + COUNT(DISTINCT receivingBusinessId) as totalBusinessesParticipating
    FROM referrals
  `));

  const row = (rows as unknown as any[])[0] || {};
  return {
    totalReferrals: Number(row.totalReferrals) || 0,
    totalHonored: Number(row.totalHonored) || 0,
    totalEarned: Number(row.totalEarned) || 0,
    totalBusinessesParticipating: Number(row.totalBusinessesParticipating) || 0,
  };
}

// ─── User Notifications ──────────────────────────────────────────

export async function getUsersWhoSavedBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    userId: savedBusinesses.userId,
    userEmail: users.email,
    userName: users.name,
  })
    .from(savedBusinesses)
    .innerJoin(users, eq(savedBusinesses.userId, users.id))
    .where(eq(savedBusinesses.businessId, businessId));
  return rows;
}

export async function getUsersWhoSavedBusinessWithOptIn(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    userId: savedBusinesses.userId,
    userEmail: users.email,
    userName: users.name,
    newsletterOptIn: athleteProfiles.newsletterOptIn,
  })
    .from(savedBusinesses)
    .innerJoin(users, eq(savedBusinesses.userId, users.id))
    .leftJoin(athleteProfiles, eq(savedBusinesses.userId, athleteProfiles.userId))
    .where(eq(savedBusinesses.businessId, businessId));
  return rows;
}

export async function createUserNotification(data: {
  userId: number;
  type: string;
  title: string;
  message?: string;
  businessId?: number;
  offerId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userNotifications).values(data);
  return result[0].insertId;
}

export async function createBulkUserNotifications(notifications: Array<{
  userId: number;
  type: string;
  title: string;
  message?: string;
  businessId?: number;
  offerId?: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (notifications.length === 0) return;
  await db.insert(userNotifications).values(notifications);
}

export async function getUserNotifications(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    notification: userNotifications,
    business: {
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      logoUrl: businesses.logoUrl,
    },
  })
    .from(userNotifications)
    .leftJoin(businesses, eq(userNotifications.businessId, businesses.id))
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`COUNT(*)` })
    .from(userNotifications)
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));
  return rows[0]?.count ?? 0;
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: true })
    .where(and(eq(userNotifications.id, notificationId), eq(userNotifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: true })
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));
}

/**
 * Notify all users who saved a business when a new offer is created.
 * Respects newsletterOptIn preference from athlete profiles.
 * Also sends a platform notification to the project owner.
 */
export async function notifyUsersOfNewOffer(businessId: number, businessName: string, offerTitle: string, offerId: number) {
  try {
    const savedUsers = await getUsersWhoSavedBusinessWithOptIn(businessId);
    if (savedUsers.length === 0) return { notified: 0 };

    // Filter to users who opted in (or have no profile yet — default to notify in-app)
    const notifications = savedUsers.map(u => ({
      userId: u.userId,
      type: 'new_offer' as const,
      title: `${businessName} just posted a new offer!`,
      message: `"${offerTitle}" — check it out before everyone else does.`,
      businessId,
      offerId,
    }));

    await createBulkUserNotifications(notifications);
    return { notified: notifications.length };
  } catch (error) {
    console.error("[Notification] Failed to notify saved-business users:", error);
    return { notified: 0 };
  }
}

// ─── Recommendation Engine ──────────────────────────────────────

/**
 * Maps athlete interest values to business type IDs for recommendation matching.
 * Interest values come from the onboarding form INTEREST_OPTIONS.
 */
const INTEREST_TO_BUSINESS_TYPE_IDS: Record<string, number[]> = {
  coaching: [1], // Coach
  bike_fit: [13], // Bike Fitting
  nutrition: [9, 16], // Nutritionist, Supplement Retailer
  physio: [7], // Physiotherapist
  massage: [8], // Sports Massage
  bike_shop: [2, 17], // Bike Shop, Bike Retailer
  run_store: [3], // Running Store
  ski_shop: [11], // Ski Shop
  club: [5, 6], // Running Club, Cycling Club
  studio: [4], // Cycling Studio
  travel: [15, 90001], // Vacation Provider, Training Camp
};

export async function getRecommendedBusinesses(userId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];

  // Get the athlete's profile
  const profile = await getAthleteProfile(userId);
  if (!profile) {
    // No profile — return popular businesses instead
    const rows = await db.execute(sql.raw(`
      SELECT b.id, b.name, b.slug, b.city, b.region, b.hub, b.logoUrl, b.description,
             b.googleRating, b.googleReviewCount, b.approvalStatus, b.claimedByUserId,
             bt.name as businessTypeName, bt.id as businessTypeId,
             'popular' as matchReason, 50 as matchScore
      FROM businesses b
      LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
      WHERE b.isActive = 1 AND b.isAdminHidden = 0 AND b.approvalStatus = 'approved'
      ORDER BY b.googleReviewCount DESC, b.googleRating DESC
      LIMIT ${limit}
    `));
    return (rows as unknown as any[])[0] || [];
  }

  // Parse profile data
  const sportIds: number[] = profile.sportIds ? JSON.parse(profile.sportIds) : [];
  const interests: string[] = profile.interests ? JSON.parse(profile.interests) : [];
  const city = profile.city || '';
  const region = profile.region || '';
  const hub = profile.hub || '';

  // Map interests to business type IDs
  const targetTypeIds: number[] = [];
  for (const interest of interests) {
    const typeIds = INTEREST_TO_BUSINESS_TYPE_IDS[interest];
    if (typeIds) targetTypeIds.push(...typeIds);
  }

  // Get saved business IDs to exclude
  const savedIds = await getSavedBusinessIds(userId);
  const excludeClause = savedIds.length > 0 ? `AND b.id NOT IN (${savedIds.join(',')})` : '';

  // Build scoring query
  // Score: +30 for matching sport, +25 for matching interest/business type, +20 for same city, +15 for same hub, +10 for same region
  const sportIdsStr = sportIds.length > 0 ? sportIds.join(',') : '0';
  const typeIdsStr = targetTypeIds.length > 0 ? targetTypeIds.join(',') : '0';
  const cityEscaped = city.replace(/'/g, "''");
  const regionEscaped = region.replace(/'/g, "''");
  const hubEscaped = hub.replace(/'/g, "''");

  const [rows] = await db.execute(sql.raw(`
    SELECT 
      b.id, b.name, b.slug, b.city, b.region, b.hub, b.logoUrl, b.description,
      b.googleRating, b.googleReviewCount, b.approvalStatus, b.claimedByUserId,
      bt.name as businessTypeName, bt.id as businessTypeId,
      (
        CASE WHEN EXISTS (
          SELECT 1 FROM business_sport_categories bsc 
          WHERE bsc.businessId = b.id AND bsc.sportCategoryId IN (${sportIdsStr})
        ) THEN 30 ELSE 0 END
        +
        CASE WHEN b.businessTypeId IN (${typeIdsStr}) THEN 25 ELSE 0 END
        +
        CASE WHEN LOWER(b.city) = LOWER('${cityEscaped}') AND '${cityEscaped}' != '' THEN 20 ELSE 0 END
        +
        CASE WHEN LOWER(b.hub) = LOWER('${hubEscaped}') AND '${hubEscaped}' != '' THEN 15 ELSE 0 END
        +
        CASE WHEN LOWER(b.region) = LOWER('${regionEscaped}') AND '${regionEscaped}' != '' THEN 10 ELSE 0 END
      ) as matchScore,
      CASE 
        WHEN LOWER(b.city) = LOWER('${cityEscaped}') AND '${cityEscaped}' != '' THEN 'near_you'
        WHEN EXISTS (
          SELECT 1 FROM business_sport_categories bsc 
          WHERE bsc.businessId = b.id AND bsc.sportCategoryId IN (${sportIdsStr})
        ) THEN 'your_sport'
        WHEN b.businessTypeId IN (${typeIdsStr}) THEN 'your_interest'
        ELSE 'popular'
      END as matchReason
    FROM businesses b
    LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
    WHERE b.isActive = 1 AND b.isAdminHidden = 0 AND b.approvalStatus = 'approved'
    ${excludeClause}
    HAVING matchScore > 0
    ORDER BY matchScore DESC, b.googleReviewCount DESC
    LIMIT ${limit}
  `));

  const results = (rows as unknown as any[]) || [];
  
  // If not enough results, backfill with popular businesses
  if (results.length < limit) {
    const existingIds = results.map((r: any) => r.id);
    const allExclude = [...savedIds, ...existingIds];
    const excludeBackfill = allExclude.length > 0 ? `AND b.id NOT IN (${allExclude.join(',')})` : '';
    
    const [backfill] = await db.execute(sql.raw(`
      SELECT b.id, b.name, b.slug, b.city, b.region, b.hub, b.logoUrl, b.description,
             b.googleRating, b.googleReviewCount, b.approvalStatus, b.claimedByUserId,
             bt.name as businessTypeName, bt.id as businessTypeId,
             'popular' as matchReason, 5 as matchScore
      FROM businesses b
      LEFT JOIN businessTypes bt ON b.businessTypeId = bt.id
      WHERE b.isActive = 1 AND b.isAdminHidden = 0 AND b.approvalStatus = 'approved'
      ${excludeBackfill}
      ORDER BY b.googleReviewCount DESC, b.googleRating DESC
      LIMIT ${limit - results.length}
    `));
    
    results.push(...((backfill as unknown as any[]) || []));
  }

  return results;
}
