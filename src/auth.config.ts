import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are added in auth.ts to avoid Node-specific imports in Middleware
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnPremiumQuant = nextUrl.pathname.startsWith("/premiumquant");
      
      if (isOnDashboard || isOnPremiumQuant) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async jwt({ token, user, trigger, session }): Promise<any> {
      try {
        if (user) {
          token.accessToken = (user as { accessToken?: string }).accessToken;
          token.user = user;
          token.lastRefreshed = Date.now();
        }

        // If manual update is triggered (e.g. from client side)
        if (trigger === "update" && session) {
          token.user = { ...(token.user as any), ...session.user };
          token.lastRefreshed = Date.now();
        }

        // Background sync interval (300 seconds / 5 mins)
        // Manual updates (credits/onboarding) now use 'trigger: update' for instant sync
        const now = Date.now();
        const REFRESH_THRESHOLD = 300000;
        
        if (token.accessToken && (!token.lastRefreshed || (now - (token.lastRefreshed as number)) > REFRESH_THRESHOLD)) {
          const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io").replace(/\/$/, "");
          try {
            const res = await fetch(`${API_URL}/me`, {
              headers: { Authorization: `Bearer ${token.accessToken}` }
            });
            if (res.ok) {
              const userData = await res.json();
              token.user = { ...userData, accessToken: token.accessToken };
              token.lastRefreshed = now;
            } else if (res.status === 401) {
              return null;
            }
          } catch (e) {
            console.error("[NextAuth] Background sync failed:", e);
          }
        }

        return token;
      } catch (error) {
        console.error("[NextAuth] Error in JWT callback:", error);
        return token;
      }
    },
    async session({ session, token }): Promise<any> {
      try {
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
        session.user = token.user as any;
        return session;
      } catch (error) {
        console.error("[NextAuth] Error in Session callback:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
