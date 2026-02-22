import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

// Admin-only procedure helper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Categories & Types ─────────────────────────────────────
  categories: router({
    sportCategories: publicProcedure.query(async () => {
      return db.getAllSportCategories();
    }),
    businessTypes: publicProcedure.query(async () => {
      return db.getAllBusinessTypes();
    }),
    regions: publicProcedure.query(async () => {
      return db.getDistinctRegions();
    }),
    hubs: publicProcedure
      .input(z.object({ region: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getHubsByRegion(input?.region);
      }),
  }),

  // ─── Directory Stats ────────────────────────────────────────
  stats: router({
    directory: publicProcedure.query(async () => {
      return db.getDirectoryStats();
    }),
  }),

  // ─── Business Directory ─────────────────────────────────────
  business: router({
    search: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        sportCategoryId: z.number().optional(),
        businessTypeId: z.number().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        hub: z.string().optional(),
        isClaimed: z.boolean().optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }))
      .query(async ({ input }) => {
        return db.searchBusinesses(input);
      }),

    autocomplete: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => {
        return db.searchBusinessesAutocomplete(input.query);
      }),

    featured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(30).optional() }).optional())
      .query(async ({ input }) => {
        return db.getFeaturedBusinesses(input?.limit ?? 30);
      }),

    offersForBusinesses: publicProcedure
      .input(z.object({ businessIds: z.array(z.number()).max(50) }))
      .query(async ({ input }) => {
        return db.getOffersForBusinessIds(input.businessIds);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const result = await db.getBusinessBySlug(input.slug);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        return result;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await db.getBusinessById(input.id);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        return result;
      }),

    myBusinesses: protectedProcedure.query(async ({ ctx }) => {
      return db.getBusinessesByOwner(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        sportCategoryId: z.number(),
        businessTypeId: z.number(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        address: z.string().optional(),
        region: z.string().optional(),
        hub: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
        const id = await db.createBusiness({
          ...input,
          slug: uniqueSlug,
          isClaimed: true,
          claimedByUserId: ctx.user.id,
          claimedAt: new Date(),
          approvalStatus: 'pending', // New businesses need admin approval
        });
        // Notify admin
        try {
          await notifyOwner({
            title: `New Business Added: ${input.name}`,
            content: `A new business has been added and needs your approval.\n\nBusiness: ${input.name}\nAdded by: ${ctx.user.name || ctx.user.email || 'Unknown'}\nCity: ${input.city || 'N/A'}, ${input.country || 'N/A'}\n\nPlease review in the Admin Panel.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return { id, slug: uniqueSlug };
      }),

    claim: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        verificationEmail: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        if (biz.business.isClaimed) throw new TRPCError({ code: "CONFLICT", message: "Business already claimed" });
        // Verify email was verified
        const verified = await db.isEmailVerified(input.verificationEmail, 'claim');
        if (!verified) throw new TRPCError({ code: "BAD_REQUEST", message: "Email not verified. Please verify your business email first." });
        await db.claimBusiness(input.businessId, ctx.user.id);
        // Notify admin about claim needing approval
        try {
          await notifyOwner({
            title: `Business Claim Pending: ${biz.business.name}`,
            content: `A business has been claimed and needs your approval.\n\nBusiness: ${biz.business.name}\nClaimed by: ${ctx.user.name || ctx.user.email || 'Unknown'}\nVerification email: ${input.verificationEmail}\nCity: ${biz.business.city || 'N/A'}, ${biz.business.country || 'N/A'}\n\nPlease review in the Admin Panel.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return { success: true, message: 'Your claim has been submitted for admin approval. You will be notified once approved.' };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        sportCategoryId: z.number().optional(),
        businessTypeId: z.number().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        address: z.string().optional(),
        region: z.string().optional(),
        hub: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        logoUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.id);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this business" });
        }
        const { id, ...updateData } = input;
        await db.updateBusiness(id, updateData);
        return { success: true };
      }),

    // Owner: toggle business visibility (hide/show without deleting)
    toggleVisibility: protectedProcedure
      .input(z.object({ businessId: z.number(), isHidden: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.ownerToggleBusinessVisibility(input.businessId, input.isHidden);
        return { success: true };
      }),
  }),

  // ─── Unclaim & Delete Business ──────────────────────────────
  businessActions: router({
    unclaim: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found' });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }
        await db.unclaimBusiness(input.businessId);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found' });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }
        await db.deleteBusiness(input.businessId);
        return { success: true };
      }),
  }),

  // ─── Dashboard Analytics ───────────────────────────────────────
  dashboard: router({
    analytics: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardAnalytics(ctx.user.id);
    }),
  }),

  // ─── Referral Offers ────────────────────────────────────────
  referralOffer: router({
    getByBusiness: publicProcedure
      .input(z.object({
        businessId: z.number(),
        offerType: z.enum(["b2b", "consumer"]).optional(),
      }))
      .query(async ({ input }) => {
        return db.getReferralOffersByBusiness(input.businessId, input.offerType);
      }),

    // Get all offers for owner/admin (including hidden)
    getByBusinessAll: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getReferralOffersByBusinessAll(input.businessId);
      }),

    allActive: publicProcedure
      .input(z.object({
        offerType: z.enum(["b2b", "consumer"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllActiveReferralOffers(input?.offerType, input?.limit, input?.offset);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        offerType: z.enum(["b2b", "consumer"]).default("b2b"),
        incentiveType: z.enum(["percentage", "fixed", "service", "other"]),
        incentiveValue: z.string().optional(),
        incentiveDescription: z.string().optional(),
        termsAndConditions: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const id = await db.createReferralOffer(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        offerType: z.enum(["b2b", "consumer"]).optional(),
        incentiveType: z.enum(["percentage", "fixed", "service", "other"]).optional(),
        incentiveValue: z.string().optional(),
        incentiveDescription: z.string().optional(),
        termsAndConditions: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const offer = await db.getReferralOfferById(input.id);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
        const biz = await db.getBusinessById(offer.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...updateData } = input;
        await db.updateReferralOffer(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const offer = await db.getReferralOfferById(input.id);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
        const biz = await db.getBusinessById(offer.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteReferralOffer(input.id);
        return { success: true };
      }),

    // Owner: toggle offer visibility
    toggleVisibility: protectedProcedure
      .input(z.object({ offerId: z.number(), isHidden: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const offer = await db.getReferralOfferById(input.offerId);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
        const biz = await db.getBusinessById(offer.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.ownerToggleOfferVisibility(input.offerId, input.isHidden);
        return { success: true };
      }),
  }),

  // ─── Business Submissions ──────────────────────────────────
  submission: router({
    submit: publicProcedure
      .input(z.object({
        businessName: z.string().min(1).max(255),
        businessDescription: z.string().optional(),
        sportCategoryId: z.number(),
        businessTypeId: z.number(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        hub: z.string().optional(),
        contactName: z.string().min(1).max(255),
        contactEmail: z.string().min(1).max(320),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        additionalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createBusinessSubmission({
          ...input,
          submittedByUserId: ctx.user?.id ?? null,
        });
        try {
          await notifyOwner({
            title: `New Business Submission: ${input.businessName}`,
            content: `A new business has been submitted for review.\n\nBusiness: ${input.businessName}\nContact: ${input.contactName} (${input.contactEmail})\nCity: ${input.city || 'N/A'}, ${input.country || 'N/A'}\n\nPlease review in the Admin Panel.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return { id };
      }),

    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getBusinessSubmissions(input?.status);
      }),

    review: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['approved', 'rejected']),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const submission = await db.getBusinessSubmissionById(input.id);
        if (!submission) throw new TRPCError({ code: 'NOT_FOUND' });

        await db.updateBusinessSubmissionStatus(input.id, input.status, input.reviewNotes);

        if (input.status === 'approved') {
          const s = submission.submission;
          const slug = s.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
          await db.createBusiness({
            name: s.businessName,
            slug: uniqueSlug,
            description: s.businessDescription,
            shortDescription: s.businessDescription?.substring(0, 200),
            sportCategoryId: s.sportCategoryId,
            businessTypeId: s.businessTypeId,
            city: s.city,
            state: s.state,
            country: s.country,
            region: s.region,
            hub: s.hub,
            phone: s.contactPhone,
            email: s.contactEmail,
            website: s.website,
            instagram: s.instagram,
            facebook: s.facebook,
            isClaimed: false,
            isActive: true,
            approvalStatus: 'approved',
          });
        }
        return { success: true };
      }),
  }),

  // ─── Admin Controls ────────────────────────────────────────
  admin: router({
    // List all businesses (including hidden, pending, etc.)
    allBusinesses: adminProcedure
      .input(z.object({
        approvalStatus: z.string().optional(),
        isHidden: z.boolean().optional(),
        isAdminHidden: z.boolean().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllBusinessesAdmin(input ?? undefined);
      }),

    // Pending approval (claims + new businesses)
    pendingApproval: adminProcedure.query(async () => {
      return db.getBusinessesPendingApproval();
    }),

    // Approve or reject a business
    reviewBusiness: adminProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.enum(['approved', 'rejected']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.approveOrRejectBusiness(input.businessId, input.status, input.notes);
        return { success: true };
      }),

    // Admin: toggle business visibility (take down / restore)
    toggleBusinessVisibility: adminProcedure
      .input(z.object({ businessId: z.number(), isAdminHidden: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.adminToggleBusinessVisibility(input.businessId, input.isAdminHidden);
        return { success: true };
      }),

    // Admin: toggle offer visibility (take down / restore)
    toggleOfferVisibility: adminProcedure
      .input(z.object({ offerId: z.number(), isAdminHidden: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.adminToggleOfferVisibility(input.offerId, input.isAdminHidden);
        return { success: true };
      }),

    // Admin: list all offers (including hidden)
    allOffers: adminProcedure
      .input(z.object({ businessId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllOffersAdmin(input?.businessId);
      }),
  }),

  // ─── Referral Tracking ──────────────────────────────────────
  referral: router({
    send: protectedProcedure
      .input(z.object({
        referringBusinessId: z.number(),
        receivingBusinessId: z.number(),
        referralOfferId: z.number().optional(),
        customerName: z.string().optional(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.referringBusinessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only send referrals from your own business" });
        }
        const id = await db.createReferral({
          ...input,
          referringUserId: ctx.user.id,
        });
        return { id };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "contacted", "converted", "declined", "expired"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateReferralStatus(input.id, input.status);
        return { success: true };
      }),

    sent: protectedProcedure.query(async ({ ctx }) => {
      return db.getReferralsSent(ctx.user.id);
    }),

    received: protectedProcedure.query(async ({ ctx }) => {
      return db.getReferralsReceived(ctx.user.id);
    }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getReferralStats(ctx.user.id);
    }),
  }),

  // ─── Referral Verification ─────────────────────────────────
  referralVerification: router({
    // Receiver marks referral as honored
    honor: protectedProcedure
      .input(z.object({
        referralId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ref = await db.getReferralById(input.referralId);
        if (!ref) throw new TRPCError({ code: 'NOT_FOUND' });
        // Check user owns the receiving business
        const biz = await db.getBusinessById(ref.receivingBusinessId);
        if (!biz || biz.business.claimedByUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the receiving business can honor referrals' });
        }
        await db.markReferralHonored(input.referralId, ctx.user.id, input.notes);
        // Increment platform stats
        await db.incrementPlatformStat('total_referrals_honored');
        return { success: true };
      }),

    // Sender marks that they received the incentive (cashout)
    cashout: protectedProcedure
      .input(z.object({
        referralId: z.number(),
        amount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ref = await db.getReferralById(input.referralId);
        if (!ref) throw new TRPCError({ code: 'NOT_FOUND' });
        // Check user owns the referring business
        const biz = await db.getBusinessById(ref.referringBusinessId);
        if (!biz || biz.business.claimedByUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the referring business can mark cashout' });
        }
        await db.markReferralCashedOut(input.referralId, ctx.user.id, input.amount, input.notes);
        // Increment platform stats
        if (input.amount) {
          await db.incrementPlatformStat('total_incentive_value', Math.round(parseFloat(input.amount) || 0));
        }
        return { success: true };
      }),

    // Dispute a referral
    dispute: protectedProcedure
      .input(z.object({
        referralId: z.number(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const ref = await db.getReferralById(input.referralId);
        if (!ref) throw new TRPCError({ code: 'NOT_FOUND' });
        // Either sender or receiver can dispute
        const sendBiz = await db.getBusinessById(ref.referringBusinessId);
        const recvBiz = await db.getBusinessById(ref.receivingBusinessId);
        const isSender = sendBiz?.business.claimedByUserId === ctx.user.id;
        const isReceiver = recvBiz?.business.claimedByUserId === ctx.user.id;
        if (!isSender && !isReceiver) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.disputeReferral(input.referralId, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Get referrals for a specific business with partner details
    forBusiness: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        direction: z.enum(['sent', 'received']),
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.getReferralsForBusiness(input.businessId, input.direction, input.limit ?? 50);
      }),

    // Get business analytics
    businessAnalytics: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.getBusinessAnalytics(input.businessId);
      }),
  }),

  // ─── Consumer Claims ──────────────────────────────────────────
  consumerClaim: router({
    // Claim an offer
    claim: protectedProcedure
      .input(z.object({
        referralOfferId: z.number(),
        businessId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check offer exists and is active
        const offer = await db.getReferralOfferById(input.referralOfferId);
        if (!offer || !offer.isActive || offer.offerType !== 'consumer') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Consumer offer not found or not active' });
        }
        // Check if already claimed
        const alreadyClaimed = await db.hasUserClaimedOffer(ctx.user.id, input.referralOfferId);
        if (alreadyClaimed) {
          throw new TRPCError({ code: 'CONFLICT', message: 'You have already claimed this offer' });
        }
        const result = await db.createConsumerClaim({
          referralOfferId: input.referralOfferId,
          businessId: input.businessId,
          userId: ctx.user.id,
        });
        // Increment platform stats
        await db.incrementPlatformStat('total_consumer_claims');
        return result;
      }),

    // Verify if business honored the offer
    verify: protectedProcedure
      .input(z.object({
        claimId: z.number(),
        honored: z.boolean(),
        amountSaved: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.verifyConsumerClaim(input.claimId, ctx.user.id, input.honored, input.amountSaved, input.notes);
        // Increment platform stats
        if (input.honored && input.amountSaved) {
          await db.incrementPlatformStat('total_consumer_savings', Math.round(parseFloat(input.amountSaved) || 0));
        }
        return { success: true };
      }),

    // Get my claims
    myClaims: protectedProcedure.query(async ({ ctx }) => {
      return db.getConsumerClaimsByUser(ctx.user.id);
    }),

    // Get claims for a business (business owner view)
    forBusiness: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz || (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.getConsumerClaimsByBusiness(input.businessId);
      }),

    // Get consumer analytics
    myAnalytics: protectedProcedure.query(async ({ ctx }) => {
      return db.getConsumerAnalytics(ctx.user.id);
    }),
  }),

  // ─── Platform Stats ───────────────────────────────────────────
  platformStats: router({
    get: publicProcedure.query(async () => {
      return db.getPlatformStats();
    }),
  }),

  // ─── Partnership Emails ────────────────────────────────────
  partnershipEmail: router({
    send: protectedProcedure
      .input(z.object({
        recipientBusinessId: z.number(),
        senderBusinessId: z.number().optional(),
        subject: z.string().min(1).max(500),
        message: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.recipientBusinessId);
        if (!biz) throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found' });
        const recipientEmail = biz.business.email || 'support@rarelabs.ai';
        const result = await db.sendPartnershipEmail({
          senderUserId: ctx.user.id,
          senderBusinessId: input.senderBusinessId,
          recipientBusinessId: input.recipientBusinessId,
          recipientEmail,
          subject: input.subject,
          message: input.message,
        });
        // Notify owner about the email
        try {
          await notifyOwner({
            title: `Partnership Email: ${input.subject}`,
            content: `A partnership email was sent.\n\nFrom: ${ctx.user.name || ctx.user.email || 'User #' + ctx.user.id}\nTo: ${biz.business.name} (${recipientEmail})\nSubject: ${input.subject}\n\nMessage:\n${input.message}`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        await db.incrementPlatformStat('partnership_emails');
        return { id: result.id, success: true };
      }),

    mySent: protectedProcedure.query(async ({ ctx }) => {
      return db.getPartnershipEmailsSent(ctx.user.id);
    }),
  }),

  // ─── Support Tickets ──────────────────────────────────────────
  supportTicket: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        description: z.string().min(1),
        ticketType: z.enum(['bug', 'feature_request', 'general']),
        screenshotUrls: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createSupportTicket({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || 'unknown@sportconnect.com',
          ...input,
        });
        try {
          await notifyOwner({
            title: `Support Ticket: ${input.title}`,
            content: `New support ticket submitted.\n\nFrom: ${ctx.user.name || ctx.user.email || 'User #' + ctx.user.id}\nType: ${input.ticketType}\nTitle: ${input.title}\n\nDescription:\n${input.description}`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return result;
      }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return db.getSupportTicketsByUser(ctx.user.id);
    }),

    // Admin: list all tickets
    all: adminProcedure.query(async () => {
      return db.getAllSupportTickets();
    }),

    // Admin: update ticket status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['new', 'in_backlog', 'in_progress', 'in_testing', 'done', 'launched']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ticket = await db.getSupportTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: 'NOT_FOUND' });
        await db.updateSupportTicketStatus(input.id, input.status, input.adminNotes);
        // If launched, send congratulation notification
        if (input.status === 'launched' && ticket.userEmail) {
          try {
            await notifyOwner({
              title: `Feature Launched: ${ticket.title}`,
              content: `The feature/fix "${ticket.title}" has been launched!\n\nPlease send a congratulation email to: ${ticket.userEmail}\n\nOriginal request: ${ticket.description?.substring(0, 200)}`,
            });
          } catch (e) {
            console.warn('[Notification] Failed to notify:', e);
          }
        }
        return { success: true };
      }),
  }),

  // ─── Category Approvals ───────────────────────────────────────
  categoryApproval: router({
    submit: protectedProcedure
      .input(z.object({
        categoryType: z.enum(['sport', 'business_type', 'region', 'hub']),
        proposedName: z.string().min(1).max(255),
        parentRegion: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const slug = input.proposedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const result = await db.createCategoryApproval({
          userId: ctx.user.id,
          ...input,
          proposedSlug: slug,
        });
        try {
          await notifyOwner({
            title: `New Category Request: ${input.proposedName}`,
            content: `A new ${input.categoryType} category has been proposed.\n\nName: ${input.proposedName}\nType: ${input.categoryType}\nBy: ${ctx.user.name || ctx.user.email || 'User #' + ctx.user.id}\n${input.parentRegion ? 'Parent Region: ' + input.parentRegion : ''}\n\nPlease review in the Admin Panel.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify:', e);
        }
        return result;
      }),

    // Admin: list pending
    pending: adminProcedure.query(async () => {
      return db.getPendingCategoryApprovals();
    }),

    // Admin: all
    all: adminProcedure.query(async () => {
      return db.getAllCategoryApprovals();
    }),

    // Admin: approve/reject
    review: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['approved', 'rejected']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const approval = await db.getCategoryApprovalById(input.id);
        if (!approval) throw new TRPCError({ code: 'NOT_FOUND' });
        await db.updateCategoryApprovalStatus(input.id, input.status, input.adminNotes);
        // If approved, create the actual category
        if (input.status === 'approved') {
          const slug = approval.proposedSlug || approval.proposedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (approval.categoryType === 'sport') {
            await db.createSportCategory({ name: approval.proposedName, slug });
          } else if (approval.categoryType === 'business_type') {
            await db.createBusinessType({ name: approval.proposedName, slug });
          }
          // For region/hub, they are just string values used in businesses, no separate table needed
        }
        return { success: true };
      }),
  }),

  // ─── Account Type ─────────────────────────────────────────────
  accountType: router({
    set: protectedProcedure
      .input(z.object({
        accountType: z.enum(['consumer', 'business_owner']),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserAccountType(ctx.user.id, input.accountType);
        return { success: true };
      }),
  }),

  // ─── Logo Upload ──────────────────────────────────────────────
  logoUpload: router({
    upload: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        logoData: z.string(), // base64 encoded
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: 'NOT_FOUND' });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the business owner can upload a logo' });
        }
        const { storagePut } = await import('./storage');
        const buffer = Buffer.from(input.logoData, 'base64');
        const ext = input.contentType.includes('png') ? 'png' : input.contentType.includes('svg') ? 'svg' : 'jpg';
        const fileKey = `logos/${input.businessId}-${Date.now()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        await db.updateBusinessLogo(input.businessId, url);
        return { url };
      }),
  }),

  // ─── Brands Carried ───────────────────────────────────────────
  brands: router({
    update: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        brandsCarried: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: 'NOT_FOUND' });
        if (biz.business.claimedByUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.updateBusinessBrands(input.businessId, input.brandsCarried);
        return { success: true };
      }),
  }),

  // ─── Multi-select Search ──────────────────────────────────────
  searchMulti: router({
    search: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        sportCategoryIds: z.array(z.number()).optional(),
        businessTypeIds: z.array(z.number()).optional(),
        regions: z.array(z.string()).optional(),
        hubs: z.array(z.string()).optional(),
        isClaimed: z.boolean().optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }))
      .query(async ({ input }) => {
        return db.searchBusinessesMulti(input);
      }),
  }),

  // ─── Get in Touch (sends to support@rarelabs.ai) ──────────────
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          await notifyOwner({
            title: `Contact Form: ${input.subject}`,
            content: `New contact form submission.\n\nFrom: ${input.name} (${input.email})\nSubject: ${input.subject}\n\nMessage:\n${input.message}\n\nPlease reply to: ${input.email}`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify:', e);
        }
        return { success: true };
      }),
  }),

  // ─── Leaderboard ──────────────────────────────────────────
  leaderboard: router({
    rankings: publicProcedure
      .input(z.object({
        timeframe: z.enum(['all', 'month', 'year']).optional(),
        limit: z.number().min(1).max(50).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getLeaderboard({
          timeframe: input?.timeframe || 'all',
          limit: input?.limit || 20,
        });
      }),

    summary: publicProcedure.query(async () => {
      return db.getLeaderboardSummary();
    }),
  }),

  // ─── Email Verification ────────────────────────────────────
  verification: router({
    sendCode: publicProcedure
      .input(z.object({
        email: z.string().email(),
        businessId: z.number().optional(),
        verificationType: z.enum(['claim', 'submission']),
      }))
      .mutation(async ({ input }) => {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await db.createEmailVerification({
          email: input.email,
          code,
          businessId: input.businessId,
          verificationType: input.verificationType,
          expiresAt,
        });
        // Notify owner with the verification code (in production, send email directly)
        try {
          await notifyOwner({
            title: `Verification Code for ${input.email}`,
            content: `A verification code has been requested.\n\nEmail: ${input.email}\nCode: ${code}\nType: ${input.verificationType}\nExpires: ${expiresAt.toISOString()}\n\nPlease forward this code to the user if needed.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return { success: true, message: 'Verification code sent. Please check your email.' };
      }),

    verifyCode: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().min(4).max(10),
        verificationType: z.enum(['claim', 'submission']),
      }))
      .mutation(async ({ input }) => {
        const verified = await db.verifyEmailCode(input.email, input.code, input.verificationType);
        if (!verified) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired verification code.' });
        }
        return { success: true, message: 'Email verified successfully.' };
      }),
  }),
});

export type AppRouter = typeof appRouter;
