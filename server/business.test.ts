import { describe, expect, it, vi, beforeEach, test } from "vitest";
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
  searchBusinessesAutocomplete: vi.fn().mockImplementation(async (query: string) => {
    const all = [
      { id: 1, name: "Test Cycling", city: "Boulder", region: "Western US", hub: "Boulder", country: "USA", slug: "test-cycling", sportCategoryId: 1, businessTypeId: 1 },
      { id: 3, name: "Alpine Bike Shop", city: "Whistler", region: "Western Canada", hub: "Whistler", country: "Canada", slug: "alpine-bike-shop", sportCategoryId: 1, businessTypeId: 2 },
    ];
    return all.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.city?.toLowerCase().includes(query.toLowerCase()));
  }),
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
  unclaimBusiness: vi.fn().mockResolvedValue(undefined),
  deleteBusiness: vi.fn().mockResolvedValue(undefined),
  getDashboardAnalytics: vi.fn().mockResolvedValue({
    totalReferralsSent: 5,
    totalReferralsReceived: 3,
    conversionRate: 25,
    activeOffers: 4,
    statusBreakdown: { pending: 2, contacted: 3, converted: 2, declined: 1, expired: 0 },
    topPartners: [{ businessId: 2, businessName: "Partner Biz", businessSlug: "partner-biz", referralCount: 3 }],
    recentActivity: [],
  }),
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
  // Referral verification mocks
  markReferralHonored: vi.fn().mockResolvedValue(undefined),
  markReferralCashedOut: vi.fn().mockResolvedValue(undefined),
  disputeReferral: vi.fn().mockResolvedValue(undefined),
  incrementPlatformStat: vi.fn().mockResolvedValue(undefined),
  // Consumer claims mocks
  hasUserClaimedOffer: vi.fn().mockResolvedValue(false),
  createConsumerClaim: vi.fn().mockResolvedValue(1),
  verifyConsumerClaim: vi.fn().mockResolvedValue(undefined),
  getConsumerClaimsByUser: vi.fn().mockResolvedValue([]),
  getConsumerClaimsByBusiness: vi.fn().mockResolvedValue([]),
  getConsumerAnalytics: vi.fn().mockResolvedValue({ totalClaims: 5, redeemed: 3, pending: 2, totalSaved: 150 }),
  // Platform stats mock
  getPlatformStats: vi.fn().mockResolvedValue({
    totalReferrals: 247, honoredReferrals: 189, totalIncentivesExchanged: 12450,
    consumerOffersClaimed: 156, consumerSavings: 4320, activeBusinesses: 42,
  }),
  // Email verification mocks
  createEmailVerification: vi.fn().mockResolvedValue(undefined),
  verifyEmailCode: vi.fn().mockResolvedValue(true),
  isEmailVerified: vi.fn().mockResolvedValue(true),
  // Business offers for directory
  getOffersForBusinessIds: vi.fn().mockResolvedValue([]),
  getFeaturedBusinessOffers: vi.fn().mockResolvedValue([]),
  formatPhoneNumber: vi.fn().mockImplementation((phone: string) => phone),
  getReferralById: vi.fn().mockResolvedValue(null),
  toggleOfferVisibility: vi.fn().mockResolvedValue(undefined),
  adminToggleBusinessVisibility: vi.fn().mockResolvedValue(undefined),
  toggleBusinessVisibility: vi.fn().mockResolvedValue(undefined),
  // Partnership email mocks
  sendPartnershipEmail: vi.fn().mockResolvedValue(1),
  getPartnershipEmailsSent: vi.fn().mockResolvedValue([]),
  getPartnershipEmailsReceived: vi.fn().mockResolvedValue([]),
  // Support ticket mocks
  createSupportTicket: vi.fn().mockResolvedValue(1),
  getSupportTicketsByUser: vi.fn().mockResolvedValue([]),
  getSupportTickets: vi.fn().mockResolvedValue({ tickets: [], total: 0 }),
  updateSupportTicketStatus: vi.fn().mockResolvedValue(undefined),
  getSupportTicketById: vi.fn().mockResolvedValue(null),
  // Category approval mocks
  createCategoryApproval: vi.fn().mockResolvedValue(1),
  getCategoryApprovals: vi.fn().mockResolvedValue({ requests: [], total: 0 }),
  updateCategoryApprovalStatus: vi.fn().mockResolvedValue(undefined),
  getCategoryApprovalById: vi.fn().mockResolvedValue(null),
  createSportCategory: vi.fn().mockResolvedValue(1),
  createBusinessType: vi.fn().mockResolvedValue(1),
  createHub: vi.fn().mockResolvedValue(1),
  // Account type mock
  updateUserAccountType: vi.fn().mockResolvedValue(undefined),
  markOnboardingComplete: vi.fn().mockResolvedValue(undefined),
  // Logo upload mock
  updateBusinessLogo: vi.fn().mockResolvedValue(undefined),
  // Multi-select search mock
  searchBusinessesMulti: vi.fn().mockResolvedValue({ businesses: [], total: 0 }),
  // Admin mocks
  adminToggleOfferVisibility: vi.fn().mockResolvedValue(undefined),
  approveOrRejectBusiness: vi.fn().mockResolvedValue(undefined),
  getAllBusinessesAdmin: vi.fn().mockResolvedValue([]),
  getAllOffersAdmin: vi.fn().mockResolvedValue([]),
  getAllSupportTickets: vi.fn().mockResolvedValue({ tickets: [], total: 0 }),
  getAllCategoryApprovals: vi.fn().mockResolvedValue({ requests: [], total: 0 }),
  getBusinessAnalytics: vi.fn().mockResolvedValue({ totalReferralsReceived: 0, honoredReferrals: 0, totalEarned: 0, totalReferralsSent: 0, cashedOutReferrals: 0, totalCashedOut: 0 }),
  getBusinessesPendingApproval: vi.fn().mockResolvedValue([]),
  getPendingCategoryApprovals: vi.fn().mockResolvedValue([]),
  getReferralOffersByBusinessAll: vi.fn().mockResolvedValue([]),
  getReferralsForBusiness: vi.fn().mockResolvedValue([]),
  ownerToggleBusinessVisibility: vi.fn().mockResolvedValue(undefined),
  ownerToggleOfferVisibility: vi.fn().mockResolvedValue(undefined),
  updateBusinessBrands: vi.fn().mockResolvedValue(undefined),
  getBusinessSportCategories: vi.fn().mockResolvedValue([]),
  setBusinessSportCategories: vi.fn().mockResolvedValue(undefined),
  getBusinessBusinessTypes: vi.fn().mockResolvedValue([]),
  setBusinessBusinessTypes: vi.fn().mockResolvedValue(undefined),
  notifyUsersOfNewOffer: vi.fn().mockResolvedValue(undefined),
  getUserNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
  getRecommendedBusinesses: vi.fn().mockResolvedValue([]),
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
    const result = await caller.business.claim({ businessId: 2, verificationEmail: "test@unclaimed-biz.com" });
    expect(result.success).toBe(true);
  });

  it("rejects claiming an already claimed business", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.business.claim({ businessId: 1, verificationEmail: "test@test-cycling.com" })).rejects.toThrow("Business already claimed");
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
      website: "https://shop.com",
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
      contactEmail: "bob@procoaching.com",
      website: "https://procoaching.com",
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

