import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are added in auth.ts to avoid Node-specific imports in Middleware
  callbacks: {
    async jwt({ token, user }): Promise<any> {
      try {
        if (user) {
          console.log("[NextAuth] Generating JWT with user payload...");
          token.accessToken = (user as { accessToken?: string }).accessToken;
          token.user = user;
        }
        return token;
      } catch (error) {
        console.error("[NextAuth] Error in JWT callback:", error);
        throw error;
      }
    },
    async session({ session, token }): Promise<any> {
      try {
        console.log("[NextAuth] Instantiating session from token...");
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
        session.user = token.user as any;
        return session;
      } catch (error) {
        console.error("[NextAuth] Error in Session callback:", error);
        throw error;
      }
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  secret: "9eb87e82b79a8e2b8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f8e8f",
} satisfies NextAuthConfig;
