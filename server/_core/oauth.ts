import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Parse state for returnPath
      let redirectTo = "/";
      try {
        const decodedState = Buffer.from(state, 'base64').toString('utf-8');
        // State can be either a plain redirectUri string or a JSON object with returnPath
        if (decodedState.startsWith('{')) {
          const parsed = JSON.parse(decodedState);
          if (parsed.returnPath) {
            redirectTo = parsed.returnPath;
          }
        }
      } catch {
        // If parsing fails, just redirect to home
      }

      // Check if user needs onboarding (new user without completed onboarding)
      const dbUser = await db.getUserByOpenId(userInfo.openId);
      if (dbUser && !dbUser.onboardingComplete && redirectTo === "/") {
        redirectTo = "/onboarding";
      }

      // Auto-link any pending business submissions matching this user's email
      if (dbUser && dbUser.email) {
        try {
          const linked = await db.linkPendingSubmissionsToUser(dbUser.id, dbUser.email);
          if (linked > 0) {
            console.log(`[OAuth] Auto-linked ${linked} pending submission(s) to user ${dbUser.id} (${dbUser.email})`);
            // Set account type to business_owner
            if (dbUser.accountType !== 'business_owner') {
              await db.updateUserAccountType(dbUser.id, 'business_owner');
            }
            // Auto-complete onboarding since they already submitted a business
            if (!dbUser.onboardingComplete) {
              await db.markOnboardingComplete(dbUser.id);
              console.log(`[OAuth] Auto-completed onboarding for user ${dbUser.id} (had linked submissions)`);
            }
            // Auto-check the 'addBusiness' welcome step since they already submitted one
            await db.updateWelcomeProgress(dbUser.id, 'addBusiness');
            // Redirect to dashboard instead of onboarding
            redirectTo = '/dashboard';
          }
        } catch (e) {
          console.warn('[OAuth] Failed to auto-link pending submissions:', e);
        }
      }

      res.redirect(302, redirectTo);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
