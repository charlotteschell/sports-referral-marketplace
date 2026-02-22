import { describe, it, expect, vi, beforeEach } from "vitest";
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

function createAdminContext(
  overrides: Partial<AuthenticatedUser> = {}
): TrpcContext {
  return createAuthContext({
    id: 99,
    openId: "admin-1",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
    ...overrides,
  });
}

// ─── Business Claim Notifications ──────────────────────────────

describe("Notification: Business Claim Submitted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends in-app notification to the claiming user when they claim a business", async () => {
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

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.claim({ businessId: 10 });

    expect(result.success).toBe(true);
    expect(db.claimBusiness).toHaveBeenCalledWith(10, 1);

    // Should notify the claiming user
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        type: "claim_submitted",
        title: expect.stringContaining("RARE Trail Running Club"),
      })
    );
  });
});

describe("Notification: Business Claim Approved/Rejected", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends in-app notification to business owner when claim is approved", async () => {
    const db = await import("./db");
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: {
        id: 10,
        name: "RARE Trail Running Club",
        isClaimed: true,
        claimedByUserId: 5,
        approvalStatus: "pending",
      },
      sportCategory: null,
      businessType: null,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.reviewBusiness({
      businessId: 10,
      status: "approved",
    });

    expect(result.success).toBe(true);
    expect(db.approveOrRejectBusiness).toHaveBeenCalledWith(10, "approved", undefined);

    // Should notify the business owner (userId: 5)
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "claim_approved",
        title: expect.stringContaining("approved"),
        businessId: 10,
      })
    );
  });

  it("sends in-app notification to business owner when claim is rejected", async () => {
    const db = await import("./db");
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: {
        id: 10,
        name: "RARE Trail Running Club",
        isClaimed: true,
        claimedByUserId: 5,
        approvalStatus: "pending",
      },
      sportCategory: null,
      businessType: null,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.reviewBusiness({
      businessId: 10,
      status: "rejected",
      notes: "Insufficient proof of ownership",
    });

    expect(result.success).toBe(true);

    // Should notify the business owner with rejection reason
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "claim_rejected",
        title: expect.stringContaining("not approved"),
        message: expect.stringContaining("Insufficient proof of ownership"),
      })
    );
  });

  it("does NOT notify when business has no claimed user", async () => {
    const db = await import("./db");
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: {
        id: 10,
        name: "Unclaimed Biz",
        isClaimed: false,
        claimedByUserId: null,
        approvalStatus: "pending",
      },
      sportCategory: null,
      businessType: null,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await caller.admin.reviewBusiness({ businessId: 10, status: "approved" });

    // notifyUser should NOT be called since there's no claimedByUserId
    expect(db.notifyUser).not.toHaveBeenCalled();
  });
});

// ─── Referral Notifications ────────────────────────────────────

describe("Notification: New Referral Sent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the receiving business owner when a referral is sent", async () => {
    const db = await import("./db");
    // Sending business (owned by user 1)
    (db.getBusinessById as any)
      .mockResolvedValueOnce({
        business: {
          id: 10,
          name: "Sender Biz",
          isClaimed: true,
          claimedByUserId: 1,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      })
      // Receiving business (owned by user 5)
      .mockResolvedValueOnce({
        business: {
          id: 20,
          name: "Receiver Biz",
          isClaimed: true,
          claimedByUserId: 5,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referral.send({
      referringBusinessId: 10,
      receivingBusinessId: 20,
      customerName: "John Doe",
    });

    expect(result.id).toBe(1);

    // Should notify the receiving business owner
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "referral_received",
        title: expect.stringContaining("Sender Biz"),
        businessId: 20,
      })
    );
  });
});

