import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // BYPASS: Always return a mock user regardless of credentials!
        // No database calls are made here.
        return {
          id: "mock-user-123",
          name: "Test User",
          email: "test@example.com",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser",
        };
      },
    }),
  ],
});
