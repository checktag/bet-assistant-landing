import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
          
          const params = new URLSearchParams();
          params.append('username', credentials?.email as string);
          params.append('password', credentials?.password as string);

          console.log(`[NextAuth] Attempting login to: ${API_URL}/login`);
          const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
          });

          if (!res.ok) {
            let errorDetail = "Invalid credentials.";
            try {
               const errorData = await res.json();
               errorDetail = errorData?.detail || errorDetail;
            } catch (e) {}
            console.error(`[NextAuth] API responds with status: ${res.status} - ${errorDetail}`);
            throw new Error(errorDetail);
          }

          const data = await res.json();

          if (data.access_token) {
            console.log(`[NextAuth] Login successful. Fetching user info...`);
            const userRes = await fetch(`${API_URL}/me`, {
              headers: { Authorization: `Bearer ${data.access_token}` }
            });
            
            if (userRes.ok) {
              const userData = await userRes.json();
              return { ...userData, accessToken: data.access_token, id: userData.email };
            }
          }
          return null;
        } catch (error: any) {
          console.error("[NextAuth] Native fetch error during authorize:", error);
          throw new Error(error.message || "Failed to authenticate");
        }
      },
    }),
  ],
});
