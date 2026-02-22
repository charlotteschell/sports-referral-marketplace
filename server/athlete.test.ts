import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module with all required functions
vi.mock("./db", () => ({
  // Sport categories (needed by router)
  getAllSportCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Cycling", slug: "cycling", description: "Cycling sports", icon: "bike" },
    { id: 2, name: "Running", slug: "running", description: "All running disciplines", icon: "mountain" },
  ]),
  getAllBusinessTypes: vi.fn().mockResolvedValue([]),
  getDistinctRegions: vi.fn().mockResolvedValue([]),
  getHubsByRegion: vi.fn().mockResolvedValue([]),
  searchBusinesses: vi.fn().mockResolvedValue({ businesses: [], total: 0 }),
  getBusinessBySlug: vi.fn().mockResolvedValue(null),
  getBusinessById: vi.fn().mockResolvedValue(null),
  getBusinessesByOwner: vi.fn().mockResolvedValue([]),
  createBusiness: vi.fn().mockResolvedValue(99),
  updateBusiness: vi.fn().mockResolvedValue(undefined),
  claimBusiness: vi.fn().mockResolvedValue(undefined),
  getFeaturedBusinesses: vi.fn().mockResolvedValue([]),
  searchBusinessesAutocomplete: vi.fn().mockResolvedValue([]),
  getDirectoryStats: vi.fn().mockResolvedValue({ totalBusinesses: 0, claimedBusinesses: 0, totalReferrals: 0, sportCategories: 0, regions: 0 }),
  getReferralOffersByBusiness: vi.fn().mockResolvedValue([]),
  createReferralOffer: vi.fn().mockResolvedValue(1),
  updateReferralOffer: vi.fn().mockResolvedValue(undefined),
  deleteReferralOffer: vi.fn().mockResolvedValue(undefined),
  getReferralOfferById: vi.fn().mockResolvedValue(null),
  getAllActiveReferralOffers: vi.fn().mockResolvedValue([]),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferralStatus: vi.fn().mockResolvedValue(undefined),
  getReferralsSent: vi.fn().mockResolvedValue([]),
  getReferralsReceived: vi.fn().mockResolvedValue([]),
  getReferralStats: vi.fn().mockResolvedValue({ sent: 0, received: 0, converted: 0, pending: 0 }),
  unclaimBusiness: vi.fn().mockResolvedValue(undefined),
  deleteBusiness: vi.fn().mockResolvedValue(undefined),
  getDashboardAnalytics: vi.fn().mockResolvedValue({ totalReferralsSent: 0, totalReferralsReceived: 0, conversionRate: 0, activeOffers: 0, statusBreakdown: {}, topPartners: [], recentActivity: [] }),
  createBusinessSubmission: vi.fn().mockResolvedValue(1),
  getBusinessSubmissions: vi.fn().mockResolvedValue([]),
  updateBusinessSubmissionStatus: vi.fn().mockResolvedValue(undefined),
  markReferralHonored: vi.fn().mockResolvedValue(undefined),
  markReferralCashedOut: vi.fn().mockResolvedValue(undefined),
  disputeReferral: vi.fn().mockResolvedValue(undefined),
  incrementPlatformStat: vi.fn().mockResolvedValue(undefined),
  hasUserClaimedOffer: vi.fn().mockResolvedValue(false),
  createConsumerClaim: vi.fn().mockResolvedValue(1),
  verifyConsumerClaim: vi.fn().mockResolvedValue(undefined),
  getConsumerClaimsByUser: vi.fn().mockResolvedValue([]),
  getConsumerClaimsByBusiness: vi.fn().mockResolvedValue([]),
  getConsumerAnalytics: vi.fn().mockResolvedValue({ totalClaims: 0, redeemed: 0, pending: 0, totalSaved: 0 }),
  getPlatformStats: vi.fn().mockResolvedValue({ totalReferrals: 0, honoredReferrals: 0, totalIncentivesExchanged: 0, consumerOffersClaimed: 0, consumerSavings: 0, activeBusinesses: 0, businessRevenueFromReferrals: 0, totalAthletesSentToBusinesses: 0, totalPartnershipsBrokered: 0 }),
  createEmailVerification: vi.fn().mockResolvedValue(undefined),
  verifyEmailCode: vi.fn().mockResolvedValue(true),
  isEmailVerified: vi.fn().mockResolvedValue(true),
  getOffersForBusinessIds: vi.fn().mockResolvedValue([]),
  getFeaturedBusinessOffers: vi.fn().mockResolvedValue([]),
  formatPhoneNumber: vi.fn().mockImplementation((p: string) => p),
  getReferralById: vi.fn().mockResolvedValue(null),
  toggleOfferVisibility: vi.fn().mockResolvedValue(undefined),
  adminToggleBusinessVisibility: vi.fn().mockResolvedValue(undefined),
  toggleBusinessVisibility: vi.fn().mockResolvedValue(undefined),
  sendPartnershipEmail: vi.fn().mockResolvedValue(1),
  getPartnershipEmailsSent: vi.fn().mockResolvedValue([]),
  getPartnershipEmailsReceived: vi.fn().mockResolvedValue([]),
  createSupportTicket: vi.fn().mockResolvedValue(1),
  getSupportTicketsByUser: vi.fn().mockResolvedValue([]),
  getSupportTickets: vi.fn().mockResolvedValue({ tickets: [], total: 0 }),
  updateSupportTicketStatus: vi.fn().mockResolvedValue(undefined),
  getSupportTicketById: vi.fn().mockResolvedValue(null),
  createCategoryApproval: vi.fn().mockResolvedValue(1),
  getCategoryApprovals: vi.fn().mockResolvedValue({ requests: [], total: 0 }),
  updateCategoryApprovalStatus: vi.fn().mockResolvedValue(undefined),
  getCategoryApprovalById: vi.fn().mockResolvedValue(null),
  createSportCategory: vi.fn().mockResolvedValue(1),
  createBusinessType: vi.fn().mockResolvedValue(1),
  createHub: vi.fn().mockResolvedValue(1),
  updateUserAccountType: vi.fn().mockResolvedValue(undefined),
  markOnboardingComplete: vi.fn().mockResolvedValue(undefined),
  updateBusinessLogo: vi.fn().mockResolvedValue(undefined),
  searchBusinessesMulti: vi.fn().mockResolvedValue({ businesses: [], total: 0 }),
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
  getBusinessSubmissionById: vi.fn().mockResolvedValue(null),
  // Athlete profile mocks
  getAthleteProfile: vi.fn().mockImplementation(async (userId: number) => {
    if (userId === 1) return {
      id: 1, userId: 1, displayName: "Charlotte", sportIds: "1,2",
      experienceLevels: "intermediate", city: "Calgary", state: "AB", country: "Canada",
      region: "Western Canada", hub: "Calgary", interests: "coaching,nutrition",
      goals: "Finish a century ride", referralSource: "word_of_mouth", newsletterOptIn: true,
      createdAt: new Date(), updatedAt: new Date(),
    };
    return null;
  }),
  createOrUpdateAthleteProfile: vi.fn().mockResolvedValue(1),
  // Saved business mocks
  saveBusiness: vi.fn().mockResolvedValue({ id: 1 }),
  unsaveBusiness: vi.fn().mockResolvedValue(undefined),
  getSavedBusinesses: vi.fn().mockResolvedValue([
    {
      savedBusiness: { id: 1, userId: 1, businessId: 5, createdAt: new Date() },
      business: { id: 5, name: "Peak Cycling", slug: "peak-cycling", city: "Boulder", country: "USA" },
    },
  ]),
  isBusinessSaved: vi.fn().mockResolvedValue(true),
  getSavedBusinessIds: vi.fn().mockResolvedValue([5, 12]),
  // Leaderboard mocks
  getLeaderboard: vi.fn().mockResolvedValue({ topReferrers: [], topReceivers: [], mostReliable: [], topConnectors: [] }),
  getRecommendedBusinesses: vi.fn().mockResolvedValue([]),
  getUserNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
  getUsersWhoSavedBusiness: vi.fn().mockResolvedValue([]),
  createNotification: vi.fn().mockResolvedValue(1),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  updateUserNotificationPreference: vi.fn().mockResolvedValue(undefined),
  notifyUser: vi.fn().mockResolvedValue({ sent: true, method: 'in_app' }),
  getUserById: vi.fn().mockResolvedValue(null),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@test.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    accountType: "consumer" as const,
    onboardingComplete: true,
    notificationPreference: "both",
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

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Athlete Profile Tests ──────────────────────────────────────

describe("athleteProfile.get", () => {
  it("returns athlete profile for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.athleteProfile.get();
    expect(result).toBeTruthy();
    expect(result?.displayName).toBe("Charlotte");
    expect(result?.sportIds).toBe("1,2");
    expect(result?.city).toBe("Calgary");
  });

  it("returns null for user without profile", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.athleteProfile.get();
    expect(result).toBeNull();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.athleteProfile.get()).rejects.toThrow();
  });
});