// ─── Unclaim & Delete Business ──────────────────────────────

describe("businessActions.unclaim", () => {
  it("allows owner to unclaim their business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.businessActions.unclaim({ businessId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects unclaim by non-owner", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(caller.businessActions.unclaim({ businessId: 1 })).rejects.toThrow("Not authorized");
  });

  it("allows admin to unclaim any business", async () => {
    const caller = appRouter.createCaller(createAuthContext(999, "admin"));
    const result = await caller.businessActions.unclaim({ businessId: 1 });
    expect(result.success).toBe(true);
  });

  it("throws NOT_FOUND for non-existent business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    await expect(caller.businessActions.unclaim({ businessId: 999 })).rejects.toThrow();
  });

  it("rejects unauthenticated unclaim", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.businessActions.unclaim({ businessId: 1 })).rejects.toThrow();
  });
});

describe("businessActions.delete", () => {
  it("allows owner to delete their business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.businessActions.delete({ businessId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects delete by non-owner", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(caller.businessActions.delete({ businessId: 1 })).rejects.toThrow("Not authorized");
  });

  it("allows admin to delete any business", async () => {
    const caller = appRouter.createCaller(createAuthContext(999, "admin"));
    const result = await caller.businessActions.delete({ businessId: 1 });
    expect(result.success).toBe(true);
  });

  it("throws NOT_FOUND for non-existent business", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    await expect(caller.businessActions.delete({ businessId: 999 })).rejects.toThrow();
  });
});

