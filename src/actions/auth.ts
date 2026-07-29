"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function getRegistrationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  if (
    code === "P1001" ||
    code === "P2021" ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("ENOTFOUND") ||
    message.includes("Can't reach database")
  ) {
    return "Database connection failed. Check DATABASE_URL in Vercel, then run npx prisma db push.";
  }

  return "We could not create your account. Check the server logs for Registration error.";
}

export async function registerUser(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (existingUser) {
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
          where: { email },
          data: { name, password: hashedPassword },
        });

        return { success: true };
      }

      return { error: "An account already exists for this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: getRegistrationErrorMessage(error) };
  }
}
