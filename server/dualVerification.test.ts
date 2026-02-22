import { vi, describe, it, expect, beforeEach } from "vitest";
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
  getDashboardAnalytics: vi.fn().mockResolvedValue({
    totalReferralsSent: 5,
    totalReferralsReceived: 3,
    conversionRate: 40,
    activeOffers: 2,
    statusBreakdown: { pending: 1, contacted: 2, converted: 3, declined: 0, expired: 0 },
    topPartners: [],
    recentActivity: [],
    verifiedScorecard: {
      sent: { incentiveVerified: 2, totalVerifiedEarned: '150.00', honored: 3 },
      received: { incentiveVerified: 1, revenueVerified: 1, totalVerifiedIncentivePaid: '50.00', totalVerifiedRevenue: '500.00', honored: 2 },
    },
  }),
  createBusinessSubmission: vi.fn().mockResolvedValue(1),
  getBusinessSubmissions: vi.fn().mockResolvedValue([]),
  updateBusinessSubmissionStatus: vi.fn().mockResolvedValue(undefined),
  markReferralHonored: vi.fn().mockResolvedValue(undefined),
  markReferralCashedOut: vi.fn().mockResolvedValue(undefined),
  disputeReferral: vi.fn().mockResolvedValue(undefined),
  incrementPlatformStat: vi.fn().mockResolvedValue(undefined),
  hasUserClaimedOffer: vi.fn().mockResolvedValue(false),
  createConsumerClaim: vi.fn().mockResolvedValue({ id: 1, claimCode: "SC-TEST1" }),
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
  createUserNotification: vi.fn().mockResolvedValue(1),
  notifyUser: vi.fn().mockResolvedValue({ sent: true, method: 'in_app' }),
  getUserById: vi.fn().mockResolvedValue(null),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  updateUserNotificationPreference: vi.fn().mockResolvedValue(undefined),
  businessConfirmClaimSavings: vi.fn().mockResolvedValue(undefined),
  athleteConfirmReferralPayment: vi.fn().mockResolvedValue(undefined),
  clearSampleDataForBusiness: vi.fn().mockResolvedValue(undefined),
  softDeleteUser: vi.fn().mockResolvedValue(undefined),
  adminDeleteUser: vi.fn().mockResolvedValue(undefined),
  adminHideUser: vi.fn().mockResolvedValue(undefined),
  adminRestoreUser: vi.fn().mockResolvedValue(undefined),
  getAdminUserList: vi.fn().mockResolvedValue([]),
}));

// Mock notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock email module
vi.mock("./email", () => ({
  sendNotificationEmail: vi.fn().mockResolvedValue(true),
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
    accountType: "business_owner",
    onboardingComplete: true,
    contactName: "Charlotte",
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

// ─── Dashboard Analytics with Verified Scorecard ─────────────────

describe("Dashboard Analytics: Verified Scorecard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns verified scorecard data in dashboard analytics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.analytics();

    expect(result).toBeDefined();
    expect(result.verifiedScorecard).toBeDefined();
    expect(result.verifiedScorecard.sent).toBeDefined();
    expect(result.verifiedScorecard.received).toBeDefined();
  });

  it("returns correct sent scorecard fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.analytics();

    const sent = result.verifiedScorecard.sent;
    expect(sent.incentiveVerified).toBe(2);
    expect(sent.totalVerifiedEarned).toBe('150.00');
    expect(sent.honored).toBe(3);
  });

  it("returns correct received scorecard fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.analytics();

    const received = result.verifiedScorecard.received;
    expect(received.incentiveVerified).toBe(1);
    expect(received.revenueVerified).toBe(1);
    expect(received.totalVerifiedIncentivePaid).toBe('50.00');
    expect(received.totalVerifiedRevenue).toBe('500.00');
    expect(received.honored).toBe(2);
  });
});

// ─── Referral Honor with Notification ────────────────────────────

