"use server";

import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { getDatabaseDiagnostic, getSafeDatabaseErrorLog } from "@/lib/database-diagnostics";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Please fill in every field." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return { error: "An account already exists for this email." };

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    return { success: true };
  } catch (error) {
    const diagnostic = getDatabaseDiagnostic(error);
    console.error("Registration error:", getSafeDatabaseErrorLog(error));
    return { error: diagnostic.message };
  }
}

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(email: string, password: string, redirectTo: string) {
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "The email or password does not match an account." };
        case "CallbackRouteError":
          return { error: "The email or password does not match an account." };
        default:
          return { error: "Authentication service failed. Check logs." };
      }
    }
    // Next.js throws navigation errors, so we must rethrow (this handles successful redirect)
    throw error;
  }
}
