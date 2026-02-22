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
  getBusinessById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      business: { id: 1, name: "Test Biz", slug: "test-biz", isClaimed: true, claimedByUserId: 1, isActive: true, approvalStatus: "approved" },
      sportCategory: { id: 1, name: "Cycling" },
      businessType: { id: 1, name: "Coach" },
    };
    if (id === 2) return {
      business: { id: 2, name: "Unclaimed Biz", slug: "unclaimed-biz", isClaimed: false, claimedByUserId: null, isActive: true, approvalStatus: "approved" },
      sportCategory: { id: 1, name: "Cycling" },
      businessType: { id: 1, name: "Coach" },
    };
    return null;
  }),
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
  getReferralOfferById: vi.fn().mockResolvedValue({ id: 1, businessId: 1, title: "10% Commission", offerType: "b2b" }),
  getAllActiveReferralOffers: vi.fn().mockResolvedValue([]),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferralStatus: vi.fn().mockResolvedValue(undefined),
  getReferralsSent: vi.fn().mockResolvedValue([]),
  getReferralsReceived: vi.fn().mockResolvedValue([]),
  getReferralStats: vi.fn().mockResolvedValue({ sent: 0, received: 0, converted: 0, pending: 0 }),
  unclaimBusiness: vi.fn().mockResolvedValue(undefined),
  deleteBusiness: vi.fn().mockResolvedValue(undefined),
  getDashboardAnalytics: vi.fn().mockResolvedValue({
    totalReferralsSent: 5, totalReferralsReceived: 3, conversionRate: 25, activeOffers: 4,
    statusBreakdown: { pending: 2, contacted: 3, converted: 2, declined: 1, expired: 0 },
    topPartners: [], recentActivity: [],
    verifiedScorecard: { totalVerified: 3, totalHonored: 5, verifiedIncentiveAmount: 150, totalIncentiveAmount: 250, verificationRate: 60 },
  }),
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
  getPlatformStats: vi.fn().mockResolvedValue({
    totalReferrals: 0, honoredReferrals: 0, totalIncentivesExchanged: 0,
    consumerOffersClaimed: 0, consumerSavings: 0, activeBusinesses: 0,
    businessRevenueFromReferrals: 0, totalAthletesSentToBusinesses: 0, totalPartnershipsBrokered: 0,
  }),
  createEmailVerification: vi.fn().mockResolvedValue(undefined),
  verifyEmailCode: vi.fn().mockResolvedValue(true),
  isEmailVerified: vi.fn().mockResolvedValue(true),
  getOffersForBusinessIds: vi.fn().mockResolvedValue([]),
  getFeaturedBusinessOffers: vi.fn().mockResolvedValue([]),
  formatPhoneNumber: vi.fn().mockImplementation((p: string) => p),
  getReferralById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      id: 1, referringBusinessId: 1, receivingBusinessId: 2, offerId: 1, status: "pending",
      customerName: "Test Customer", customerEmail: "cust@test.com", approvalStatus: "approved",
    };
    return null;
  }),
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
  getSupportTicketById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, userId: 2, subject: "Help", status: "new" };
    return null;
  }),
  createCategoryApproval: vi.fn().mockResolvedValue(1),
  getCategoryApprovals: vi.fn().mockResolvedValue({ requests: [], total: 0 }),
  updateCategoryApprovalStatus: vi.fn().mockResolvedValue(undefined),
  getCategoryApprovalById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, userId: 2, categoryName: "Test Cat", status: "pending" };
    return null;
  }),
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
  notifyUsersOfNewOffer: vi.fn().mockResolvedValue(undefined),
  getUserNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
  getRecommendedBusinesses: vi.fn().mockResolvedValue([]),
  getBusinessSubmissionById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      submission: { id: 1, businessName: "Test Submission", userId: 2, sportCategoryId: 1, businessTypeId: 1, contactName: "Jane", contactEmail: "jane@test.com", status: "pending" },
      sportCategory: { id: 1, name: "Cycling" },
      businessType: { id: 1, name: "Coach" },
    };
    return null;
  }),
  getUsersWhoSavedBusiness: vi.fn().mockResolvedValue([]),
  createNotification: vi.fn().mockResolvedValue(1),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  updateUserNotificationPreference: vi.fn().mockResolvedValue(undefined),
  // New functions for notifications and account deletion
  getUserById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, name: "Test User 1", email: "user1@test.com", contactName: "Test Contact 1", notificationPreference: "both" };
    if (id === 2) return { id: 2, name: "Test User 2", email: "user2@test.com", contactName: "Test Contact 2", notificationPreference: "in_app_only" };
    return null;
  }),
  notifyUser: vi.fn().mockResolvedValue(undefined),
  softDeleteUser: vi.fn().mockResolvedValue(undefined),
  adminDeleteUser: vi.fn().mockResolvedValue(undefined),
  adminHideUser: vi.fn().mockResolvedValue(undefined),
  adminRestoreUser: vi.fn().mockResolvedValue(undefined),
  getAllUsersForAdmin: vi.fn().mockResolvedValue([
    { id: 1, name: "Admin User", email: "admin@test.com", contactName: "Admin", role: "admin", accountType: "business_owner", isDeleted: false, deletedBy: null, createdAt: new Date(), lastSignedIn: new Date() },
    { id: 2, name: "Regular User", email: "user@test.com", contactName: "Regular", role: "user", accountType: "consumer", isDeleted: false, deletedBy: null, createdAt: new Date(), lastSignedIn: new Date() },
  ]),
  // Admin test profiles
  createAdminTestProfile: vi.fn().mockResolvedValue(1),
  getAdminTestProfiles: vi.fn().mockResolvedValue([
    { id: 1, adminUserId: 1, profileName: "Pro Cyclist", displayName: "Alex", sportIds: [1], city: "Boulder", state: "CO", country: "USA", region: "Rocky Mountain", hub: null, goals: "Test cycling flows", interests: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getAdminTestProfileById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, adminUserId: 1, profileName: "Pro Cyclist", displayName: "Alex", sportIds: [1], city: "Boulder", state: "CO", country: "USA", region: "Rocky Mountain", hub: null, goals: "Test cycling flows", interests: null, createdAt: new Date(), updatedAt: new Date() };
    return null;
  }),
  deleteAdminTestProfile: vi.fn().mockResolvedValue(true),
  updateAdminTestProfile: vi.fn().mockResolvedValue(true),
}));

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/test-file.png", key: "uploads/support-ticket/1/abc123.png" }),
}));