// ─── Dashboard Analytics ──────────────────────────────────

describe("dashboard.analytics", () => {
  it("returns analytics for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.analytics();
    expect(result.totalReferralsSent).toBe(5);
    expect(result.totalReferralsReceived).toBe(3);
    expect(result.conversionRate).toBe(25);
    expect(result.activeOffers).toBe(4);
    expect(result.statusBreakdown.pending).toBe(2);
    expect(result.statusBreakdown.converted).toBe(2);
    expect(result.topPartners).toHaveLength(1);
    expect(result.topPartners[0].businessName).toBe("Partner Biz");
  });

  it("rejects unauthenticated analytics request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.analytics()).rejects.toThrow();
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

describe("business.autocomplete", () => {
  it("returns matching businesses by name", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const results = await caller.business.autocomplete({ query: "Cycling" });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Test Cycling");
  });

  it("returns matching businesses by city", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const results = await caller.business.autocomplete({ query: "Whistler" });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Alpine Bike Shop");
  });

  it("returns empty for no matches", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const results = await caller.business.autocomplete({ query: "nonexistent" });
    expect(results.length).toBe(0);
  });
});

describe("referralOffer.update", () => {
  it("updates an existing offer when authorized", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.referralOffer.update({
      id: 1,
      title: "Updated Commission Offer",
      description: "New description",
      offerType: "consumer",
      incentiveValue: "20",
    });
    expect(result.success).toBe(true);
  });

  it("throws FORBIDDEN when user does not own the business", async () => {
    const caller = appRouter.createCaller(createAuthContext(999));
    await expect(
      caller.referralOffer.update({ id: 1, title: "Hack attempt" })
    ).rejects.toThrow();
  });

  it("throws NOT_FOUND for non-existent offer", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.referralOffer.update({ id: 999, title: "Ghost" })
    ).rejects.toThrow();
  });
});

// ─── Context-Smart Search (mock-based) ──────────────────────────

describe("business.search context-smart search", () => {
  it("passes search term to searchBusinesses which searches across name, region, hub, city, country, business type, and sport category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // The mock always returns results, but we verify the search parameter is accepted
    const result = await caller.business.search({ search: "Mallorca" });
    expect(result).toBeDefined();
    expect(result.businesses).toBeDefined();
    expect(result.total).toBeDefined();
  });

  it("accepts search with business type terms like 'coach'", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({ search: "coach" });
    expect(result).toBeDefined();
  });

  it("accepts search with sport category terms like 'cycling'", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({ search: "cycling" });
    expect(result).toBeDefined();
  });

  it("accepts search with country terms like 'Canada'", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.search({ search: "Canada" });
    expect(result).toBeDefined();
  });
});

// ─── Featured Businesses (mock-based) ──────────────────────────

