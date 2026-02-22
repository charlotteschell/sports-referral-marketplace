import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module with all required functions
vi.mock("./db", () => ({
  getAllSportCategories: vi.fn().mockResolvedValue([]),
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
  getPlatformStats: vi.fn().mockResolvedValue({ totalReferrals: 0, honoredReferrals: 0, totalIncentivesExchanged: 0, consumerOffersClaimed: 0, consumerSavings: 0, activeBusinesses: 0 }),
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
  getAthleteProfile: vi.fn().mockResolvedValue(null),
  createOrUpdateAthleteProfile: vi.fn().mockResolvedValue(1),
  saveBusiness: vi.fn().mockResolvedValue({ id: 1 }),
  unsaveBusiness: vi.fn().mockResolvedValue(undefined),
  getSavedBusinesses: vi.fn().mockResolvedValue([]),
  isBusinessSaved: vi.fn().mockResolvedValue(false),
  getSavedBusinessIds: vi.fn().mockResolvedValue([]),
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
}));

// Mock notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock email module
vi.mock("./_core/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(
  overrides: Partial<AuthenticatedUser> = {}
): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "user-1",
    email: "user1@test.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    accountType: "consumer",
    onboardingComplete: false,
    notificationPreference: "both",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
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

// ─── Account Type Setting Tests ──────────────────────────────────

describe("accountType.set", () => {
  it("sets account type to consumer for authenticated user", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accountType.set({ accountType: "consumer" });
    expect(result).toEqual({ success: true });
    expect(db.updateUserAccountType).toHaveBeenCalledWith(1, "consumer");
  });

  it("sets account type to business_owner and marks onboarding complete", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accountType.set({ accountType: "business_owner" });
    expect(result).toEqual({ success: true });
    expect(db.updateUserAccountType).toHaveBeenCalledWith(1, "business_owner");
    // Business owners get onboarding marked complete immediately
    expect(db.markOnboardingComplete).toHaveBeenCalledWith(1);
  });

  it("does not mark onboarding complete for consumer account type", async () => {
    const db = await import("./db");
    vi.mocked(db.markOnboardingComplete).mockClear();
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await caller.accountType.set({ accountType: "consumer" });
    // markOnboardingComplete should NOT be called for consumers (they need to fill profile first)
    expect(db.markOnboardingComplete).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.accountType.set({ accountType: "consumer" })).rejects.toThrow();
  });
});

// ─── Onboarding Complete Tests ──────────────────────────────────

describe("onboarding.complete", () => {
  it("marks onboarding as complete for authenticated user", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.onboarding.complete();
    expect(result).toEqual({ success: true });
    expect(db.markOnboardingComplete).toHaveBeenCalledWith(1);
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.onboarding.complete()).rejects.toThrow();
  });
});

// ─── Athlete Profile Save with Notification Preference ──────────

describe("athleteProfile.save with notificationPreference", () => {
  it("saves profile with notification preference and marks onboarding complete", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.athleteProfile.save({
      displayName: "Test Athlete",
      city: "Calgary",
      state: "AB",
      country: "Canada",
      notificationPreference: "both",
    });
    expect(result).toEqual({ id: 1, success: true });
    expect(db.createOrUpdateAthleteProfile).toHaveBeenCalledWith(1, expect.objectContaining({
      displayName: "Test Athlete",
      city: "Calgary",
      notificationPreference: "both",
    }));
    // Saving athlete profile should also mark onboarding complete
    expect(db.markOnboardingComplete).toHaveBeenCalledWith(1);
  });

  it("accepts all notification preference values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    for (const pref of ["in_app_only", "email_only", "both", "none"] as const) {
      const result = await caller.athleteProfile.save({
        notificationPreference: pref,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid notification preference values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.athleteProfile.save({
        notificationPreference: "invalid_value" as any,
      })
    ).rejects.toThrow();
  });
});

// ─── Auth.me Returns User Type Fields ──────────────────────────

describe("auth.me returns user type fields", () => {
  it("returns user with accountType and onboardingComplete fields", async () => {
    const ctx = createAuthContext({
      accountType: "business_owner",
      onboardingComplete: true,
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result?.accountType).toBe("business_owner");
    expect(result?.onboardingComplete).toBe(true);
  });

  it("returns consumer account type with onboarding incomplete", async () => {
    const ctx = createAuthContext({
      accountType: "consumer",
      onboardingComplete: false,
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result?.accountType).toBe("consumer");
    expect(result?.onboardingComplete).toBe(false);
  });

  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── User Profile Settings Tests ──────────────────────────────

describe("userProfile.get", () => {
  it("returns user profile for authenticated user", async () => {
    const ctx = createAuthContext({
      name: "Business Owner",
      email: "owner@test.com",
      accountType: "business_owner",
      role: "user",
      notificationPreference: "email_only",
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.userProfile.get();
    expect(result).toEqual({
      name: "Business Owner",
      email: "owner@test.com",
      accountType: "business_owner",
      role: "user",
      notificationPreference: "email_only",
    });
  });

  it("defaults notificationPreference to 'both' if not set", async () => {
    const ctx = createAuthContext({
      notificationPreference: "",
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.userProfile.get();
    expect(result.notificationPreference).toBe("both");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.userProfile.get()).rejects.toThrow();
  });
});

describe("userProfile.update", () => {
  it("updates user name and email", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.userProfile.update({
      name: "New Name",
      email: "new@test.com",
    });
    expect(result).toEqual({ success: true });
    expect(db.updateUserProfile).toHaveBeenCalledWith(1, {
      name: "New Name",
      email: "new@test.com",
    });
  });

  it("updates notification preference", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.userProfile.update({
      notificationPreference: "in_app_only",
    });
    expect(result).toEqual({ success: true });
    expect(db.updateUserProfile).toHaveBeenCalledWith(1, {
      notificationPreference: "in_app_only",
    });
  });

  it("rejects invalid notification preference", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.userProfile.update({
        notificationPreference: "invalid" as any,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.userProfile.update({ name: "Test" })).rejects.toThrow();
  });
});
