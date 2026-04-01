import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are added in auth.ts to avoid Node-specific imports in Middleware
  callbacks: {
    async jwt({ token, user }): Promise<any> {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }): Promise<any> {
      (session as { accessToken?: string }).accessToken = token.accessToken as string;
      session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
