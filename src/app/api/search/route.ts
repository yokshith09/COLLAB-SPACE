import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const domain = searchParams.get("domain");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const where: any = {
    status: { notIn: ["CANCELLED", "COMPLETED"] },
    isPrivate: false,
  };

  if (domain) where.domain = domain;
  if (status) where.status = status;

  where.OR = [
    { title: { contains: query, mode: "insensitive" } },
    { description: { contains: query, mode: "insensitive" } },
    { problemStatement: { contains: query, mode: "insensitive" } },
    { requiredSkills: { hasSome: [query] } },
  ];

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true, avatar: true } },
        team: { select: { id: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    results: projects,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}