describe("Notification: Referral Honored", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the sending business owner when their referral is honored", async () => {
    const db = await import("./db");
    // The referral
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 1,
      referringBusinessId: 10,
      receivingBusinessId: 20,
      referringUserId: 1,
    });
    // Receiving business (owned by user 5, who is honoring)
    (db.getBusinessById as any)
      .mockResolvedValueOnce({
        business: {
          id: 20,
          name: "Receiver Biz",
          isClaimed: true,
          claimedByUserId: 5,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      })
      // Sending business (owned by user 1, who should be notified)
      .mockResolvedValueOnce({
        business: {
          id: 10,
          name: "Sender Biz",
          isClaimed: true,
          claimedByUserId: 1,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      });

    const ctx = createAuthContext({ id: 5, openId: "user-5" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referralVerification.honor({
      referralId: 1,
      incentiveAmount: "50",
    });

    expect(result.success).toBe(true);

    // Should notify the sending business owner
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        type: "referral_honored",
        title: expect.stringContaining("Receiver Biz"),
        message: expect.stringContaining("$50"),
      })
    );
  });
});

describe("Notification: Referral Disputed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the other party when a referral is disputed", async () => {
    const db = await import("./db");
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 1,
      referringBusinessId: 10,
      receivingBusinessId: 20,
      referringUserId: 1,
    });
    // Sending business (owned by user 1, who is disputing)
    (db.getBusinessById as any)
      .mockResolvedValueOnce({
        business: {
          id: 10,
          name: "Sender Biz",
          isClaimed: true,
          claimedByUserId: 1,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      })
      // Receiving business (owned by user 5, who should be notified)
      .mockResolvedValueOnce({
        business: {
          id: 20,
          name: "Receiver Biz",
          isClaimed: true,
          claimedByUserId: 5,
          approvalStatus: "approved",
        },
        sportCategory: null,
        businessType: null,
      });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referralVerification.dispute({
      referralId: 1,
      reason: "Never received payment",
    });

    expect(result.success).toBe(true);

    // Should notify the other party (receiver, userId: 5)
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "referral_disputed",
        title: expect.stringContaining("disputed"),
      })
    );
  });
});

// ─── Consumer Claim Notifications ──────────────────────────────

describe("Notification: Consumer Claims Offer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the business owner when a consumer claims their offer", async () => {
    const db = await import("./db");
    (db.getReferralOfferById as any).mockResolvedValueOnce({
      id: 1,
      title: "10% off first session",
      isActive: true,
      offerType: "consumer",
      businessId: 10,
    });
    (db.hasUserClaimedOffer as any).mockResolvedValueOnce(false);
    // Business lookup for notification
    (db.getBusinessById as any).mockResolvedValueOnce({
      business: {
        id: 10,
        name: "Trail Running Club",
        isClaimed: true,
        claimedByUserId: 5,
        approvalStatus: "approved",
      },
      sportCategory: null,
      businessType: null,
    });

    const ctx = createAuthContext({ accountType: "consumer" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consumerClaim.claim({
      referralOfferId: 1,
      businessId: 10,
    });

    expect(result).toBeTruthy();

    // Should notify the business owner
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "consumer_claim",
        title: expect.stringContaining("claimed your offer"),
        businessId: 10,
        offerId: 1,
      })
    );
  });
});

// ─── Support Ticket Notifications ──────────────────────────────

describe("Notification: Support Ticket Status Update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the ticket submitter when status changes", async () => {
    const db = await import("./db");
    (db.getSupportTicketById as any).mockResolvedValueOnce({
      id: 1,
      userId: 5,
      userName: "Charlotte",
      userEmail: "charlotte@test.com",
      title: "Add dark mode",
      description: "Please add dark mode support",
      ticketType: "feature_request",
      status: "new",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
   const result = await caller.supportTicket.updateStatus({ id: 1, status: "in_progress" });

    expect(result.success).toBe(true);

    // Should notify the ticket submitter
    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "ticket_status_update",
        title: expect.stringContaining("being worked on"),
      })
    );
  });

  it("notifies with 'launched' status message", async () => {
    const db = await import("./db");
    (db.getSupportTicketById as any).mockResolvedValueOnce({
      id: 1,
      userId: 5,
      userName: "Charlotte",
      userEmail: "charlotte@test.com",
      title: "Add dark mode",
      description: "Please add dark mode support",
      ticketType: "feature_request",
      status: "in_testing",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await caller.supportTicket.updateStatus({ id: 1, status: "launched" });

    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "ticket_status_update",
        title: expect.stringContaining("launched"),
      })
    );
  });

  it("does NOT notify when ticket has no userId", async () => {
    const db = await import("./db");
    (db.getSupportTicketById as any).mockResolvedValueOnce({
      id: 1,
      userId: null,
      userName: "Anonymous",
      userEmail: "anon@test.com",
      title: "Bug report",
      description: "Something broke",
      ticketType: "bug",
      status: "new",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await caller.supportTicket.updateStatus({ id: 1, status: "in_backlog" });

    expect(db.notifyUser).not.toHaveBeenCalled();
  });
});

