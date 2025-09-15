import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";
import { createAccount } from "./account";
import { ZodError } from "zod";

const providers: Provider[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
      }
  }),
  Credentials({
    credentials: {
      email: { label: "Email Address", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (c) => {
      try {
        const { email, password } = await signInSchema.parseAsync(c);
        const res = await createAccount(email, password);
        if (!res) {
          throw new Error("Invalid credentials.");
        }
        return {
          id: String(res.id),
          name: String(c.email),
          email: String(c.email),
          id_token: String(res.id_token),
        };
      } catch (e) {
        if (e instanceof ZodError) {
          console.error(e.message);
          return null;
        }
        console.error(e);
        return null;
      }
    },
  }),
];

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('Missing environment variable "GOOGLE_CLIENT_ID"');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Missing environment variable "GOOGLE_CLIENT_SECRET"');
}

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
  });

export default {
  providers,
  callbacks: {
    authorized({ auth }) {
      const isLoggedIn = !!auth;
      return isLoggedIn;
    },
    async jwt({ token, account, user }) {
      if (account?.id_token) {
        token.accessToken = account.id_token;
      }
      if (user?.id_token) {
        token.accessToken = user.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
