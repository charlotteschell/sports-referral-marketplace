import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

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
        isClaimed: z.boolean().optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }))
      .query(async ({ input }) => {
        return db.searchBusinesses(input);
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
        });
        return { id, slug: uniqueSlug };
      }),

    claim: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const biz = await db.getBusinessById(input.businessId);
        if (!biz) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        if (biz.business.isClaimed) throw new TRPCError({ code: "CONFLICT", message: "Business already claimed" });
        await db.claimBusiness(input.businessId, ctx.user.id);
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
  }),

  // ─── Referral Offers ────────────────────────────────────────
  referralOffer: router({
    getByBusiness: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return db.getReferralOffersByBusiness(input.businessId);
      }),

    allActive: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllActiveReferralOffers(input?.limit, input?.offset);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
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
        // Verify user owns the referring business
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
