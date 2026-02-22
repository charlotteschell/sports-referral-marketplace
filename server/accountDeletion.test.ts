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
  updateUserContactName: vi.fn().mockResolvedValue(undefined),
  businessConfirmClaimSavings: vi.fn().mockResolvedValue(undefined),
  athleteConfirmReferralPayment: vi.fn().mockResolvedValue(undefined),
  clearSampleDataForBusiness: vi.fn().mockResolvedValue(undefined),
  // Account deletion functions
  softDeleteUser: vi.fn().mockResolvedValue({ success: true }),
  purgeUserActivityData: vi.fn().mockResolvedValue({ success: true }),
  hardDeleteUserBusinesses: vi.fn().mockResolvedValue({ deleted: 0 }),
  getAllUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
  toggleUserHidden: vi.fn().mockResolvedValue(undefined),
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
    contactName: "Admin Charlotte",
    ...overrides,
  });
}

// ─── Self-Service Account Deletion ──────────────────────────────

describe("User Self-Service Account Deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a regular user to delete their own account with correct confirmation", async () => {
    const db = await import("./db");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.userProfile.deleteAccount({ confirmText: "DELETE MY ACCOUNT" });

    expect(result.success).toBe(true);
    expect(db.softDeleteUser).toHaveBeenCalledWith(1, "self");
  });

  it("rejects deletion with wrong confirmation text", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.userProfile.deleteAccount({ confirmText: "wrong text" as any })
    ).rejects.toThrow();
  });

  it("prevents admin from deleting their own account via self-service", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.userProfile.deleteAccount({ confirmText: "DELETE MY ACCOUNT" })
    ).rejects.toThrow("Admin accounts cannot be self-deleted");
  });

  it("notifies the platform owner when a user deletes their account", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.userProfile.deleteAccount({ confirmText: "DELETE MY ACCOUNT" });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("User Account Deleted"),
      })
    );
  });
});

// ─── Admin Account Deletion ──────────────────────────────

describe("Admin User Deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to delete a user with activity data retained", async () => {
    const db = await import("./db");
    (db.getUserById as any).mockResolvedValueOnce({
      id: 5,
      name: "Target User",
      email: "target@test.com",
      contactName: "Target",
      isDeleted: false,
      role: "user",
      accountType: "business_owner",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteUser({ userId: 5, retainActivityData: true });

    expect(result.success).toBe(true);
    expect(result.message).toContain("preserved");
    expect(db.softDeleteUser).toHaveBeenCalledWith(5, "admin");
    expect(db.purgeUserActivityData).not.toHaveBeenCalled();
  });

  it("allows admin to delete a user and purge all activity data", async () => {
    const db = await import("./db");
    (db.getUserById as any).mockResolvedValueOnce({
      id: 5,
      name: "Target User",
      email: "target@test.com",
      contactName: "Target",
      isDeleted: false,
      role: "user",
      accountType: "consumer",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteUser({ userId: 5, retainActivityData: false });

    expect(result.success).toBe(true);
    expect(result.message).toContain("permanently deleted");
    expect(db.softDeleteUser).toHaveBeenCalledWith(5, "admin");
    expect(db.purgeUserActivityData).toHaveBeenCalledWith(5);
  });

  it("prevents admin from deleting themselves", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.deleteUser({ userId: 99, retainActivityData: true })
    ).rejects.toThrow("You cannot delete your own admin account");
  });

  it("rejects deletion of already-deleted user", async () => {
    const db = await import("./db");
    (db.getUserById as any).mockResolvedValueOnce({
      id: 5,
      name: "Deleted Account",
      email: null,
      isDeleted: true,
      role: "user",
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.deleteUser({ userId: 5, retainActivityData: true })
    ).rejects.toThrow("User is already deleted");
  });

  it("rejects deletion of non-existent user", async () => {
    const db = await import("./db");
    (db.getUserById as any).mockResolvedValueOnce(null);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.deleteUser({ userId: 999, retainActivityData: true })
    ).rejects.toThrow("User not found");
  });

  it("prevents non-admin from deleting users", async () => {
    const ctx = createAuthContext(); // regular user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.deleteUser({ userId: 5, retainActivityData: true })
    ).rejects.toThrow();
  });
});

// ─── Admin User Visibility Toggle ──────────────────────────────

describe("Admin Toggle User Visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to hide a user", async () => {
    const db = await import("./db");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.toggleUserVisibility({ userId: 5, isHidden: true });

    expect(result.success).toBe(true);
    expect(db.toggleUserHidden).toHaveBeenCalledWith(5, true);
  });

  it("allows admin to restore a hidden user", async () => {
    const db = await import("./db");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.toggleUserVisibility({ userId: 5, isHidden: false });

    expect(result.success).toBe(true);
    expect(db.toggleUserHidden).toHaveBeenCalledWith(5, false);
  });

  it("prevents admin from hiding themselves", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.toggleUserVisibility({ userId: 99, isHidden: true })
    ).rejects.toThrow("You cannot hide your own admin account");
  });

  it("prevents non-admin from toggling user visibility", async () => {
    const ctx = createAuthContext(); // regular user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.toggleUserVisibility({ userId: 5, isHidden: true })
    ).rejects.toThrow();
  });
});

// ─── Admin User Listing ──────────────────────────────

describe("Admin User Listing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to list all users", async () => {
    const db = await import("./db");
    (db.getAllUsers as any).mockResolvedValueOnce({
      users: [
        { id: 1, name: "User 1", email: "u1@test.com", isDeleted: false },
        { id: 2, name: "User 2", email: "u2@test.com", isDeleted: false },
      ],
      total: 2,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.allUsers({});

    expect(result.users).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(db.getAllUsers).toHaveBeenCalled();
  });

  it("allows admin to search users", async () => {
    const db = await import("./db");
    (db.getAllUsers as any).mockResolvedValueOnce({
      users: [{ id: 1, name: "Charlotte", email: "charlotte@test.com", isDeleted: false }],
      total: 1,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.allUsers({ search: "Charlotte" });

    expect(result.users).toHaveLength(1);
    expect(db.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ search: "Charlotte" }));
  });

  it("allows admin to include deleted users in listing", async () => {
    const db = await import("./db");
    (db.getAllUsers as any).mockResolvedValueOnce({
      users: [],
      total: 0,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.admin.allUsers({ includeDeleted: true });

    expect(db.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ includeDeleted: true }));
  });

  it("prevents non-admin from listing users", async () => {
    const ctx = createAuthContext(); // regular user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.allUsers({})
    ).rejects.toThrow();
  });
});