// Mock the notification core module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
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
    accountType: "business_owner" as const,
    onboardingComplete: true,
    contactName: `Test Contact ${userId}`,
    notificationPreference: "both",
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
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

function createAdminContext(userId = 1): TrpcContext {
  return createAuthContext(userId, "admin");
}

// ─── Contact Name Tests ──────────────────────────────────────

describe("contactName", () => {
  it("should update user contact name via userProfile.update", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    await caller.userProfile.update({ contactName: "New Contact Name" });
    expect(db.updateUserProfile).toHaveBeenCalledWith(1, expect.objectContaining({ contactName: "New Contact Name" }));
  });

  it("auth.me should return contactName in user object", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toHaveProperty("contactName", "Test Contact 1");
  });

  it("should return contactName in userProfile.get", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.userProfile.get();
    expect(result).toHaveProperty("contactName", "Test Contact 1");
  });
});

// ─── Notification Tests ──────────────────────────────────────

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create notification when business is claimed", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    await caller.business.claim({ businessId: 2 });
    expect(db.claimBusiness).toHaveBeenCalledWith(2, 1);
    expect(db.notifyUser).toHaveBeenCalled();
  });

  it("should create notification when admin reviews a business", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    await caller.admin.reviewBusiness({ businessId: 1, status: "approved" });
    expect(db.approveOrRejectBusiness).toHaveBeenCalledWith(1, "approved", undefined);
  });

  it("should return user notifications", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notification.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should mark notification as read", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    await caller.notification.markRead({ notificationId: 1 });
    expect(db.markNotificationRead).toHaveBeenCalledWith(1, 1);
  });

  it("should mark all notifications as read", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    await caller.notification.markAllRead();
    expect(db.markAllNotificationsRead).toHaveBeenCalledWith(1);
  });

  it("should return unread notification count", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notification.unreadCount();
    expect(typeof result).toBe("number");
  });
});