// ─── Category Approval Notifications ───────────────────────────

describe("Notification: Category Approval Review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the user when their category suggestion is approved", async () => {
    const db = await import("./db");
    (db.getCategoryApprovalById as any).mockResolvedValueOnce({
      id: 1,
      userId: 5,
      categoryType: "sport",
      proposedName: "Gravel Cycling",
      proposedSlug: "gravel-cycling",
      status: "pending",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categoryApproval.review({
      id: 1,
      status: "approved",
    });

    expect(result.success).toBe(true);

    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "category_approved",
        title: expect.stringContaining("Gravel Cycling"),
      })
    );
  });

  it("notifies the user when their category suggestion is rejected", async () => {
    const db = await import("./db");
    (db.getCategoryApprovalById as any).mockResolvedValueOnce({
      id: 1,
      userId: 5,
      categoryType: "business_type",
      proposedName: "Yoga Studio",
      proposedSlug: "yoga-studio",
      status: "pending",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await caller.categoryApproval.review({
      id: 1,
      status: "rejected",
      adminNotes: "Not in scope for sports marketplace",
    });

    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "category_rejected",
        title: expect.stringContaining("not approved"),
        message: expect.stringContaining("Not in scope for sports marketplace"),
      })
    );
  });
});

// ─── Business Submission Notifications ─────────────────────────

describe("Notification: Business Submission Review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies the submitter when their business submission is approved", async () => {
    const db = await import("./db");
    (db.getBusinessSubmissionById as any).mockResolvedValueOnce({
      submission: {
        id: 1,
        businessName: "Mountain Bike Pros",
        businessDescription: "Expert mountain bike coaching",
        sportCategoryId: 1,
        businessTypeId: 1,
        city: "Whistler",
        state: "BC",
        country: "Canada",
        region: null,
        hub: null,
        contactPhone: null,
        contactEmail: "info@mtbpros.com",
        website: null,
        instagram: null,
        facebook: null,
        submittedByUserId: 5,
        status: "pending",
      },
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.submission.review({
      id: 1,
      status: "approved",
    });

    expect(result.success).toBe(true);

    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "submission_approved",
        title: expect.stringContaining("Mountain Bike Pros"),
      })
    );
  });

  it("notifies the submitter when their business submission is rejected", async () => {
    const db = await import("./db");
    (db.getBusinessSubmissionById as any).mockResolvedValueOnce({
      submission: {
        id: 1,
        businessName: "Random Biz",
        businessDescription: "Not relevant",
        sportCategoryId: 1,
        businessTypeId: 1,
        city: "Nowhere",
        state: "XX",
        country: "XX",
        region: null,
        hub: null,
        contactPhone: null,
        contactEmail: "info@random.com",
        website: null,
        instagram: null,
        facebook: null,
        submittedByUserId: 5,
        status: "pending",
      },
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await caller.submission.review({
      id: 1,
      status: "rejected",
      reviewNotes: "Business not relevant to sports",
    });

    expect(db.notifyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        type: "submission_rejected",
        title: expect.stringContaining("not approved"),
        message: expect.stringContaining("Business not relevant"),
      })
    );
  });
});