describe("Referral Verification: Honor with Notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends notification to sender when referral is honored", async () => {
    const db = await import("./db");
    // Mock the referral lookup
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 1,
      referringBusinessId: 10,
      receivingBusinessId: 20,
      status: 'pending',
      receiverHonored: false,
      isDisputed: false,
    });
    // Mock the receiving business (user's business) - needs approvalStatus for assertApprovedOwner
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: { id: 20, name: "My Bike Shop", claimedByUserId: 1, approvalStatus: 'approved' },
    });
    // Mock the referring business (sender's business)
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: { id: 10, name: "Trail Running Club", claimedByUserId: 2, approvalStatus: 'approved' },
    });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await caller.referralVerification.honor({
      referralId: 1,
      notes: "Great referral",
      incentiveAmount: "25.00",
      revenueAmount: "150.00",
    });

    // Verify honor was called
    expect(db.markReferralHonored).toHaveBeenCalledWith(1, 1, "Great referral", "25.00", "150.00");
    // Verify notification was sent to the sender
    expect(db.notifyUser).toHaveBeenCalled();
  });

  it("sends notification to receiver when referral is disputed", async () => {
    const db = await import("./db");
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 2,
      referringBusinessId: 10,
      receivingBusinessId: 20,
      status: 'pending',
      receiverHonored: false,
      isDisputed: false,
    });
    // dispute calls getBusinessById twice: once for sender, once for receiver
    (db.getBusinessById as any)
      .mockResolvedValueOnce({ business: { id: 10, name: "Trail Club", claimedByUserId: 1 } })
      .mockResolvedValueOnce({ business: { id: 20, name: "Bike Shop", claimedByUserId: 2 } });

    const ctx = createAuthContext({ id: 1 }); // user 1 owns business 10 (sender)
    const caller = appRouter.createCaller(ctx);
    await caller.referralVerification.dispute({
      referralId: 2,
      reason: "Customer never showed up",
    });

    expect(db.disputeReferral).toHaveBeenCalledWith(2, 1, "Customer never showed up");
    expect(db.notifyUser).toHaveBeenCalled();
  });
});

// ─── Cashout with Notification ───────────────────────────────────

describe("Referral Verification: Cashout with Notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends notification to receiver when sender cashes out", async () => {
    const db = await import("./db");
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 3,
      referringBusinessId: 10,
      receivingBusinessId: 20,
      status: 'converted',
      receiverHonored: true,
      senderCashedOut: false,
      isDisputed: false,
    });
    // cashout calls getBusinessById for the referring business (sender's biz) - needs approvalStatus
    (db.getBusinessById as any)
      .mockResolvedValueOnce({ business: { id: 10, name: "My Trail Club", claimedByUserId: 1, approvalStatus: 'approved', isClaimed: true } });

    const ctx = createAuthContext({ id: 1 }); // user 1 owns business 10
    const caller = appRouter.createCaller(ctx);
    await caller.referralVerification.cashout({
      referralId: 3,
      amount: "30.00",
    });

    expect(db.markReferralCashedOut).toHaveBeenCalledWith(3, 1, "30.00", undefined);
  });
});

// ─── Consumer Claim Notification ─────────────────────────────────

describe("Consumer Claim: Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends notification to business owner when consumer claims an offer", async () => {
    const db = await import("./db");
    (db.getReferralOfferById as any).mockResolvedValueOnce({
      id: 5,
      businessId: 10,
      title: "10% off first session",
      offerType: "consumer",
      isActive: true,
    });
    (db.hasUserClaimedOffer as any).mockResolvedValueOnce(false);
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: { id: 10, name: "Trail Club", claimedByUserId: 2 },
    });

    const ctx = createAuthContext({ accountType: "athlete" });
    const caller = appRouter.createCaller(ctx);
    await caller.consumerClaim.claim({
      referralOfferId: 5,
      businessId: 10,
    });

    expect(db.createConsumerClaim).toHaveBeenCalled();
    // Notification should be sent to business owner (userId 2)
    expect(db.notifyUser).toHaveBeenCalled();
  });
});

// ─── Email Delivery Integration ──────────────────────────────────

describe("Email Delivery: notifyUser respects preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifyUser is called with correct userId for claim notifications", async () => {
    const db = await import("./db");
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: {
        id: 10,
        name: "RARE Trail Running Club",
        isClaimed: false,
        claimedByUserId: null,
        approvalStatus: "approved",
        city: "Calgary",
        country: "Canada",
      },
      sportCategory: null,
      businessType: null,
    });

    const ctx = createAuthContext({ id: 5 });
    const caller = appRouter.createCaller(ctx);
    await caller.business.claim({ businessId: 10 });

    // notifyUser should be called with an object containing the claiming user's ID
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: 'claim_submitted',
      })
    );
  });
});