// ─── Account Deletion Tests ──────────────────────────────────────

describe("account deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("user can delete their own account", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.userProfile.deleteAccount();
    expect(result).toEqual({ success: true });
    expect(db.softDeleteUser).toHaveBeenCalledWith(1, "self");
  });

  it("admin can list all users", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.listUsers();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("admin can hide a user", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.hideUser({ userId: 2 });
    expect(result).toEqual({ success: true });
    expect(db.adminHideUser).toHaveBeenCalledWith(2);
  });

  it("admin can restore a hidden user", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.restoreUser({ userId: 2 });
    expect(result).toEqual({ success: true });
    expect(db.adminRestoreUser).toHaveBeenCalledWith(2);
  });

  it("admin can delete a user with data retention", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.deleteUser({ userId: 2, retainActivityData: true });
    expect(result).toEqual({ success: true });
    expect(db.adminDeleteUser).toHaveBeenCalledWith(2, true);
  });

  it("admin can delete a user without data retention", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.deleteUser({ userId: 2, retainActivityData: false });
    expect(result).toEqual({ success: true });
    expect(db.adminDeleteUser).toHaveBeenCalledWith(2, false);
  });

  it("non-admin cannot list users", async () => {
    const caller = appRouter.createCaller(createAuthContext(2, "user"));
    await expect(caller.admin.listUsers()).rejects.toThrow();
  });

  it("non-admin cannot delete users", async () => {
    const caller = appRouter.createCaller(createAuthContext(2, "user"));
    await expect(caller.admin.deleteUser({ userId: 1, retainActivityData: true })).rejects.toThrow();
  });
});

// ─── Dual Verification Tests ──────────────────────────────────────

describe("dual verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dashboard analytics includes verifiedScorecard", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.analytics({ businessId: 1 });
    expect(result).toHaveProperty("verifiedScorecard");
    expect(result.verifiedScorecard).toHaveProperty("totalVerified", 3);
    expect(result.verifiedScorecard).toHaveProperty("verificationRate", 60);
  });

  it("can honor a referral with incentive amount", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    // Mock getBusinessById to return biz owned by user 1 for receivingBusinessId=2
    (db.getBusinessById as any).mockImplementation(async (id: number) => {
      if (id === 2) return {
        business: { id: 2, name: "Receiving Biz", claimedByUserId: 1, isActive: true, approvalStatus: "approved" },
        sportCategory: { id: 1, name: "Cycling" },
        businessType: { id: 1, name: "Coach" },
      };
      return null;
    });
    await caller.referralVerification.honor({
      referralId: 1,
    });
    expect(db.markReferralHonored).toHaveBeenCalled();
  });

  it("can cash out a referral with confirmed amount", async () => {
    const db = await import("./db");
    (db.getReferralById as any).mockResolvedValueOnce({
      id: 1, referringBusinessId: 1, receivingBusinessId: 2, offerId: 1, status: "honored",
      customerName: "Test", approvalStatus: "approved",
    });
    // Mock getBusinessById to return biz owned by user 1 for referringBusinessId=1
    (db.getBusinessById as any).mockImplementation(async (id: number) => {
      if (id === 1) return {
        business: { id: 1, name: "Referring Biz", claimedByUserId: 1, isActive: true, approvalStatus: "approved" },
        sportCategory: { id: 1, name: "Cycling" },
        businessType: { id: 1, name: "Coach" },
      };
      return null;
    });
    const caller = appRouter.createCaller(createAuthContext());
    await caller.referralVerification.cashout({
      referralId: 1,
      amount: "50",
    });
    expect(db.markReferralCashedOut).toHaveBeenCalled();
  });

  it("can dispute a referral", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    // Mock getBusinessById to return biz owned by user 1 for referringBusinessId=1
    (db.getBusinessById as any).mockImplementation(async (id: number) => {
      if (id === 1) return {
        business: { id: 1, name: "Referring Biz", claimedByUserId: 1, isActive: true, approvalStatus: "approved" },
        sportCategory: { id: 1, name: "Cycling" },
        businessType: { id: 1, name: "Coach" },
      };
      return null;
    });
    await caller.referralVerification.dispute({
      referralId: 1,
      reason: "Amount mismatch",
    });
    expect(db.disputeReferral).toHaveBeenCalled();
  });
});

