import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllSportCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Cycling", slug: "cycling", description: "Cycling sports", icon: "bike" },
    { id: 2, name: "Running", slug: "running", description: "All running disciplines", icon: "mountain" },
    { id: 3, name: "Snowsports", slug: "snowsports", description: "Snow sports", icon: "snowflake" },
    { id: 4, name: "Sport Vacations", slug: "sport-vacations", description: "Endurance sport vacations", icon: "compass" },
  ]),
  getAllBusinessTypes: vi.fn().mockResolvedValue([
    { id: 1, name: "Coach", slug: "coach", description: "Coaching services" },
    { id: 2, name: "Bike Shop", slug: "bike-shop", description: "Bicycle retail" },
    { id: 15, name: "Vacation Provider", slug: "vacation-provider", description: "Sport vacation packages" },
  ]),
  getDistinctRegions: vi.fn().mockResolvedValue(["Alps", "Dolomites", "Mallorca", "Pyrenees", "Western Canada", "Western US"]),
  getHubsByRegion: vi.fn().mockImplementation(async (region?: string) => {
    const allHubs = [
      { hub: "Chamonix", region: "Alps" },
      { hub: "Cortina d'Ampezzo", region: "Dolomites" },
      { hub: "Whistler", region: "Western Canada" },
      { hub: "Boulder", region: "Western US" },
    ];
    if (region) return allHubs.filter(h => h.region === region);
    return allHubs;
  }),
  searchBusinesses: vi.fn().mockResolvedValue({
    businesses: [
      {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, isActive: true, sportCategoryId: 1, businessTypeId: 1, region: "Western US", hub: "Boulder" },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      },
    ],
    total: 1,
  }),
  getBusinessBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "test-cycling") {
      return {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, claimedByUserId: 1, isActive: true, sportCategoryId: 1, businessTypeId: 1, region: "Western US", hub: "Boulder" },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      };
    }
    return null;
  }),
  getBusinessById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        business: { id: 1, name: "Test Cycling", slug: "test-cycling", isClaimed: true, claimedByUserId: 1, isActive: true, sportCategoryId: 1, businessTypeId: 1, region: "Western US", hub: "Boulder" },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      };
    }
    if (id === 2) {
      return {
        business: { id: 2, name: "Unclaimed Biz", slug: "unclaimed-biz", isClaimed: false, claimedByUserId: null, isActive: true, sportCategoryId: 1, businessTypeId: 1, region: "Dolomites", hub: "Cortina d'Ampezzo" },
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
    totalBusinesses: 51, claimedBusinesses: 12, totalReferrals: 20, sportCategories: 4, regions: 6,
  }),
  getReferralOffersByBusiness: vi.fn().mockImplementation(async (businessId: number, offerType?: string) => {
    const offers = [
      { id: 1, businessId: 1, title: "10% Commission", offerType: "b2b", incentiveType: "percentage", incentiveValue: "10", isActive: true },
      { id: 2, businessId: 1, title: "15% Off First Session", offerType: "consumer", incentiveType: "percentage", incentiveValue: "15", isActive: true },
    ];
    if (offerType) return offers.filter(o => o.offerType === offerType);
    return offers;
  }),
  createReferralOffer: vi.fn().mockResolvedValue(1),
  updateReferralOffer: vi.fn().mockResolvedValue(undefined),
  deleteReferralOffer: vi.fn().mockResolvedValue(undefined),
  getReferralOfferById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, businessId: 1, title: "10% Commission", offerType: "b2b", incentiveType: "percentage", incentiveValue: "10", isActive: true };
    if (id === 2) return { id: 2, businessId: 1, title: "15% Off First Session", offerType: "consumer", incentiveType: "percentage", incentiveValue: "15", isActive: true };
    return null;
  }),
  getAllActiveReferralOffers: vi.fn().mockImplementation(async (offerType?: string) => {
    const offers = [
      { offer: { id: 1, title: "10% Commission", offerType: "b2b", incentiveType: "percentage" }, business: { id: 1, name: "Test Cycling" }, sportCategory: { id: 1, name: "Cycling" } },
      { offer: { id: 2, title: "15% Off", offerType: "consumer", incentiveType: "percentage" }, business: { id: 1, name: "Test Cycling" }, sportCategory: { id: 1, name: "Cycling" } },
    ];
    if (offerType) return offers.filter(o => o.offer.offerType === offerType);
    return offers;
  }),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferralStatus: vi.fn().mockResolvedValue(undefined),
  getReferralsSent: vi.fn().mockResolvedValue([]),
  getReferralsReceived: vi.fn().mockResolvedValue([]),
  getReferralStats: vi.fn().mockResolvedValue({ sent: 5, received: 3, converted: 2, pending: 1 }),
  createBusinessSubmission: vi.fn().mockResolvedValue(1),
  getBusinessSubmissions: vi.fn().mockImplementation(async (status?: string) => {
    const subs = [
      {
        submission: { id: 1, businessName: "Test Submission", sportCategoryId: 1, businessTypeId: 1, contactName: "Jane", contactEmail: "jane@test.com", status: "pending", region: "Alps", hub: "Chamonix" },
        sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
        businessType: { id: 1, name: "Coach", slug: "coach" },
      },
      {
        submission: { id: 2, businessName: "Approved Biz", sportCategoryId: 2, businessTypeId: 2, contactName: "Bob", contactEmail: "bob@test.com", status: "approved", region: "Western US", hub: "Boulder" },
        sportCategory: { id: 2, name: "Running", slug: "running" },
        businessType: { id: 2, name: "Bike Shop", slug: "bike-shop" },
      },
    ];
    if (status) return subs.filter(s => s.submission.status === status);
    return subs;
  }),
  updateBusinessSubmissionStatus: vi.fn().mockResolvedValue(undefined),
  getBusinessSubmissionById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      submission: { id: 1, businessName: "Test Submission", businessDescription: "A test business", sportCategoryId: 1, businessTypeId: 1, contactName: "Jane", contactEmail: "jane@test.com", contactPhone: "555-1234", website: "https://test.com", instagram: null, facebook: null, city: "Chamonix", state: null, country: "France", region: "Alps", hub: "Chamonix", status: "pending" },
      sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
      businessType: { id: 1, name: "Coach", slug: "coach" },
    };
    return null;
  }),
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

