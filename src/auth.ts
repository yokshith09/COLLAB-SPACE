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
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await prisma.user
          .findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              avatar: true,
            },
          })
          .catch((error) => {
            console.error("AUTH_DATABASE_ERROR:", error);
            throw error;
          });

        if (!user?.password) return null;

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return null;

        await prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => null);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],
});