// ─── Email Module Tests ──────────────────────────────────────

describe("email module", () => {
  it("email module exports sendNotificationEmail function", async () => {
    const email = await import("./email");
    expect(typeof email.sendNotificationEmail).toBe("function");
  });
});

// ─── Admin Test Profiles Tests ──────────────────────────────────────

describe("admin test profiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("admin can create a test profile", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.createTestProfile({
      profileName: "Trail Runner - Aspen",
      displayName: "Sam Runner",
      sportIds: [2],
      city: "Aspen",
      state: "CO",
      country: "USA",
      region: "Rocky Mountain",
    });
    expect(result).toHaveProperty("profileId", 1);
    expect(result).toHaveProperty("success", true);
    expect(db.createAdminTestProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 1,
        profileName: "Trail Runner - Aspen",
        displayName: "Sam Runner",
      })
    );
  });

  it("admin can list their test profiles", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.listTestProfiles();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("profileName", "Pro Cyclist");
  });

  it("admin can get a specific test profile", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.getTestProfile({ id: 1 });
    expect(result).toHaveProperty("profileName", "Pro Cyclist");
    expect(result).toHaveProperty("displayName", "Alex");
  });

  it("admin can delete a test profile", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.deleteTestProfile({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(db.deleteAdminTestProfile).toHaveBeenCalledWith(1, 1);
  });

  it("admin can update a test profile", async () => {
    const db = await import("./db");
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.updateTestProfile({
      id: 1,
      profileName: "Updated Cyclist",
    });
    expect(result).toEqual({ success: true });
    expect(db.updateAdminTestProfile).toHaveBeenCalledWith(1, 1, expect.objectContaining({ profileName: "Updated Cyclist" }));
  });

  it("non-admin cannot create test profiles", async () => {
    const caller = appRouter.createCaller(createAuthContext(2, "user"));
    await expect(
      caller.admin.createTestProfile({ profileName: "Hacker Profile" })
    ).rejects.toThrow();
  });

  it("non-admin cannot list test profiles", async () => {
    const caller = appRouter.createCaller(createAuthContext(2, "user"));
    await expect(caller.admin.listTestProfiles()).rejects.toThrow();
  });

  it("non-admin cannot delete test profiles", async () => {
    const caller = appRouter.createCaller(createAuthContext(2, "user"));
    await expect(caller.admin.deleteTestProfile({ id: 1 })).rejects.toThrow();
  });
});

// ─── File Upload Tests ──────────────────────────────────────

describe("file upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authenticated user can upload an image", async () => {
    const storage = await import("./storage");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.upload.image({
      fileName: "screenshot.png",
      fileBase64: btoa("fake-image-data"),
      mimeType: "image/png",
      fileSize: 1024,
      purpose: "support-ticket",
    });
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("url");
    expect(storage.storagePut).toHaveBeenCalled();
  });

  it("rejects unsupported file types", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.upload.image({
        fileName: "malware.exe",
        fileBase64: btoa("fake-data"),
        mimeType: "application/x-msdownload",
        fileSize: 1024,
      })
    ).rejects.toThrow(/not allowed/);
  });

  it("rejects files exceeding size limit", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.upload.image({
        fileName: "huge.png",
        fileBase64: btoa("fake-data"),
        mimeType: "image/png",
        fileSize: 11 * 1024 * 1024, // 11MB
      })
    ).rejects.toThrow();
  });

  it("allows PDF uploads for support tickets", async () => {
    const storage = await import("./storage");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.upload.image({
      fileName: "document.pdf",
      fileBase64: btoa("fake-pdf-data"),
      mimeType: "application/pdf",
      fileSize: 2048,
      purpose: "support-ticket",
    });
    expect(result).toHaveProperty("success", true);
    expect(storage.storagePut).toHaveBeenCalled();
  });

  it("unauthenticated user cannot upload", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.upload.image({
        fileName: "test.png",
        fileBase64: btoa("fake"),
        mimeType: "image/png",
        fileSize: 100,
      })
    ).rejects.toThrow();
  });
});