// ─── Categories & Regions ──────────────────────────────────────

describe("categories", () => {
  it("returns sport categories including sport vacations and running", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.sportCategories();
    expect(result).toHaveLength(4);
    expect(result.map(c => c.slug)).toContain("running");
    expect(result.map(c => c.slug)).toContain("sport-vacations");
  });

  it("returns business types including vacation provider", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.businessTypes();
    expect(result).toHaveLength(3);
    expect(result.map(t => t.slug)).toContain("vacation-provider");
  });

  it("returns distinct regions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.regions();
    expect(result).toContain("Dolomites");
    expect(result).toContain("Western Canada");
    expect(result).toContain("Alps");
    expect(result.length).toBeGreaterThanOrEqual(6);
  });

  it("returns hubs filtered by region", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.hubs({ region: "Alps" });
    expect(result).toHaveLength(1);
    expect(result[0].hub).toBe("Chamonix");
  });

  it("returns all hubs when no region specified", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.hubs();
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── Business Directory ──────────────────────────────────────

describe("business.search", () => {
  it("searches businesses publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({});
    expect(result.businesses).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("accepts region and hub filter parameters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({
      region: "Western US",
      hub: "Boulder",
      sportCategoryId: 1,
      limit: 10,
      offset: 0,
    });
    expect(result).toBeDefined();
  });
});

describe("business.getBySlug", () => {
  it("returns a business by slug with region/hub data", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.getBySlug({ slug: "test-cycling" });
    expect(result.business.name).toBe("Test Cycling");
    expect(result.business.region).toBe("Western US");
    expect(result.business.hub).toBe("Boulder");
  });

  it("throws NOT_FOUND for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.business.getBySlug({ slug: "nonexistent" })).rejects.toThrow();
  });
});

// ─── Business Claiming ──────────────────────────────────────

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

// ─── Business CRUD ──────────────────────────────────────

