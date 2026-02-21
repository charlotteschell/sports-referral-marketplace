import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllSportCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Cycling", slug: "cycling", description: "Cycling sports", icon: "bike" },
    { id: 2, name: "Trail Running", slug: "trail-running", description: "Trail running", icon: "mountain" },
    { id: 3, name: "Snowsports", slug: "snowsports", description: "Snow sports", icon: "snowflake" },
  ]),
  getAllBusinessTypes: vi.fn().mockResolvedValue([
    { id: 1, name: "Coach", slug: "coach", description: "Coaching services" },
    { id: 2, name: "Bike Shop", slug: "bike-shop", description: "Bicycle retail" },
  ]),
  searchBusinesses: vi.fn().mockResolvedValue({
    businesses: [
      {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, isActive: true, sportCategoryId: 1, businessTypeId: 1 },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      },
    ],
    total: 1,
  }),
  getBusinessBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "test-cycling") {
      return {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, claimedByUserId: 1, isActive: true, sportCategoryId: 1, businessTypeId: 1 },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      };
    }
    return null;
  }),
  getBusinessById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, claimedByUserId: 1, isActive: true, sportCategoryId: 1, businessTypeId: 1 },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      };
    }
    if (id === 2) {
      return {
        business: { id: 2, name: "Unclaimed Biz", slug: "unclaimed-biz", isClaimed: false, claimedByUserId: null, isActive: true, sportCategoryId: 1, businessTypeId: 1 },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      };
    }
    return null;
  }),
  getBusinessesByOwner: vi.fn().mockResolvedValue([]),
  createBusiness: vi.fn().mockResolvedValue(99),
  updateBusiness: vi.fn().mockResolvedValue(undefined),
  claimBusiness: vi.fn().mockResolvedValue(undefined),
  getFeaturedBusinesses: vi.fn().mockResolvedValue([]),
  getDirectoryStats: vi.fn().mockResolvedValue({
    totalBusinesses: 10, claimedBusinesses: 5, totalReferrals: 20, sportCategories: 3,
  }),
  getReferralOffersByBusiness: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, title: "10% Commission", incentiveType: "percentage", incentiveValue: "10", isActive: true },
  ]),
  createReferralOffer: vi.fn().mockResolvedValue(1),
  updateReferralOffer: vi.fn().mockResolvedValue(undefined),
  deleteReferralOffer: vi.fn().mockResolvedValue(undefined),
  getReferralOfferById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, businessId: 1, title: "10% Commission", incentiveType: "percentage", incentiveValue: "10", isActive: true };
    return null;
  }),
  getAllActiveReferralOffers: vi.fn().mockResolvedValue([]),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferralStatus: vi.fn().mockResolvedValue(undefined),
  getReferralsSent: vi.fn().mockResolvedValue([]),
  getReferralsReceived: vi.fn().mockResolvedValue([]),
  getReferralStats: vi.fn().mockResolvedValue({ sent: 5, received: 3, converted: 2, pending: 1 }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@test.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("categories", () => {
  it("returns sport categories as a public procedure", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.sportCategories();
    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe("cycling");
  });

  it("returns business types as a public procedure", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.businessTypes();
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("coach");
  });
});

describe("business.search", () => {
  it("searches businesses publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({});
    expect(result.businesses).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("accepts filter parameters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({
      search: "cycling",
      sportCategoryId: 1,
      businessTypeId: 1,
      limit: 10,
      offset: 0,
    });
    expect(result).toBeDefined();
  });
});

describe("business.getBySlug", () => {
  it("returns a business by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.getBySlug({ slug: "test-cycling" });
    expect(result.business.name).toBe("Test Cycling");
  });

  it("throws NOT_FOUND for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.business.getBySlug({ slug: "nonexistent" })).rejects.toThrow();
  });
});

describe("business.claim", () => {
  it("allows authenticated user to claim an unclaimed business", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.business.claim({ businessId: 2 });
    expect(result.success).toBe(true);
  });

  it("rejects claiming an already claimed business", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.business.claim({ businessId: 1 })).rejects.toThrow("Business already claimed");
  });

  it("rejects unauthenticated claim attempts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.business.claim({ businessId: 2 })).rejects.toThrow();
  });
});

describe("business.create", () => {
  it("creates a new business for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.business.create({
      name: "New Business",
      sportCategoryId: 1,
      businessTypeId: 1,
      city: "Denver",
      country: "USA",
    });
    expect(result.id).toBe(99);
    expect(result.slug).toContain("new-business");
  });

  it("rejects unauthenticated creation", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.business.create({ name: "Test", sportCategoryId: 1, businessTypeId: 1 })
    ).rejects.toThrow();
  });
});

describe("business.update", () => {
  it("allows owner to update their business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.business.update({ id: 1, name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("rejects non-owner update", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(caller.business.update({ id: 1, name: "Hacked" })).rejects.toThrow();
  });
});

describe("referralOffer", () => {
  it("lists offers for a business publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.referralOffer.getByBusiness({ businessId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("10% Commission");
  });

  it("creates an offer for owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referralOffer.create({
      businessId: 1,
      title: "New Offer",
      incentiveType: "percentage",
      incentiveValue: "15",
    });
    expect(result.id).toBe(1);
  });

  it("rejects creating offer for non-owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(
      caller.referralOffer.create({ businessId: 1, title: "Hack", incentiveType: "percentage" })
    ).rejects.toThrow();
  });

  it("deletes an offer for owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referralOffer.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("referral tracking", () => {
  it("sends a referral from owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referral.send({
      referringBusinessId: 1,
      receivingBusinessId: 2,
      customerName: "John Doe",
    });
    expect(result.id).toBe(1);
  });

  it("rejects sending referral from non-owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(
      caller.referral.send({ referringBusinessId: 1, receivingBusinessId: 2 })
    ).rejects.toThrow();
  });

  it("returns referral stats for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const stats = await caller.referral.stats();
    expect(stats.sent).toBe(5);
    expect(stats.received).toBe(3);
    expect(stats.converted).toBe(2);
    expect(stats.pending).toBe(1);
  });

  it("updates referral status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.referral.updateStatus({ id: 1, status: "converted" });
    expect(result.success).toBe(true);
  });
});

describe("stats.directory", () => {
  it("returns directory stats publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const stats = await caller.stats.directory();
    expect(stats.totalBusinesses).toBe(10);
    expect(stats.claimedBusinesses).toBe(5);
  });
});
