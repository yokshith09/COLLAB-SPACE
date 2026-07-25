import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, bio, githubUrl, linkedinUrl, avatar, skills, domains } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name?.trim() || user.name,
      bio: bio?.trim() || null,
      githubUrl: githubUrl?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      avatar: avatar || user.avatar,
      skills: skills
        ? {
            set: skills.map((name: string) => ({ name })),
          }
        : undefined,
      domains: domains
        ? {
            set: domains.map((name: string) => ({ name })),
          }
        : undefined,
    },
    include: { skills: true, domains: true },
  });

  return NextResponse.json(updated);
}