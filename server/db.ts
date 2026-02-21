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
  businessSubmissions, InsertBusinessSubmission, BusinessSubmission,
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