describe("business.create", () => {
  it("creates a new business with region and hub", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.business.create({
      name: "New Business",
      sportCategoryId: 1,
      businessTypeId: 1,
      city: "Denver",
      country: "USA",
      region: "Western US",
      hub: "Denver",
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
  it("allows owner to update their business including region/hub", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.business.update({ id: 1, name: "Updated Name", region: "Alps", hub: "Chamonix" });
    expect(result.success).toBe(true);
  });

  it("rejects non-owner update", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(caller.business.update({ id: 1, name: "Hacked" })).rejects.toThrow();
  });
});

// ─── Referral Offers with Dual Types ──────────────────────────

describe("referralOffer", () => {
  it("lists all offers for a business publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.referralOffer.getByBusiness({ businessId: 1 });
    expect(result).toHaveLength(2);
  });

  it("filters offers by B2B type", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.referralOffer.getByBusiness({ businessId: 1, offerType: "b2b" });
    expect(result).toHaveLength(1);
    expect(result[0].offerType).toBe("b2b");
  });

  it("filters offers by consumer type", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.referralOffer.getByBusiness({ businessId: 1, offerType: "consumer" });
    expect(result).toHaveLength(1);
    expect(result[0].offerType).toBe("consumer");
  });

  it("creates a B2B offer for owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referralOffer.create({
      businessId: 1,
      title: "New B2B Offer",
      offerType: "b2b",
      incentiveType: "percentage",
      incentiveValue: "15",
    });
    expect(result.id).toBe(1);
  });

  it("creates a consumer offer for owned business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referralOffer.create({
      businessId: 1,
      title: "20% Off First Visit",
      offerType: "consumer",
      incentiveType: "percentage",
      incentiveValue: "20",
    });
    expect(result.id).toBe(1);
  });

  it("defaults offerType to b2b when not specified", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.referralOffer.create({
      businessId: 1,
      title: "Default Type Offer",
      incentiveType: "fixed",
      incentiveValue: "25",
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

  it("lists all active offers with type filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const all = await caller.referralOffer.allActive({});
    expect(all).toHaveLength(2);

    const b2bOnly = await caller.referralOffer.allActive({ offerType: "b2b" });
    expect(b2bOnly).toHaveLength(1);
    expect(b2bOnly[0].offer.offerType).toBe("b2b");

    const consumerOnly = await caller.referralOffer.allActive({ offerType: "consumer" });
    expect(consumerOnly).toHaveLength(1);
    expect(consumerOnly[0].offer.offerType).toBe("consumer");
  });
});

// ─── Referral Tracking ──────────────────────────────────────

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

// ─── Business Submissions ──────────────────────────────────

describe("submission", () => {
  it("submits a new business publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.submission.submit({
      businessName: "My New Shop",
      sportCategoryId: 1,
      businessTypeId: 2,
      contactName: "Alice",
      contactEmail: "alice@shop.com",
      city: "Whistler",
      country: "Canada",
      region: "Western Canada",
      hub: "Whistler",
    });
    expect(result.id).toBe(1);
  });

  it("submits a business with authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.submission.submit({
      businessName: "Pro Coaching",
      sportCategoryId: 2,
      businessTypeId: 1,
      contactName: "Bob",
      contactEmail: "bob@coaching.com",
    });
    expect(result.id).toBe(1);
  });

  it("admin can list all submissions", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.list();
    expect(result).toHaveLength(2);
  });

  it("admin can filter submissions by status", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.list({ status: "pending" });
    expect(result).toHaveLength(1);
    expect(result[0].submission.status).toBe("pending");
  });

  it("non-admin cannot list submissions", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "user"));
    await expect(caller.submission.list()).rejects.toThrow("Admin access required");
  });

  it("admin can approve a submission", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.review({ id: 1, status: "approved" });
    expect(result.success).toBe(true);
  });

  it("admin can reject a submission with notes", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.review({ id: 1, status: "rejected", reviewNotes: "Duplicate listing" });
    expect(result.success).toBe(true);
  });

  it("non-admin cannot review submissions", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "user"));
    await expect(caller.submission.review({ id: 1, status: "approved" })).rejects.toThrow("Admin access required");
  });

  it("throws NOT_FOUND for non-existent submission", async () => {
    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    await expect(caller.submission.review({ id: 999, status: "approved" })).rejects.toThrow();
  });
});

// ─── Directory Stats ──────────────────────────────────────

describe("stats.directory", () => {
  it("returns directory stats with region count", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const stats = await caller.stats.directory();
    expect(stats.totalBusinesses).toBe(51);
    expect(stats.claimedBusinesses).toBe(12);
    expect(stats.sportCategories).toBe(4);
    expect(stats.regions).toBe(6);
  });
});
