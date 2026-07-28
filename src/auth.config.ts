import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    {
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Note: This would require prisma import - keeping it here as placeholder
        // const { prisma } = require("@/lib/prisma");
        // const { bcrypt } = require("bcryptjs");

        // For now, return null - requires actual database implementation
        return null;
      },
    },
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
} satisfies NextAuthConfig;