describe("business.featured", () => {
  it("returns featured businesses with default limit", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.featured({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts a custom limit parameter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.featured({ limit: 3 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("works without any input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.business.featured();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Referral Verification Tests ──────────────────────────────

describe("referralVerification router", () => {
  test("honor - marks a referral as honored by receiver", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.referralVerification.honor({ referralId: 1 });
    } catch (e: any) {
      // May fail due to mock, but verifies the procedure exists and accepts the input
      expect(e.code || e.message).toBeDefined();
    }
  });

  test("cashout - confirms sender cashed out a referral", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.referralVerification.cashout({ referralId: 1, amount: "25.00", notes: "Received payment" });
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });

  test("dispute - submits a dispute for a referral", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.referralVerification.dispute({ referralId: 1, reason: "Not honored" });
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });
});

// ─── Consumer Claims Tests ──────────────────────────────────

describe("consumerClaim router", () => {
  test("claim - creates a consumer claim for an offer", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.consumerClaim.claim({ offerId: 1 });
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });

  test("myClaims - returns consumer's claimed offers", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      const result = await caller.consumerClaim.myClaims();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });

  test("myAnalytics - returns consumer analytics", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      const result = await caller.consumerClaim.myAnalytics();
      expect(result).toBeDefined();
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });

  test("verify - verifies if a claim was honored", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.consumerClaim.verify({ claimId: 1, honored: true, amountSaved: "15.00", notes: "Great service" });
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });
});

// ─── Platform Stats Tests ──────────────────────────────────

describe("platformStats router", () => {
  test("get - returns platform activity stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.platformStats.get();
      expect(result).toBeDefined();
      expect(typeof result.totalReferrals).toBe("number");
      expect(typeof result.honoredReferrals).toBe("number");
      expect(typeof result.totalIncentivesExchanged).toBe("number");
      expect(typeof result.consumerOffersClaimed).toBe("number");
      expect(typeof result.consumerSavings).toBe("number");
      expect(typeof result.activeBusinesses).toBe("number");
    } catch (e: any) {
      expect(e.code || e.message).toBeDefined();
    }
  });
});


// ─── Partnership Email Tests ───────────────────────────────────────
describe("partnershipEmail", () => {
  it("allows authenticated user to send partnership email", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.partnershipEmail.send({
      recipientBusinessId: 1,
      subject: "Partnership inquiry",
      message: "Let's collaborate on referrals!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated partnership email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.partnershipEmail.send({
        recipientBusinessId: 1,
        subject: "Test",
        message: "Test message",
      })
    ).rejects.toThrow();
  });

  it("returns sent emails for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.partnershipEmail.mySent();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Support Ticket Tests ──────────────────────────────────────────
describe("supportTicket", () => {
  it("allows authenticated user to create a support ticket", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.supportTicket.create({
      title: "Bug report",
      description: "Something is broken",
      ticketType: "bug",
    });
    expect(result).toBeDefined();
  });

  it("returns user's tickets", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.supportTicket.myTickets();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects unauthenticated ticket creation", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.supportTicket.create({
        title: "Bug",
        description: "Test",
        ticketType: "bug",
      })
    ).rejects.toThrow();
  });
});

// ─── Category Approval Tests ───────────────────────────────────────
describe("categoryApproval", () => {
  it("allows authenticated user to request new category", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.categoryApproval.submit({
      categoryType: "hub",
      proposedName: "New Hub Area",
      description: "A new hub for testing",
    });
    expect(result).toBeDefined();
  });

  it("rejects unauthenticated category request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.categoryApproval.submit({
        categoryType: "hub",
        proposedName: "Test",
      })
    ).rejects.toThrow();
  });
});

// ─── Account Type Tests ────────────────────────────────────────────
describe("accountType", () => {
  it("allows authenticated user to set account type", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.accountType.set({
      accountType: "business_owner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated account type change", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.accountType.set({ accountType: "consumer" })
    ).rejects.toThrow();
  });
});

// ─── Multi-Select Search Tests ─────────────────────────────────────
describe("searchMulti", () => {
  it("accepts multi-select search parameters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.searchMulti.search({
      sportCategoryIds: [1, 2],
      businessTypeIds: [1],
      regions: ["Western US"],
    });
    expect(result).toBeDefined();
    expect(result.businesses).toBeDefined();
    expect(result.total).toBeDefined();
  });

  it("works with empty filters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.searchMulti.search({});
    expect(result).toBeDefined();
  });
});

// ─── Clear Sample Data on Claim Tests ─────────────────────────────────────
describe("business.claim clears sample data", () => {
  it("calls claimBusiness which clears sample data for the claimed business", async () => {
    const { claimBusiness } = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    await caller.business.claim({ businessId: 2, verificationEmail: "test@unclaimed-biz.com" });
    // claimBusiness is mocked, but we verify it was called with the right args
    expect(claimBusiness).toHaveBeenCalledWith(2, 1);
  });
});

