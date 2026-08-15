import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email as string });
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password);
          if (!valid) return null;
          return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email, 
            image: user.avatar 
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
