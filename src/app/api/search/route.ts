import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Project } from "@/lib/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const domain = searchParams.get("domain");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  if (!query) return NextResponse.json({ results: [] });
  await connectDB();
  const filter: any = {
    status: { $nin: ["CANCELLED", "COMPLETED"] },
    isPrivate: false,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { problemStatement: { $regex: query, $options: "i" } },
      { requiredSkills: query },
    ],
  };
  if (domain) filter.domain = domain;
  if (status) filter.status = status;
  const [projects, total] = await Promise.all([
    Project.find(filter).populate("ownerId", "name avatar").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);
  const results = (projects as any[]).map((p) => ({
    ...p, id: p._id.toString(),
    owner: p.ownerId ? { name: (p.ownerId as any).name, avatar: (p.ownerId as any).avatar } : null,
  }));
  return NextResponse.json({ results, total, page, limit, totalPages: Math.ceil(total / limit) });
}
