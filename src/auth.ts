import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
          
          // FastAPI's OAuth2PasswordRequestForm requires x-www-form-urlencoded
          const params = new URLSearchParams();
          params.append('username', credentials?.email as string);
          params.append('password', credentials?.password as string);

          const res = await axios.post(`${API_URL}/login`, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });

          if (res.data.access_token) {
            // Fetch user info with the token
            const userRes = await axios.get(`${API_URL}/me`, {
              headers: { Authorization: `Bearer ${res.data.access_token}` }
            });
            return { ...userRes.data, accessToken: res.data.access_token, id: userRes.data.email };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
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
});