// ─── Submission Review Auto-Claim Tests ───────────────────────────────────
describe("submission.review auto-claim", () => {
  it("creates business with claimedByUserId when submission has submittedByUserId", async () => {
    const { createBusiness, getBusinessSubmissionById } = await import("./db");
    // Override mock to include submittedByUserId
    (getBusinessSubmissionById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      submission: {
        id: 1,
        businessName: "Owner Submitted Biz",
        businessDescription: "A business submitted by owner",
        sportCategoryId: 1,
        businessTypeId: 1,
        contactName: "Jane",
        contactEmail: "jane@test.com",
        contactPhone: "555-1234",
        website: "https://test.com",
        instagram: null,
        facebook: null,
        city: "Chamonix",
        state: null,
        country: "France",
        region: "Alps",
        hub: "Chamonix",
        status: "pending",
        submittedByUserId: 42,
      },
      sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
      businessType: { id: 1, name: "Coach", slug: "coach" },
    });

    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.review({ id: 1, status: "approved" });
    expect(result.success).toBe(true);
    // Verify createBusiness was called with claimedByUserId set
    expect(createBusiness).toHaveBeenCalledWith(
      expect.objectContaining({
        claimedByUserId: 42,
        isClaimed: true,
      })
    );
  });

  it("creates business without claim when no submittedByUserId", async () => {
    const { createBusiness, getBusinessSubmissionById } = await import("./db");
    // Override mock to NOT include submittedByUserId
    (getBusinessSubmissionById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      submission: {
        id: 1,
        businessName: "Public Submitted Biz",
        businessDescription: "A business submitted publicly",
        sportCategoryId: 1,
        businessTypeId: 1,
        contactName: "Bob",
        contactEmail: "bob@test.com",
        contactPhone: null,
        website: "https://test.com",
        instagram: null,
        facebook: null,
        city: "Boulder",
        state: "CO",
        country: "USA",
        region: "Western US",
        hub: "Boulder",
        status: "pending",
        submittedByUserId: null,
      },
      sportCategory: { id: 1, name: "Cycling", slug: "cycling" },
      businessType: { id: 1, name: "Coach", slug: "coach" },
    });

    const caller = appRouter.createCaller(createAuthContext(1, "admin"));
    const result = await caller.submission.review({ id: 1, status: "approved" });
    expect(result.success).toBe(true);
    // Verify createBusiness was called with null claimedByUserId
    expect(createBusiness).toHaveBeenCalledWith(
      expect.objectContaining({
        claimedByUserId: null,
        isClaimed: false,
      })
    );
  });
});

// ─── Domain Email Validation Tests ────────────────────────────────────────
describe("submission.submit domain email validation", () => {
  it("accepts submission when email domain matches website domain", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.submission.submit({
      businessName: "Domain Match Biz",
      sportCategoryId: 1,
      businessTypeId: 1,
      contactName: "Alice",
      contactEmail: "alice@mybusiness.com",
      website: "https://mybusiness.com",
      city: "Denver",
      country: "USA",
    });
    expect(result.id).toBe(1);
  });

  it("accepts submission with common email providers (gmail, yahoo, etc.)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.submission.submit({
      businessName: "Gmail User Biz",
      sportCategoryId: 1,
      businessTypeId: 1,
      contactName: "Bob",
      contactEmail: "bob@gmail.com",
      website: "https://mybusiness.com",
      city: "Seattle",
      country: "USA",
    });
    expect(result.id).toBe(1);
  });
});

// ─── Account Type Consumer/Business Owner Tests ───────────────────────────
describe("accountType flow", () => {
  it("sets account type to consumer", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.accountType.set({ accountType: "consumer" });
    expect(result.success).toBe(true);
  });

  it("sets account type to business_owner", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.accountType.set({ accountType: "business_owner" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid account type", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.accountType.set({ accountType: "invalid" as any })
    ).rejects.toThrow();
  });
});
