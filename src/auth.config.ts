import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are added in auth.ts to avoid Node-specific imports in Middleware
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
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

        // Periodically refresh user data from backend (every 60 seconds)
        // This ensures credits and premium status stay in sync
        const now = Date.now();
        if (token.accessToken && (!token.lastRefreshed || (now - (token.lastRefreshed as number)) > 60000)) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
          try {
            const res = await fetch(`${API_URL}/me`, {
              headers: { Authorization: `Bearer ${token.accessToken}` }
            });
            if (res.ok) {
              const userData = await res.json();
              token.user = { ...userData, accessToken: token.accessToken };
              token.lastRefreshed = now;
            } else if (res.status === 401) {
              // Sign out if token is invalid
              return null;
            }
          } catch (e) {
            console.error("[NextAuth] Refresh fetch failed:", e);
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
