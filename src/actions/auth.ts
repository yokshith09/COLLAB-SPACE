"use server";

import { prisma } from "@/lib/prisma";
import { getDatabaseDiagnostic, getSafeDatabaseErrorLog } from "@/lib/database-diagnostics";
import bcrypt from "bcryptjs";

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
    const diagnostic = getDatabaseDiagnostic(error);
    console.error("Registration error:", getSafeDatabaseErrorLog(error));
    return { error: diagnostic.message };
  }
}
