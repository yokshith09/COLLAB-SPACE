import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "credentials",
      name: "Email and Password",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Database call - placeholder implementation
        // Should query the database for user by email
        // TODO: Implement actual database lookup
        // const needle = await prisma.user.findUnique({
        //   where: { email: credentials.email as string },
        // });

        return null; // Return null for now (requires actual database integration)
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