describe("athleteProfile.save", () => {
  it("creates or updates athlete profile", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.athleteProfile.save({
      displayName: "Charlotte",
      sportIds: "1,2",
      city: "Calgary",
      state: "AB",
      country: "Canada",
      interests: "coaching,nutrition",
      goals: "Finish a century ride",
      referralSource: "word_of_mouth",
      newsletterOptIn: true,
    });
    expect(result).toEqual({ id: 1, success: true });
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.athleteProfile.save({ displayName: "Test" })).rejects.toThrow();
  });
});

// ─── Saved Business Tests ──────────────────────────────────────

describe("savedBusiness.save", () => {
  it("saves a business for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.savedBusiness.save({ businessId: 5 });
    expect(result).toBeTruthy();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.savedBusiness.save({ businessId: 5 })).rejects.toThrow();
  });
});

describe("savedBusiness.unsave", () => {
  it("unsaves a business for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.savedBusiness.unsave({ businessId: 5 })).resolves.not.toThrow();
  });
});

describe("savedBusiness.list", () => {
  it("returns saved businesses for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.savedBusiness.list();
    expect(result).toHaveLength(1);
    expect(result[0].business.name).toBe("Peak Cycling");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.savedBusiness.list()).rejects.toThrow();
  });
});

describe("savedBusiness.isSaved", () => {
  it("returns true for a saved business", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.savedBusiness.isSaved({ businessId: 5 });
    expect(result).toBe(true);
  });
});

describe("savedBusiness.savedIds", () => {
  it("returns array of saved business IDs", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.savedBusiness.savedIds();
    expect(result).toEqual([5, 12]);
  });
});
