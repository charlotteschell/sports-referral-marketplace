import { eq, and, like, or, sql, desc, asc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  businesses, InsertBusiness, Business,
  sportCategories, SportCategory,
  businessTypes, BusinessType,
  referralOffers, InsertReferralOffer, ReferralOffer,
  referrals, InsertReferral, Referral,
  businessSportCategories,
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

// ─── Businesses ─────────────────────────────────────────────────

export interface BusinessSearchParams {
  search?: string;
  sportCategoryId?: number;
  businessTypeId?: number;
  city?: string;
  country?: string;
  isClaimed?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchBusinesses(params: BusinessSearchParams) {
  const db = await getDb();
  if (!db) return { businesses: [], total: 0 };

  const conditions = [eq(businesses.isActive, true)];

  if (params.search) {
    conditions.push(
      or(
        like(businesses.name, `%${params.search}%`),
        like(businesses.city, `%${params.search}%`),
        like(businesses.shortDescription, `%${params.search}%`)
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
    conditions.push(like(businesses.city, `%${params.city}%`));
  }
  if (params.country) {
    conditions.push(like(businesses.country, `%${params.country}%`));
  }
  if (params.isClaimed !== undefined) {
    conditions.push(eq(businesses.isClaimed, params.isClaimed));
  }

  const whereClause = and(...conditions);
  const limit = params.limit || 20;
  const offset = params.offset || 0;

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
      .orderBy(desc(businesses.isFeatured), desc(businesses.isClaimed), asc(businesses.name))
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
    .where(and(eq(businesses.isActive, true), eq(businesses.isFeatured, true)))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
}

// ─── Referral Offers ────────────────────────────────────────────

export async function getReferralOffersByBusiness(businessId: number) {
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

export async function getAllActiveReferralOffers(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    offer: referralOffers,
    business: businesses,
  })
    .from(referralOffers)
    .leftJoin(businesses, eq(referralOffers.businessId, businesses.id))
    .where(and(eq(referralOffers.isActive, true), eq(businesses.isClaimed, true)))
    .orderBy(desc(referralOffers.createdAt))
    .limit(limit)
    .offset(offset);
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

export async function getDirectoryStats() {
  const db = await getDb();
  if (!db) return { totalBusinesses: 0, claimedBusinesses: 0, totalReferrals: 0, sportCategories: 0 };

  const [totalBiz, claimedBiz, totalRef, totalCats] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(businesses).where(eq(businesses.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(businesses).where(and(eq(businesses.isActive, true), eq(businesses.isClaimed, true))),
    db.select({ count: sql<number>`count(*)` }).from(referrals),
    db.select({ count: sql<number>`count(*)` }).from(sportCategories),
  ]);

  return {
    totalBusinesses: Number(totalBiz[0]?.count || 0),
    claimedBusinesses: Number(claimedBiz[0]?.count || 0),
    totalReferrals: Number(totalRef[0]?.count || 0),
    sportCategories: Number(totalCats[0]?.count || 0),
  };
}
