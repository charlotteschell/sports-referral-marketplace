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
      .input(z.object({ limit: z.number().min(1).max(12).optional() }).optional())
      .query(async ({ input }) => {
        return db.getFeaturedBusinesses(input?.limit);
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
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        if (biz.business.isClaimed) throw new TRPCError({ code: "CONFLICT", message: "Business already claimed" });
        await db.claimBusiness(input.businessId, ctx.user.id);
        // Notify admin about claim needing approval
        try {
          await notifyOwner({
            title: `Business Claim Pending: ${biz.business.name}`,
            content: `A business has been claimed and needs your approval.\n\nBusiness: ${biz.business.name}\nClaimed by: ${ctx.user.name || ctx.user.email || 'Unknown'}\nCity: ${biz.business.city || 'N/A'}, ${biz.business.country || 'N/A'}\n\nPlease review in the Admin Panel.`,
          });
        } catch (e) {
          console.warn('[Notification] Failed to notify owner:', e);
        }
        return { success: true };
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
});

export type AppRouter = typeof appRouter;
