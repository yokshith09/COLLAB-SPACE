import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, TeamMember, Task, Project } from "@/lib/models";

// Use an Edge-compatible function or mock the AI generation
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
  const { projectId, description } = await req.json();
  
  const membership = await TeamMember.findOne({ userId: user._id, projectId });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  // In a real scenario, you'd call the OpenAI or Anthropic API here.
  // We'll simulate the AI breaking down the description into tasks.
  
  const tasksToCreate = [
    {
      title: "Initialize Project Repository",
      description: "Set up the initial codebase, configure linters, and push to GitHub.",
    },
    {
      title: "Design Database Schema",
      description: "Map out the required collections and relationships for the project.",
    },
    {
      title: "Implement Authentication",
      description: "Set up user login, registration, and secure session management.",
    },
    {
      title: "Build Core UI Components",
      description: "Develop the primary React components based on the design specifications.",
    },
    {
      title: "API Route Integration",
      description: "Connect the frontend UI to the backend endpoints.",
    }
  ];

  const createdTasks = [];

  for (const t of tasksToCreate) {
    const task = await Task.create({
      title: t.title,
      description: t.description,
      projectId,
      status: "TODO"
    });
    createdTasks.push({ ...task.toObject(), id: task._id.toString() });
  }

  return NextResponse.json({ tasks: createdTasks }, { status: 201 });
}
